'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase/client';
import { signOut } from 'firebase/auth';

export default function Navbar() {
  const { user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    setMobileMenuOpen(false);
    await signOut(auth);
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <div className="navbar-brand">
          <Link href="/" onClick={closeMenu} style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/logo.jpg" alt="Niue News Logo" style={{ height: '36px', width: 'auto', borderRadius: '4px', objectFit: 'contain' }} />
            <span className="news">Niue News</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <ul className="navbar-nav desktop-nav">
          <li><Link href="/">Home</Link></li>
          
          {!loading && user ? (
            <>
              <li><Link href="/submit">Submit Story</Link></li>
              <li><Link href="/dashboard" style={{ color: '#FCD116', fontWeight: 'bold' }}>Dashboard</Link></li>
              <li>
                <button 
                  onClick={handleSignOut} 
                  className="navbar-signout-btn"
                >
                  Sign Out ({user.displayName?.split(' ')[0] || user.email?.split('@')[0]})
                </button>
              </li>
            </>
          ) : !loading && !user ? (
            <>
              <li>
                <Link 
                  href="/login" 
                  className="navbar-signin-btn"
                >
                  Sign In
                </Link>
              </li>
            </>
          ) : null}
        </ul>

        {/* Mobile Navigation Toggle */}
        <div className="mobile-nav-toggle-wrap">
          {!loading && !user && (
            <Link 
              href="/login" 
              onClick={closeMenu}
              className="navbar-signin-btn mobile-quick-btn"
            >
              Sign In
            </Link>
          )}
          <button 
            type="button"
            className="hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-menu-drawer">
          <ul className="mobile-nav-links">
            <li>
              <Link href="/" onClick={closeMenu} className="mobile-nav-item">
                <span>🏠</span> Home
              </Link>
            </li>
            
            {!loading && user ? (
              <>
                <li>
                  <Link href="/submit" onClick={closeMenu} className="mobile-nav-item">
                    <span>✍️</span> Submit Story
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" onClick={closeMenu} className="mobile-nav-item highlight">
                    <span>📊</span> Dashboard
                  </Link>
                </li>
                <li className="mobile-user-row">
                  <div className="mobile-user-badge">
                    <span>👤</span> {user.displayName || user.email}
                  </div>
                  <button 
                    onClick={handleSignOut} 
                    className="mobile-signout-btn"
                  >
                    Sign Out
                  </button>
                </li>
              </>
            ) : !loading && !user ? (
              <li>
                <Link href="/login" onClick={closeMenu} className="mobile-nav-item login-item">
                  <span>🔐</span> Sign In / Register
                </Link>
              </li>
            ) : null}
          </ul>
        </div>
      )}
    </nav>
  );
}

