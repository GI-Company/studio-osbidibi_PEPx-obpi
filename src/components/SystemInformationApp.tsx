
"use client";
import type * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { InfoIcon, Cpu, MonitorSmartphone, Palette, HardDrive, PieChart, LinkIcon, RefreshCw, Activity, DatabaseIcon, Puzzle } from 'lucide-react';

interface InfoItem {
  label: string;
  value: string | React.ReactNode;
  icon?: React.ElementType;
}

const graphicsFeatureStatus: InfoItem[] = [
  { label: "Canvas", value: "Hardware accelerated" },
  { label: "Direct Rendering Display Compositor", value: "Disabled" },
  { label: "Compositing", value: "Hardware accelerated" },
  { label: "Multiple Raster Threads", value: "Enabled" },
  { label: "OpenGL", value: "Enabled" },
  { label: "Rasterization", value: "Hardware accelerated" },
  { label: "Raw Draw", value: "Disabled" },
  { label: "Skia Graphite", value: "Enabled" },
  { label: "Video Decode", value: "Hardware accelerated" },
  { label: "Video Encode", value: "Hardware accelerated" },
  { label: "WebGL", value: "Hardware accelerated" },
  { label: "WebGL2", value: "Hardware accelerated" },
  { label: "WebGPU", value: "Hardware accelerated" },
  { label: "WebNN", value: "Disabled" },
];

const versionInformation: InfoItem[] = [
  { label: "OSbidibi Core Version", value: "0.7.5 (PEPx Enhanced)" },
  { label: "Host OS (Detected)", value: "Mac OS X 15.5.0" },
  { label: "Rendering Engine", value: "Chrome/137.0.7151.41 (Simulated GDE)" },
  { label: "2D Graphics Backend", value: "Skia/137 5b8860c391f7c3d5b09b62e0d58c45cb6fa814f0" },
  { label: "Data Exported", value: "2025-06-04T01:30:18.643Z (Simulated)"}
];

