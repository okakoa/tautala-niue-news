'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [role, setRole] = useState('standard');
  const [counts, setCounts] = useState({
    draft: 0,
    pending: 0,
    published: 0,
    unpublished: 0,
  });

  useEffect(() => {
    if (user) {
      user.getIdTokenResult().then(res => setRole((res.claims.role as string) || 'standard'));
    }
  }, [user]);

  // Real-time listener for the user's authored articles
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'articles'), where('authorId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let d = 0;
      let p = 0;
      let pub = 0;
      let unpub = 0;
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const status = data.status;
        if (status === 'draft') d++;
        else if (status === 'pending') p++;
        else if (status === 'published') pub++;
        else if (status === 'unpublished') unpub++;
      });
      setCounts({
        draft: d,
        pending: p,
        published: pub,
        unpublished: unpub,
      });
    }, (err) => {
      console.error("Error listening to user article counts:", err);
    });

    return () => unsubscribe();
  }, [user]);

  const isModerator = ['super_admin', 'admin', 'moderator'].includes(role);
  const isActive = (path: string) => pathname === path;

  return (
    // Allow 'standard' users to access the dashboard layout so they can view their Profile page
    <ProtectedRoute allowedRoles={['super_admin', 'admin', 'moderator', 'standard']}>
      <div className="container">
        <div className="dashboard-wrapper">
          <aside className="dashboard-sidebar">
            <h3 style={{ color: '#002B7F', marginBottom: '15px' }}>Dashboard Menu</h3>
            <ul className="dashboard-menu-list">
              
              {/* Links for all users */}
              <li>
                <Link 
                  href="/dashboard/profile" 
                  className={`dashboard-menu-link ${isActive('/dashboard/profile') ? 'active' : ''}`}
                >
                  <span>My Profile & Tools</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard/drafts" 
                  className={`dashboard-menu-link ${isActive('/dashboard/drafts') ? 'active' : ''}`}
                >
                  <span>My Drafts</span>
                  <span className="dashboard-menu-badge badge-draft">{counts.draft}</span>
                </Link>
              </li>
              
              {/* Links for moderators and above */}
              {isModerator && (
                <>
                  <li style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                    <Link 
                      href="/dashboard" 
                      className={`dashboard-menu-link ${isActive('/dashboard') ? 'active' : ''}`}
                    >
                      <span>Moderation Overview</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/dashboard/status" 
                      className={`dashboard-menu-link ${isActive('/dashboard/status') ? 'active' : ''}`}
                    >
                      <span>Articles Status</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/dashboard/pending" 
                      className={`dashboard-menu-link ${isActive('/dashboard/pending') ? 'active' : ''}`}
                    >
                      <span>Pending Articles</span>
                      <span className="dashboard-menu-badge badge-pending">{counts.pending}</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/dashboard/published" 
                      className={`dashboard-menu-link ${isActive('/dashboard/published') ? 'active' : ''}`}
                    >
                      <span>Published Articles</span>
                      <span className="dashboard-menu-badge badge-published">{counts.published}</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/dashboard/unpublished" 
                      className={`dashboard-menu-link ${isActive('/dashboard/unpublished') ? 'active' : ''}`}
                    >
                      <span>Un-Published Articles</span>
                      <span className="dashboard-menu-badge badge-unpublished">{counts.unpublished}</span>
                    </Link>
                  </li>
                </>
              )}

              {/* Links for admins and super admins */}
              {(role === 'super_admin' || role === 'admin') && (
                <li>
                  <Link 
                    href="/dashboard/users" 
                    className={`dashboard-menu-link ${isActive('/dashboard/users') ? 'active' : ''}`}
                  >
                    <span>Manage Users</span>
                  </Link>
                </li>
              )}

              {/* Links for super admins only */}
              {role === 'super_admin' && (
                <li style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                  <Link 
                    href="/dashboard/settings" 
                    className={`dashboard-menu-link ${isActive('/dashboard/settings') ? 'active' : ''}`}
                  >
                    <span>App Settings</span>
                  </Link>
                </li>
              )}

            </ul>
          </aside>
          <main className="dashboard-main">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

