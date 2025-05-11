
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext';
import { VFSProvider } from '@/contexts/VFSContext'; // Import VFSProvider

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'BinaryBlocksphere',
  description: 'A virtual environment for bidirectional binary operations.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
        <AuthProvider>
          <VFSProvider> {/* Wrap with VFSProvider */}
            <main className="flex-grow flex flex-col">
              {children}
            </main>
            <Toaster />
          </VFSProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
