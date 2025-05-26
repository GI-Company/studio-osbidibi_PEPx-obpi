// Basic Node.js Express server for PEPx Backend Simulation
// Chronological Tag: 20250525160000

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer'); // For handling file uploads if needed directly
const fs = require('fs-extra'); // For file system operations
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // Standard Node.js port

// --- Middleware ---
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json({ limit: '50mb' })); // For parsing application/json, increase limit for base64 data
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true })); // For parsing application/x-www-form-urlencoded

// --- PEPx Storage Backend (Simulated on Local File System) ---
// This class will manage files stored on the server's local disk.
class PEPxStorageBackend {
    constructor(storageDirectory = './pepx_data') {
        this.storageDirectory = path.resolve(storageDirectory);
        this.metadataDirectory = path.join(this.storageDirectory, '.metadata');
        fs.ensureDirSync(this.storageDirectory);
        fs.ensureDirSync(this.metadataDirectory);
        console.log(`[PEPxBackend] Storage initialized at: ${this.storageDirectory}`);
    }

    _getMetadataPath(fileId) {
        return path.join(this.metadataDirectory, `${fileId}.json`);
    }

    _getDataPath(fileId) {
        // Store actual file data directly, perhaps in a subdirectory per file for clarity
        const fileDataDir = path.join(this.storageDirectory, fileId);
        fs.ensureDirSync(fileDataDir);
        // We'll use the original filename from metadata for the actual stored file
        return fileDataDir; // The directory where the file will be stored
    }

    async storeFile(metadata, base64Data) {
        const fileId = metadata.id || `file-${Date.now()}-${Math.random().toString(36).substring(2,7)}`;
        metadata.id = fileId; // Ensure ID is part of metadata
        metadata.serverReceived = new Date().toISOString();

        const metadataPath = this._getMetadataPath(fileId);
        const fileDataStorePathDir = this._getDataPath(fileId);
        const actualFilePath = path.join(fileDataStorePathDir, metadata.name);

        try {
            // Convert Base64 back to binary buffer
            const fileBuffer = Buffer.from(base64Data, 'base64');

            await fs.writeFile(actualFilePath, fileBuffer);
            await fs.writeJson(metadataPath, metadata, { spaces: 2 });

            console.log(`[PEPxBackend] Stored file: ${metadata.name} (ID: ${fileId})`);
            return { success: true, fileId: fileId, metadata: metadata };
        } catch (error) {
            console.error(`[PEPxBackend] Error storing file ${fileId}:`, error);
            return { success: false, message: error.message };
        }
    }

    async retrieveFile(fileId) {
        const metadataPath = this._getMetadataPath(fileId);
        try {
            if (!await fs.pathExists(metadataPath)) {
                return { success: false, message: 'File metadata not found.' };
            }
            const metadata = await fs.readJson(metadataPath);
            const actualFilePath = path.join(this._getDataPath(fileId), metadata.name);

            if (!await fs.pathExists(actualFilePath)) {
                return { success: false, message: 'File data not found.' };
            }
            const fileBuffer = await fs.readFile(actualFilePath);
            const base64Data = fileBuffer.toString('base64');

            console.log(`[PEPxBackend] Retrieved file: ${metadata.name} (ID: ${fileId})`);
            return { success: true, metadata, data: base64Data };
        } catch (error) {
            console.error(`[PEPxBackend] Error retrieving file ${fileId}:`, error);
            return { success: false, message: error.message };
        }
    }