const originalGLExtensions = "GL_AMD_performance_monitor GL_ANGLE_base_vertex_base_instance_shader_builtin GL_ANGLE_blob_cache GL_ANGLE_client_arrays GL_ANGLE_compressed_texture_etc GL_ANGLE_depth_texture GL_ANGLE_framebuffer_blit GL_ANGLE_framebuffer_multisample GL_ANGLE_get_serialized_context_string GL_ANGLE_get_tex_level_parameter GL_ANGLE_instanced_arrays GL_ANGLE_memory_size GL_ANGLE_pack_reverse_row_order GL_ANGLE_polygon_mode GL_ANGLE_program_binary_readiness_query GL_ANGLE_program_cache_control GL_ANGLE_provoking_vertex GL_ANGLE_request_extension GL_ANGLE_robust_client_memory GL_ANGLE_texture_compression_dxt3 GL_ANGLE_texture_compression_dxt5 GL_ANGLE_translated_shader_source GL_APPLE_clip_distance GL_ARM_rgba8 GL_CHROMIUM_bind_generates_resource GL_CHROMIUM_bind_uniform_location GL_CHROMIUM_color_buffer_float_rgb GL_CHROMIUM_color_buffer_float_rgba GL_CHROMIUM_copy_texture GL_CHROMIUM_lose_context GL_EXT_blend_func_extended GL_EXT_blend_minmax GL_EXT_clip_control GL_EXT_color_buffer_half_float GL_EXT_compressed_ETC1_RGB8_sub_texture GL_EXT_debug_label GL_EXT_debug_marker GL_EXT_depth_clamp GL_EXT_discard_framebuffer GL_EXT_disjoint_timer_query GL_EXT_draw_buffers GL_EXT_float_blend GL_EXT_frag_depth GL_EXT_instanced_arrays GL_EXT_map_buffer_range GL_EXT_multisampled_render_to_texture GL_EXT_occlusion_query_boolean GL_EXT_polygon_offset_clamp GL_EXT_pvrtc_sRGB GL_EXT_read_format_bgra GL_EXT_robustness GL_EXT_sRGB GL_EXT_shader_texture_lod GL_EXT_texture_compression_bptc GL_EXT_texture_compression_dxt1 GL_EXT_texture_compression_rgtc GL_EXT_texture_compression_s3tc_srgb GL_EXT_texture_filter_anisotropic GL_EXT_texture_format_BGRA8888 GL_EXT_texture_mirror_clamp_to_edge GL_EXT_texture_norm16 GL_EXT_texture_rg GL_EXT_texture_storage GL_IMG_texture_compression_pvrtc GL_KHR_debug GL_KHR_parallel_shader_compile GL_KHR_robustness GL_KHR_texture_compression_astc_hdr GL_KHR_texture_compression_astc_ldr GL_KHR_texture_compression_astc_sliced_3d GL_NV_fence GL_NV_framebuffer_blit GL_NV_pixel_buffer_object GL_OES_EGL_image GL_OES_EGL_sync GL_OES_compressed_EAC_R11_signed_texture GL_OES_compressed_EAC_R11_unsigned_texture GL_OES_compressed_EAC_RG11_signed_texture GL_OES_compressed_EAC_RG11_unsigned_texture GL_OES_compressed_ETC1_RGB8_texture GL_OES_compressed_ETC2_RGB8_texture GL_OES_compressed_ETC2_RGBA8_texture GL_OES_compressed_ETC2_punchthroughA_RGBA8_texture GL_OES_compressed_ETC2_punchthroughA_sRGB8_alpha_texture GL_OES_compressed_ETC2_sRGB8_alpha8_texture GL_OES_compressed_ETC2_sRGB8_texture GL_OES_depth24 GL_OES_depth32 GL_OES_depth_texture GL_OES_element_index_uint GL_OES_fbo_render_mipmap GL_OES_get_program_binary GL_OES_mapbuffer GL_OES_packed_depth_stencil GL_OES_required_internalformat GL_OES_rgb8_rgba8 GL_OES_standard_derivatives GL_OES_surfaceless_context GL_OES_texture_3D GL_OES_texture_float GL_OES_texture_float_linear GL_OES_texture_half_float GL_OES_texture_half_float_linear GL_OES_texture_npot GL_OES_vertex_array_object";
const truncatedGLExtensions = originalGLExtensions.split(' ').slice(0, 10).join(' ') + ' ... (truncated)';


const driverInformation: InfoItem[] = [
  { label: "Primary GPU (Host)", value: "ANGLE (Apple, ANGLE Metal Renderer: Apple M3)" },
  { label: "Driver Version (Host)", value: "15.5" },
  { label: "Skia Backend (Host)", value: "GraphiteDawnMetal" },
  { label: "GL_VENDOR (Host)", value: "Google Inc. (Apple)" },
  { label: "GL_RENDERER (Host)", value: "ANGLE (Apple, ANGLE Metal Renderer: Apple M3, Version 15.5 (Build 24F74))"},
  { label: "GL_VERSION (Host)", value: "OpenGL ES 2.0.0 (ANGLE 2.1.25345 git hash: df9c59dcacff)" },
  { label: "GL_EXTENSIONS", value: <span title={originalGLExtensions}>{truncatedGLExtensions}</span> },
  { label: "Initialization time", value: "85ms (Simulated)"},
];

const displayInformation: InfoItem[] = [
  { label: "Primary Display Bounds (Host)", value: "1470x956" },
  { label: "Display Scale (Host)", value: "2x" },
  { label: "Color Space (SDR)", value: "P3 (Simulated)" },
  { label: "Buffer Format (SDR)", value: "BGRA_8888 (Simulated)" },
  { label: "Refresh Rate", value: "60 Hz (Simulated)" },
];

