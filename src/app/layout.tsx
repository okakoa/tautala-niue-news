import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tautala Niue News',
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
        <nav className="navbar">
          <div className="container">
            <div className="navbar-brand">
              Tautala <span className="news">Niue News</span>
            </div>
            <ul className="navbar-nav">
              <li><a href="#">Home</a></li>
              <li><a href="#">Submit Story</a></li>
              <li><a href="#">Categories</a></li>
              <li><a href="#">About</a></li>
            </ul>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