    async updateFile(fileId, { metadata: newMetadataChanges, data: newBase64Data }) {
        const metadataPath = this._getMetadataPath(fileId);
        try {
            if (!await fs.pathExists(metadataPath)) {
                return { success: false, message: 'File metadata not found for update.' };
            }
            const existingMetadata = await fs.readJson(metadataPath);
            const updatedMetadata = { ...existingMetadata, ...newMetadataChanges, modified: new Date().toISOString() };

            // If new data is provided, update the file content
            if (newBase64Data) {
                const oldFilePath = path.join(this._getDataPath(fileId), existingMetadata.name);
                if (await fs.pathExists(oldFilePath) && existingMetadata.name !== updatedMetadata.name) {
                    await fs.remove(oldFilePath); // Remove old file if name changed
                }
                const newFilePath = path.join(this._getDataPath(fileId), updatedMetadata.name);
                const fileBuffer = Buffer.from(newBase64Data, 'base64');
                await fs.writeFile(newFilePath, fileBuffer);
                updatedMetadata.size = fileBuffer.length; // Update size if content changed
            } else if (existingMetadata.name !== updatedMetadata.name) {
                // If only metadata (like name/path) changed, rename/move the file
                const oldFilePath = path.join(this._getDataPath(fileId), existingMetadata.name);
                const newFilePath = path.join(this._getDataPath(fileId), updatedMetadata.name);
                if (await fs.pathExists(oldFilePath) && oldFilePath !== newFilePath) {
                    await fs.move(oldFilePath, newFilePath, { overwrite: true });
                }
            }


            await fs.writeJson(metadataPath, updatedMetadata, { spaces: 2 });
            console.log(`[PEPxBackend] Updated file: ${updatedMetadata.name} (ID: ${fileId})`);
            return { success: true, fileId: fileId, metadata: updatedMetadata };
        } catch (error) {
            console.error(`[PEPxBackend] Error updating file ${fileId}:`, error);
            return { success: false, message: error.message };
        }
    }

    async deleteFile(fileId) {
        const metadataPath = this._getMetadataPath(fileId);
        try {
            if (!await fs.pathExists(metadataPath)) {
                // If metadata doesn't exist, perhaps it was already deleted.
                console.warn(`[PEPxBackend] Metadata for file ID ${fileId} not found during delete. Assuming already deleted.`);
                return { success: true, message: 'File metadata not found, assumed already deleted.' };
            }
            const metadata = await fs.readJson(metadataPath);
            const fileDataDir = this._getDataPath(fileId); // This is the directory named after fileId

            await fs.remove(fileDataDir); // Remove the directory containing the file
            await fs.remove(metadataPath); // Remove the metadata file

            console.log(`[PEPxBackend] Deleted file: ${metadata.name} (ID: ${fileId})`);
            return { success: true };
        } catch (error) {
            console.error(`[PEPxBackend] Error deleting file ${fileId}:`, error);
            return { success: false, message: error.message };
        }
    }

    async listFiles(filePath = '/') {
        // This backend listFiles will list metadata files based on the path stored *within* metadata.
        // It's more complex than just listing a directory if paths are deeply nested.
        // For simplicity, this simulation will list all metadata files and let client filter by path.
        // A more robust version would query based on the path.
        try {
            const metadataFiles = await fs.readdir(this.metadataDirectory);
            const allFileMetadata = [];
            for (const metaFile of metadataFiles) {
                if (metaFile.endsWith('.json')) {
                    const metadata = await fs.readJson(path.join(this.metadataDirectory, metaFile));
                    // Filter by path prefix if provided
                    if (filePath === '/' || metadata.path.startsWith(filePath)) {
                         // For a more accurate "ls" like behavior, only return direct children
                        const relativePath = metadata.path.substring(filePath === '/' ? 1 : filePath.length +1);
                        if (filePath === '/' && relativePath.includes('/')) continue; // Item is in a subdirectory of root
                        if (filePath !== '/' && relativePath.includes('/')) continue; // Item is in a sub-subdirectory

                        allFileMetadata.push(metadata);
                    }
                }
            }
            console.log(`[PEPxBackend] Listed files for path "${filePath}", found ${allFileMetadata.length} items.`);
            return allFileMetadata.sort((a,b) => {
                if (a.type === 'folder' && b.type !== 'folder') return -1;
                if (a.type !== 'folder' && b.type === 'folder') return 1;
                return a.name.localeCompare(b.name);
            });
        } catch (error) {
            console.error(`[PEPxBackend] Error listing files for path ${filePath}:`, error);
            return [];
        }
    }
}