const segmentationRawText = `
Segmentation Key: chrome_low_user_engagement, Selected Segment: Not Ready
Segment Id: OPTIMIZATION_TARGET_SEGMENTATION_CHROME_LOW_USER_ENGAGEMENT
Result: Time: 0
Execute modelOverwrite result: 
0
OverwriteSet Selected
Segmentation Key: search_user, Selected Segment: Not Ready
Segment Id: OPTIMIZATION_TARGET_SEGMENTATION_SEARCH_USER
Result: Status: Succeeded output 0: None Time: 13393369064655801
Execute modelOverwrite result: 
0
OverwriteSet Selected
Segmentation Key: shopping_user, Selected Segment: Not Ready
Segment Id: OPTIMIZATION_TARGET_SEGMENTATION_SHOPPING_USER
Result: Status: Succeeded output 0: Other Time: 13393369064655544
Execute modelOverwrite result: 
0
OverwriteSet Selected
Segmentation Key: cross_device_user, Selected Segment: Not Ready
Segment Id: CROSS_DEVICE_USER_SEGMENT
Result: Status: Succeeded output 0: NoCrossDeviceUsage Time: 13393369064655592
Execute modelOverwrite result: 
0
OverwriteSet Selected
Segmentation Key: resume_heavy_user, Selected Segment: Not Ready
Segment Id: RESUME_HEAVY_USER_SEGMENT
Result: Status: Succeeded output 0: Other Time: 13393369064655674
Execute modelOverwrite result: 
0
OverwriteSet Selected
Segmentation Key: device_switcher, Selected Segment: Not Ready
Segment Id: OPTIMIZATION_TARGET_SEGMENTATION_DEVICE_SWITCHER
Result: Time: 0
Execute modelOverwrite result: 
0
OverwriteSet Selected
Segmentation Key: url_visit_resumption_ranker, Selected Segment: Not Ready
Segment Id: OPTIMIZATION_TARGET_URL_VISIT_RESUMPTION_RANKER
Result: Time: 0
Execute modelOverwrite result: 
0
OverwriteSet Selected
Segmentation Key: password_manager_user, Selected Segment: Not Ready
Segment Id: PASSWORD_MANAGER_USER
Result: Status: Succeeded output 0: Not_PasswordManagerUser Time: 13393369064655772
Execute modelOverwrite result: 
0
OverwriteSet Selected
Segmentation Key: database_api_clients, Selected Segment: Not Ready
Segment Id: DATABASE_API_CLIENTS
Result: Time: 0
Execute modelOverwrite result: 
0
OverwriteSet Selected
Segmentation Key: compose_promotion, Selected Segment: Not Ready
Segment Id: OPTIMIZATION_TARGET_SEGMENTATION_COMPOSE_PROMOTION
Result: Time: 0
Execute modelOverwrite result: 
0
OverwriteSet Selected
`;

const foundationalModelStateRaw = `
Foundational model state: Ready
Model Name: v2Nano
Version: 2024.09.25.2033
File path: /Users/hanna/Library/Application Support/Google/Chrome/OptGuideOnDeviceModel/2024.9.25.2033
Model crash count (current/maximum): 0/3
Foundational model criteria
Property	Value
device capable	true
disk space available	true
enabled by enterprise policy	true
enabled by feature	true
is already installing	true
on device feature recently used	true
out of retention	false
Supplementary Models
OPTIMIZATION_TARGET	Status
OPTIMIZATION_TARGET_LANGUAGE_DETECTION	Ready
OPTIMIZATION_TARGET_TEXT_SAFETY	Ready
`;

interface ParsedSegment {
  key: string;
  segment: string;
  id: string;
  resultStatus?: string;
  resultOutput?: string;
  resultTime?: string;
}

interface FoundationalModelState {
  state?: string;
  modelName?: string;
  version?: string;
  filePath?: string;
  crashCount?: string;
}

interface ModelCriteria {
  property: string;
  value: string;
}

interface SupplementaryModel {
  target: string;
  status: string;
}

