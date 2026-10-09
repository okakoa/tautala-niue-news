'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase/client';
import { signOut } from 'firebase/auth';

export default function Navbar() {
  const { user, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-brand">
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.jpg" alt="Niue News Logo" style={{ height: '40px', width: 'auto', borderRadius: '4px' }} />
            <span className="news">Niue News</span>
          </Link>
        </div>
        <ul className="navbar-nav" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <li><Link href="/">Home</Link></li>
          
          {!loading && user ? (
            <>
              {/* Logged in state */}
              <li><Link href="/submit">Submit Story</Link></li>
              <li><Link href="/dashboard" style={{ color: '#FCD116', fontWeight: 'bold' }}>Dashboard</Link></li>
              <li>
                <button 
                  onClick={handleSignOut} 
                  style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', padding: '0', fontSize: 'inherit', fontWeight: 'bold' }}
                >
                  Sign Out ({user.displayName?.split(' ')[0] || user.email?.split('@')[0]})
                </button>
              </li>
            </>
          ) : !loading && !user ? (
            <>
              {/* Logged out state */}
              <li>
                <Link 
                  href="/login" 
                  style={{ background: '#FFFFFF', color: '#002B7F', padding: '5px 12px', borderRadius: '4px', fontWeight: 'bold', textDecoration: 'none' }}
                >
                  Sign In
                </Link>
              </li>
            </>
          ) : null}
        </ul>
      </div>
    </nav>
  );
}