const pepxStorage = new PEPxStorageBackend(); // Instantiate the backend storage

// --- API Routes ---
// Store a new file
app.post('/api/files', async (req, res) => {
    const { metadata, data } = req.body; // data is base64 string
    if (!metadata || !data || !metadata.name || !metadata.path) {
        return res.status(400).json({ success: false, message: 'Missing metadata (name, path) or data.' });
    }
    const result = await pepxStorage.storeFile(metadata, data);
    if (result.success) {
        res.status(201).json(result);
    } else {
        res.status(500).json(result);
    }
});

// Retrieve a file
app.get('/api/files/:id', async (req, res) => {
    const fileId = req.params.id;
    const result = await pepxStorage.retrieveFile(fileId);
    if (result.success) {
        res.json(result);
    } else {
        if (result.message.includes('not found')) {
            res.status(404).json(result);
        } else {
            res.status(500).json(result);
        }
    }
});

// Update an existing file (metadata and/or data)
app.put('/api/files/:id', async (req, res) => {
    const fileId = req.params.id;
    const { metadata, data } = req.body; // data (base64) is optional if only metadata changes

    if (!metadata && !data) {
        return res.status(400).json({ success: false, message: 'No metadata or data provided for update.' });
    }
    const result = await pepxStorage.updateFile(fileId, { metadata, data });
    if (result.success) {
        res.json(result);
    } else {
        if (result.message.includes('not found')) {
            res.status(404).json(result);
        } else {
            res.status(500).json(result);
        }
    }
});

// Delete a file
app.delete('/api/files/:id', async (req, res) => {
    const fileId = req.params.id;
    const result = await pepxStorage.deleteFile(fileId);
    if (result.success) {
        res.json(result);
    } else {
        res.status(500).json(result);
    }
});

// List files (optionally by path)
app.get('/api/list', async (req, res) => {
    const filePath = req.query.path || '/'; // Default to root
    const files = await pepxStorage.listFiles(filePath);
    res.json(files);
});

// Conceptual endpoint for project publishing
app.post('/api/publish', (req, res) => {
    const { projectData, projectPath } = req.body;
    console.log(`[PEPxBackend] Received publish request for project at: ${projectPath}`);
    console.log(`[PEPxBackend] Project data contains ${Object.keys(projectData).length} files.`);
    // In a real scenario, this would:
    // 1. Authenticate the user (e.g., check API key, session)
    // 2. Potentially process payment or check subscription
    // 3. Create a unique deployment ID/subdomain
    // 4. Store/transform projectData to a serving format (e.g., static files for a CDN)
    // 5. Configure DNS/routing
    // 6. Return an access URL

    const uniqueProjectSlug = `pepx-live-${Date.now().toString(36)}`;
    const mockAccessUrl = `https://${uniqueProjectSlug}.pepx-hosted.com/${projectPath.substring(1).replace(/\//g, '-') || 'index.html'}`;

    console.log(`[PEPxBackend] Simulated deployment. Access URL: ${mockAccessUrl}`);
    res.json({
        success: true,
        message: 'Project published successfully (simulated).',
        accessUrl: mockAccessUrl,
        deploymentId: uniqueProjectSlug
    });
});


// Basic root route
app.get('/', (req, res) => {
    res.send('PEPx Backend Server is running. Use API endpoints to interact.');
});

// Start the server
app.listen(PORT, () => {
    console.log(`[PEPxBackend] Server listening on http://localhost:${PORT}`);
    console.log(`[PEPxBackend] File data will be stored in: ${path.resolve('./pepx_data')}`);
    console.log(`[PEPxBackend] Available Endpoints:`);
    console.log(`  POST   /api/files           (Create a file)`);
    console.log(`  GET    /api/files/:id       (Retrieve a file)`);
    console.log(`  PUT    /api/files/:id       (Update a file)`);
    console.log(`  DELETE /api/files/:id       (Delete a file)`);
    console.log(`  GET    /api/list?path=/foo  (List files in a directory)`);
    console.log(`  POST   /api/publish         (Simulate project publishing)`);
});
