'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // If not logged in, send to login page
        router.push('/login');
      } else {
        // Force refresh the token to catch the new 'super_admin' claim!
        user.getIdTokenResult(true).then((idTokenResult) => {
          const role = (idTokenResult.claims.role as string) || 'standard';
          if (allowedRoles.includes(role)) {
            setIsAuthorized(true);
          } else {
            // Logged in but not the right role, send to home
            router.push('/');
          }
        });
      }
    }
  }, [user, loading, router, allowedRoles]);

  if (loading || !isAuthorized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
        <h3 style={{ color: '#002B7F' }}>Checking permissions...</h3>
      </div>
    );
  }

  return <>{children}</>;
}
