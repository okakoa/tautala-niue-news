'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export default function DashboardOverview() {
  const { user } = useAuth();
  const [role, setRole] = useState<string>('Loading...');
  const [stats, setStats] = useState({ pending: 0, published: 0 });

  useEffect(() => {
    if (user) {
      user.getIdTokenResult().then(result => {
        setRole((result.claims.role as string) || 'standard');
      });
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const qPending = query(collection(db, 'articles'), where('status', '==', 'pending'));
      const qPublished = query(collection(db, 'articles'), where('status', '==', 'published'));
      
      const [pendingSnap, publishedSnap] = await Promise.all([
        getDocs(qPending),
        getDocs(qPublished)
      ]);
      
      setStats({
        pending: pendingSnap.size,
        published: publishedSnap.size
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  return (
    <div>
      <h1 style={{ color: '#CE1126', marginBottom: '20px' }}>Welcome to the Moderation Dashboard</h1>
      <p style={{ fontSize: '18px', color: '#333' }}>
        Hello, <strong>{user?.displayName || user?.email?.split('@')[0]}</strong>!
      </p>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#eef2ff', borderRadius: '6px', display: 'inline-block', border: '1px solid #c7d2fe' }}>
        <p style={{ margin: 0, color: '#002B7F' }}>
          Your Current Role: <strong style={{ textTransform: 'uppercase' }}>{role}</strong>
        </p>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <h3 style={{ color: '#002B7F' }}>Quick Stats</h3>
        <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
          <div style={{ padding: '20px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '8px', width: '150px', textAlign: 'center' }}>
            <h2 style={{ color: '#CE1126', margin: 0 }}>{stats.pending}</h2>
            <p style={{ margin: '5px 0 0 0', color: '#666' }}>Pending Review</p>
          </div>
          <div style={{ padding: '20px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '8px', width: '150px', textAlign: 'center' }}>
            <h2 style={{ color: '#002B7F', margin: 0 }}>{stats.published}</h2>
            <p style={{ margin: '5px 0 0 0', color: '#666' }}>Published</p>
          </div>
        </div>
      </div>
    </div>
  );
}
