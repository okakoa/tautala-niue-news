'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/context/AuthContext';

export default function PendingArticlesPage() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    fetchPendingArticles();
  }, []);

  const fetchPendingArticles = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'articles'), where('status', '==', 'pending'));
      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as any));
      
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setArticles(list);
    } catch (err) {
      console.error("Error fetching articles:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'published' | 'unpublished' | 'draft' | 'rejected') => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'articles', id), {
        status: action,
        moderatedBy: user.uid,
        updatedAt: new Date().toISOString()
      });
      setMessage(`Article ${action} successfully!`);
      fetchPendingArticles(); // Refresh the list
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  // --- Editing Functions ---
  const startEditing = (article: any) => {
    setEditingId(article.id);
    setEditTitle(article.title);
    setEditContent(article.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent('');
    setEditTitle('');
  };

  const saveEdit = async (id: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'articles', id), {
        title: editTitle,
        content: editContent,
        updatedAt: new Date().toISOString()
      });
      setMessage('Article text updated successfully!');
      setEditingId(null);
      fetchPendingArticles();
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(`Error saving edit: ${err.message}`);
    }
  };

  if (loading) return <div>Loading pending articles...</div>;

  return (
    <div>
      <h2 style={{ color: '#002B7F', borderBottom: '2px solid #FCD116', paddingBottom: '10px' }}>Pending Articles</h2>
      
      {message && (
        <div style={{ padding: '10px', margin: '15px 0', backgroundColor: message.includes('Error') ? '#ffe6e6' : '#e6ffe6', border: message.includes('Error') ? '1px solid #CE1126' : '1px solid #28a745', borderRadius: '4px', color: '#333', fontWeight: 'bold' }}>
          {message}
        </div>
      )}

      {articles.length === 0 ? (
        <p style={{ marginTop: '20px', color: '#666', fontStyle: 'italic' }}>No articles currently pending review. Great job!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
          {articles.map(article => (
            <div key={article.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#f9f9f9', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              
              {editingId === article.id ? (
                // --- EDIT MODE UI ---
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <label style={{ fontWeight: 'bold', color: '#002B7F' }}>Edit Headline</label>
                  <input 
                    type="text" 
                    value={editTitle} 
                    onChange={(e) => setEditTitle(e.target.value)} 
                    style={{ width: '100%', padding: '10px', fontSize: '18px', fontWeight: 'bold', border: '2px solid #002B7F', borderRadius: '4px' }}
                  />
                  
                  <label style={{ fontWeight: 'bold', color: '#002B7F', marginTop: '10px' }}>Edit Story Content</label>
                  <textarea 
                    value={editContent} 
                    onChange={(e) => setEditContent(e.target.value)} 
                    rows={12} 
                    style={{ width: '100%', padding: '10px', fontSize: '15px', fontFamily: 'inherit', border: '2px solid #002B7F', borderRadius: '4px', resize: 'vertical' }}
                  />
                  
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button 
                      onClick={() => saveEdit(article.id)}
                      style={{ padding: '8px 16px', backgroundColor: '#002B7F', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Save Changes
                    </button>
                    <button 
                      onClick={cancelEditing}
                      style={{ padding: '8px 16px', backgroundColor: '#ccc', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // --- VIEW MODE UI ---
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0, color: '#002B7F' }}>{article.title}</h3>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ backgroundColor: '#FCD116', color: '#333', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                        {article.category}
                      </span>
                      <button 
                        onClick={() => startEditing(article)}
                        style={{ padding: '6px 12px', backgroundColor: '#e2e8f0', color: '#002B7F', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                      >
                        ✏️ Edit Text
                      </button>
                    </div>
                  </div>
                  
                  <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>
                    Submitted by <strong>{article.authorName}</strong> on {new Date(article.createdAt).toLocaleDateString()}
                  </p>
                  
                  <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '4px', border: '1px solid #eee', whiteSpace: 'pre-wrap', marginBottom: '20px', maxHeight: '300px', overflowY: 'auto', fontSize: '15px', lineHeight: '1.5' }}>
                    {article.content}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => handleAction(article.id, 'published')}
                      style={{ padding: '8px 16px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Approve & Publish
                    </button>
                    <button 
                      onClick={() => handleAction(article.id, 'unpublished')}
                      style={{ padding: '8px 16px', backgroundColor: '#f0ad4e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Un-Publish
                    </button>
                    <button 
                      onClick={() => handleAction(article.id, 'draft')}
                      style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Move to Draft
                    </button>
                    <button 
                      onClick={() => handleAction(article.id, 'rejected')}
                      style={{ padding: '8px 16px', backgroundColor: '#CE1126', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Reject
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