function parseSegmentationData(rawData: string): ParsedSegment[] {
  const segments: ParsedSegment[] = [];
  const blocks = rawData.trim().split("Segmentation Key:").slice(1);

  blocks.forEach(block => {
    const lines = block.trim().split('\n');
    const keyMatch = lines[0]?.match(/^(.*?), Selected Segment: (.*)$/);
    const idMatch = lines[1]?.match(/Segment Id: (.*)$/);
    const resultLine = lines[2]?.match(/Result: (.*)$/);

    if (keyMatch && idMatch && resultLine) {
      const segment: ParsedSegment = {
        key: keyMatch[1].trim(),
        segment: keyMatch[2].trim(),
        id: idMatch[1].trim(),
      };

      const resultText = resultLine[1].trim();
      if (resultText.startsWith("Status:")) {
        const statusMatch = resultText.match(/Status: (.*?) output \d+: (.*?) Time: (.*)/);
        if (statusMatch) {
          segment.resultStatus = statusMatch[1].trim();
          segment.resultOutput = statusMatch[2].trim();
          const timeVal = parseInt(statusMatch[3].trim());
          segment.resultTime = timeVal > 0 ? new Date(timeVal / 1000).toLocaleString() : 'N/A';
        } else {
          segment.resultOutput = resultText; 
        }
      } else if (resultText.startsWith("Time:")) {
        const timeMatch = resultText.match(/Time: (.*)/);
        if (timeMatch) {
          const timeVal = parseInt(timeMatch[1].trim());
           segment.resultTime = timeVal > 0 ? new Date(timeVal / 1000).toLocaleString() : 'N/A';
        }
      } else {
        segment.resultOutput = resultText;
      }
      segments.push(segment);
    }
  });
  return segments;
}

const parsedSegmentationItems = parseSegmentationData(segmentationRawText).map(segment => ({
  label: segment.key,
  value: (
    <div className="text-xs space-y-0.5">
      <p><strong className="text-muted-foreground/80">Segment Status:</strong> {segment.segment}</p>
      <p><strong className="text-muted-foreground/80">ID:</strong> {segment.id}</p>
      {segment.resultStatus && <p><strong className="text-muted-foreground/80">Result Status:</strong> {segment.resultStatus}</p>}
      {segment.resultOutput && <p><strong className="text-muted-foreground/80">Result Output:</strong> {segment.resultOutput}</p>}
      {segment.resultTime && <p><strong className="text-muted-foreground/80">Result Time:</strong> {segment.resultTime}</p>}
    </div>
  )
}));


function parseFoundationalModelData(rawText: string): { modelState: FoundationalModelState, criteria: ModelCriteria[], supplementary: SupplementaryModel[] } {
    const modelState: FoundationalModelState = {};
    const criteria: ModelCriteria[] = [];
    const supplementary: SupplementaryModel[] = [];

    const lines = rawText.trim().split('\n');
    let currentSection = '';

    lines.forEach(line => {
        if (line.startsWith('Foundational model state:')) {
            modelState.state = line.split(': ')[1];
        } else if (line.startsWith('Model Name:')) {
            modelState.modelName = line.split(': ')[1];
        } else if (line.startsWith('Version:')) {
            modelState.version = line.split(': ')[1];
        } else if (line.startsWith('File path:')) {
            modelState.filePath = line.split(': ')[1];
        } else if (line.startsWith('Model crash count')) {
            modelState.crashCount = line.split(': ')[1];
        } else if (line.startsWith('Foundational model criteria')) {
            currentSection = 'criteria';
        } else if (line.startsWith('Supplementary Models')) {
            currentSection = 'supplementary';
        } else if (line.startsWith('OPTIMIZATION_TARGET')) { // Header for supplementary
            return;
        }
         else if (currentSection === 'criteria' && line.includes('\t')) {
            const [property, value] = line.split('\t');
            if (property && value && property.trim() !== 'Property' && property.trim() !== 'Value') {
                 criteria.push({ property: property.trim(), value: value.trim() });
            }
        } else if (currentSection === 'supplementary' && line.trim()) {
            const parts = line.split(/\s+/); // Split by whitespace
            if (parts.length >= 2) {
                 supplementary.push({ target: parts[0], status: parts.slice(1).join(' ') });
            }
        }
    });
    return { modelState, criteria, supplementary };
}

const { modelState, criteria, supplementary } = parseFoundationalModelData(foundationalModelStateRaw);

