'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [role, setRole] = useState('standard');

  useEffect(() => {
    if (user) {
      user.getIdTokenResult().then(res => setRole((res.claims.role as string) || 'standard'));
    }
  }, [user]);

  const isModerator = ['super_admin', 'admin', 'moderator'].includes(role);

  return (
    // Allow 'standard' users to access the dashboard layout so they can view their Profile page
    <ProtectedRoute allowedRoles={['super_admin', 'admin', 'moderator', 'standard']}>
      <div className="container" style={{ display: 'flex', gap: '20px', marginTop: '20px', minHeight: '600px' }}>
        <aside style={{ width: '250px', backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #002B7F' }}>
          <h3 style={{ color: '#002B7F', marginBottom: '15px' }}>Dashboard Menu</h3>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            {/* Links for all users */}
            <li><Link href="/dashboard/profile" style={{ color: '#333', textDecoration: 'none', fontWeight: 'bold' }}>My Profile & Tools</Link></li>
            
            {/* Links for moderators and above */}
            {isModerator && (
              <>
                <li style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #ddd' }}>
                  <Link href="/dashboard" style={{ color: '#333', textDecoration: 'none' }}>Moderation Overview</Link>
                </li>
                <li><Link href="/dashboard/pending" style={{ color: '#333', textDecoration: 'none' }}>Pending Articles</Link></li>
                <li><Link href="/dashboard/published" style={{ color: '#333', textDecoration: 'none' }}>Published Articles</Link></li>
              </>
            )}

            {/* Links for admins and super admins */}
            {(role === 'super_admin' || role === 'admin') && (
              <li><Link href="/dashboard/users" style={{ color: '#333', textDecoration: 'none' }}>Manage Users</Link></li>
            )}

            {/* Links for super admins only */}
            {role === 'super_admin' && (
              <li style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #ddd' }}>
                <Link href="/dashboard/settings" style={{ color: '#333', textDecoration: 'none' }}>App Settings</Link>
              </li>
            )}

          </ul>
        </aside>
        <main style={{ flex: 1, backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
