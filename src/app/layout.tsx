import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Niue News',
  description: 'A global community news platform for the island nation of Niue.',
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
          <Navbar />
          {children}
          <a 
            href="https://projects.oka-apps.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="watermark-link"
            style={{
              position: 'fixed', 
              bottom: '20px', 
              right: '20px', 
              zIndex: 9999
            }}
          >
            <img 
              src="/watermark.png" 
              alt="Niue News Watermark" 
              style={{ 
                width: '150px', 
                height: 'auto', 
                display: 'block'
              }} 
            />
          </a>
        </AuthProvider>
      </body>
    </html>
  );
}