const foundationalModelStateItems: InfoItem[] = [
    { label: "State", value: modelState.state || "N/A" },
    { label: "Model Name", value: modelState.modelName || "N/A" },
    { label: "Version", value: modelState.version || "N/A" },
    { label: "File Path", value: <span className="text-xs break-all">{modelState.filePath || "N/A"}</span> },
    { label: "Crash Count", value: modelState.crashCount || "N/A" },
];


const Section: React.FC<{ title: string; items?: InfoItem[]; children?: React.ReactNode; icon?: React.ElementType, defaultOpen?: boolean }> = ({ title, items, children, icon: Icon, defaultOpen }) => (
  <AccordionItem value={title.toLowerCase().replace(/\s+/g, '-').replace(/[():]/g, '')}>
    <AccordionTrigger className="text-base hover:no-underline">
      <div className="flex items-center">
        {Icon && <Icon className="w-5 h-5 mr-2 text-primary" />}
        <span className="radiant-text text-accent">{title}</span>
      </div>
    </AccordionTrigger>
    <AccordionContent>
      {items && (
        <Table className="text-xs">
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={`${item.label}-${index}`}>
                <TableCell className="font-medium text-muted-foreground w-1/3 py-1.5 px-2 radiant-text align-top">{item.label}</TableCell>
                <TableCell className="py-1.5 px-2 radiant-text align-top">{item.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {children}
    </AccordionContent>
  </AccordionItem>
);

export function SystemInformationApp() {
  return (
    <div className="flex flex-col w-full h-full p-2 md:p-4 bg-card text-card-foreground rounded-md overflow-hidden">
      <CardHeader className="pb-3 text-center">
        <div className="flex items-center justify-center mb-2">
          <InfoIcon className="w-8 h-8 mr-2 text-primary" />
          <CardTitle className="text-2xl radiant-text">System Information</CardTitle>
        </div>
        <CardDescription className="radiant-text">
          Conceptual overview of OSbidibi&apos;s simulated hardware, graphics, and segmentation capabilities based on host environment.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-2 overflow-hidden">
        <ScrollArea className="h-full p-1 -m-1">
          <Accordion type="multiple" defaultValue={['version-information', 'graphics-feature-status', 'segmentation-internals', 'on-device-model-information']} className="w-full space-y-1">
            <Section title="Version Information" items={versionInformation} icon={Cpu} defaultOpen />
            <Section title="Graphics Feature Status" items={graphicsFeatureStatus} icon={Palette} defaultOpen />
            <Section title="Driver Information (Host)" items={driverInformation} icon={HardDrive} />
            <Section title="Display Information (Host)" items={displayInformation} icon={MonitorSmartphone} />
            <Section title="Segmentation Internals (Host)" items={parsedSegmentationItems} icon={PieChart} defaultOpen />
            
            <Section title="On-Device Model Information" icon={DatabaseIcon} defaultOpen>
                 <h4 className="text-sm font-semibold mt-2 mb-1 text-primary radiant-text">Foundational Model State</h4>
                 <Table className="text-xs mb-3">
                    <TableBody>
                        {foundationalModelStateItems.map((item, index) => (
                            <TableRow key={`model-state-${index}`}>
                                <TableCell className="font-medium text-muted-foreground w-1/3 py-1 px-2 radiant-text align-top">{item.label}</TableCell>
                                <TableCell className="py-1 px-2 radiant-text align-top">{item.value}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
                 <h4 className="text-sm font-semibold mt-3 mb-1 text-primary radiant-text">Foundational Model Criteria</h4>
                 <Table className="text-xs mb-3">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="radiant-text">Property</TableHead>
                            <TableHead className="radiant-text">Value</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {criteria.map((crit, index) => (
                            <TableRow key={`criteria-${index}`}>
                                <TableCell className="py-1 px-2 radiant-text capitalize">{crit.property}</TableCell>
                                <TableCell className="py-1 px-2 radiant-text">{crit.value}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
                 <h4 className="text-sm font-semibold mt-3 mb-1 text-primary radiant-text">Supplementary Models</h4>
                 <Table className="text-xs">
                     <TableHeader>
                        <TableRow>
                            <TableHead className="radiant-text">Target</TableHead>
                            <TableHead className="radiant-text">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {supplementary.map((supModel, index) => (
                            <TableRow key={`sup-model-${index}`}>
                                <TableCell className="py-1 px-2 radiant-text">{supModel.target}</TableCell>
                                <TableCell className="py-1 px-2 radiant-text">{supModel.status}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
            </Section>

            <Section title="Related Website Sets (Host)" icon={LinkIcon}>
              <div className="space-y-2 text-xs max-h-60 overflow-y-auto">
                {JSON.parse(segmentationRawText.substring(segmentationRawText.indexOf('[ {'), segmentationRawText.lastIndexOf('} ]') + 3) || "[]").map((set: any, index: number) => (
                  <div key={index} className="p-1.5 border-b border-border/30">
                    <p><strong className="text-muted-foreground/80">Primary:</strong> {set.PrimarySites.join(', ')}</p>
                    {set.AssociatedSites && <p><strong className="text-muted-foreground/80">Associated:</strong> {set.AssociatedSites.join(', ')}</p>}
                    {set.ServiceSites && <p><strong className="text-muted-foreground/80">Service:</strong> {set.ServiceSites.join(', ')}</p>}
                  </div>
                ))}
              </div>
            </Section>
            <Section title="Sync Internals (Host)" icon={RefreshCw}>
                {JSON.parse(segmentationRawText.substring(segmentationRawText.indexOf('{"actionable_error":'), segmentationRawText.lastIndexOf('}')+1) || "{}").details?.map((detailSet: any, index: number) => (
                    detailSet.data && (
                        <div key={`sync-detail-${index}`} className="mb-2">
                            <h5 className="text-xs font-semibold text-primary/90 mb-0.5 radiant-text">{detailSet.title}</h5>
                            <Table className="text-[10px]">
                                <TableBody>
                                {detailSet.data.map((item: any, idx: number) => (
                                    <TableRow key={`${detailSet.title}-${idx}`}>
                                        <TableCell className="font-medium text-muted-foreground w-2/5 py-0.5 px-1.5 radiant-text align-top">{item.stat_name}</TableCell>
                                        <TableCell className="py-0.5 px-1.5 radiant-text align-top">{item.stat_value}</TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                        </div>
                    )
                ))}
                 <h5 className="text-xs font-semibold text-primary/90 mt-2 mb-0.5 radiant-text">Data Type Status</h5>
                 <Table className="text-[10px]">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="radiant-text">Name</TableHead>
                            <TableHead className="radiant-text">State</TableHead>
                             <TableHead className="radiant-text">Total</TableHead>
                            <TableHead className="radiant-text">Live</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {JSON.parse(segmentationRawText.substring(segmentationRawText.indexOf('{"actionable_error":'), segmentationRawText.lastIndexOf('}')+1) || "{}").type_status?.slice(1).map((type: any, index: number) => (
                             <TableRow key={`type-status-${index}`}>
                                <TableCell className="py-0.5 px-1.5 radiant-text">{type.name}</TableCell>
                                <TableCell className="py-0.5 px-1.5 radiant-text">{type.state}</TableCell>
                                <TableCell className="py-0.5 px-1.5 radiant-text">{type.num_entries}</TableCell>
                                <TableCell className="py-0.5 px-1.5 radiant-text">{type.num_live}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
            </Section>
            <Section title="Device Event Log (Host)" icon={Activity}>
                <pre className="text-[10px] whitespace-pre-wrap max-h-48 overflow-y-auto bg-black/20 p-1.5 rounded-md radiant-text">
                    {segmentationRawText.substring(segmentationRawText.indexOf('device_event_log'), segmentationRawText.indexOf('🔗 extensions')).split('\n').slice(1, 16).join('\n') + "\n..."}
                </pre>
            </Section>


          </Accordion>
        </ScrollArea>
      </CardContent>
      <div className="p-2 text-xs text-center text-muted-foreground/70 border-t border-primary/20 mt-auto">
        This information is based on the host browser&apos;s capabilities and presented as OSbidibi&apos;s awareness.
      </div>
    </div>
  );
}

