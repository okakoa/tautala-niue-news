'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/context/AuthContext';

export default function ArticlesStatusPage() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<any[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch users for moderator names
      const usersSnap = await getDocs(collection(db, 'users'));
      const uMap: Record<string, string> = {};
      usersSnap.docs.forEach(doc => {
        uMap[doc.id] = doc.data().displayName || doc.data().email || doc.id;
      });
      setUsersMap(uMap);

      // Fetch all articles
      const q = query(collection(db, 'articles'));
      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as any));
      
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setArticles(list);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'published': return '#28a745'; // Green
      case 'pending': return '#17a2b8'; // Blue
      case 'draft': return '#6c757d'; // Gray
      case 'unpublished': return '#f0ad4e'; // Orange
      case 'scheduled': return '#002B7F'; // Navy
      case 'rejected': return '#CE1126'; // Red
      default: return '#333';
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString() + ' ' + new Date(isoString).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  if (loading) return <div>Loading articles status...</div>;

  return (
    <div>
      <h2 style={{ color: '#002B7F', borderBottom: '2px solid #FCD116', paddingBottom: '10px' }}>Articles Status</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Overview of all articles across the platform and their current statuses.
      </p>

      <div style={{ overflowX: 'auto', backgroundColor: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #ddd', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>Article Title</th>
              <th style={{ padding: '12px' }}>Writers' Name</th>
              <th style={{ padding: '12px' }}>Status</th>
              <th style={{ padding: '12px' }}>Create Date</th>
              <th style={{ padding: '12px' }}>Pending Review</th>
              <th style={{ padding: '12px' }}>Published Date</th>
              <th style={{ padding: '12px' }}>Drafted Date</th>
              <th style={{ padding: '12px' }}>Moderator Name</th>
            </tr>
          </thead>
          <tbody>
            {articles.map(article => (
              <tr key={article.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{article.title}</td>
                <td style={{ padding: '12px' }}>{article.authorName}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    backgroundColor: getStatusColor(article.status), 
                    color: '#fff', 
                    padding: '4px 8px', 
                    borderRadius: '12px', 
                    fontSize: '12px', 
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap'
                  }}>
                    {article.status}
                  </span>
                </td>
                <td style={{ padding: '12px', fontSize: '13px' }}>{formatDate(article.createdAt)}</td>
                <td style={{ padding: '12px', fontSize: '13px' }}>
                  {article.status === 'pending' ? formatDate(article.updatedAt || article.createdAt) : '-'}
                </td>
                <td style={{ padding: '12px', fontSize: '13px' }}>
                  {article.status === 'published' ? formatDate(article.publishedAt || article.updatedAt) : 
                   article.status === 'scheduled' ? `Sch: ${formatDate(article.scheduledPublishDate)}` : '-'}
                </td>
                <td style={{ padding: '12px', fontSize: '13px' }}>
                  {article.status === 'draft' ? formatDate(article.updatedAt) : '-'}
                </td>
                <td style={{ padding: '12px' }}>
                  {article.moderatedBy ? (usersMap[article.moderatedBy] || 'Unknown Mod') : '-'}
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No articles found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
