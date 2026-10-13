import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Niue News Hub - Community News',
  description: 'A global community news platform for the island nation of Niue.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="site-wrapper">
            <Navbar />
            <main className="site-main">
              {children}
            </main>
            <Footer />
          </div>
          <a 
            href="https://projects.oka-apps.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="watermark-link"
            aria-label="Oka Apps Projects"
          >
            <img 
              src="/watermark.png" 
              alt="Niue News Watermark" 
            />
          </a>
        </AuthProvider>
      </body>
    </html>
  );
}
