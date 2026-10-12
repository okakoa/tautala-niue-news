'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/context/AuthContext';

export default function PublishedArticlesPage() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [postingId, setPostingId] = useState<string | null>(null);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    fetchPublishedArticles();
  }, []);

  const fetchPublishedArticles = async () => {
    setLoading(true);
    try {
      // Fetch only published articles
      const q = query(collection(db, 'articles'), where('status', '==', 'published'));
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

  const handleAutoPostToFacebook = async (article: any) => {
    if (!confirm(`Are you sure you want to push "${article.title}" directly to the News Niue Facebook Page?`)) {
      return;
    }
    setPostingId(article.id);
    setMessage('');
    try {
      const res = await fetch('/api/social/facebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId: article.id,
          articleUrl: window.location.origin
        })
      });
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Server returned ${res.status}`);
      }

      if (data.success) {
        setMessage(`🎉 Successfully posted "${article.title}" to Facebook Page!`);
        fetchPublishedArticles(); // Refresh to update facebookPostId
      } else {
        setMessage(`❌ Facebook Error: ${data.error || 'Failed to post'}`);
      }
    } catch (err: any) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setPostingId(null);
      setTimeout(() => setMessage(''), 6000);
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
      setMessage(`Article status changed to ${action} successfully!`);
      fetchPublishedArticles(); // Refresh the list
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
      fetchPublishedArticles();
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(`Error saving edit: ${err.message}`);
    }
  };

  if (loading) return <div>Loading published articles...</div>;

  return (
    <div>
      <h2 style={{ color: '#002B7F', borderBottom: '2px solid #FCD116', paddingBottom: '10px' }}>Published Articles</h2>
      
      {message && (
        <div style={{ padding: '10px', margin: '15px 0', backgroundColor: message.includes('Error') ? '#ffe6e6' : '#e6ffe6', border: message.includes('Error') ? '1px solid #CE1126' : '1px solid #28a745', borderRadius: '4px', color: '#333', fontWeight: 'bold' }}>
          {message}
        </div>
      )}

      {articles.length === 0 ? (
        <p style={{ marginTop: '20px', color: '#666', fontStyle: 'italic' }}>There are no published articles yet.</p>
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
                    </div>
                  </div>
                  
                  <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>
                    Submitted by <strong>{article.authorName}</strong> on {new Date(article.createdAt).toLocaleDateString()}
                  </p>
                  
                  <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '4px', border: '1px solid #eee', whiteSpace: 'pre-wrap', marginBottom: '20px', maxHeight: '300px', overflowY: 'auto', fontSize: '15px', lineHeight: '1.5' }}>
                    {article.content}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {article.facebookPostId ? (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ 
                          padding: '8px 14px', 
                          backgroundColor: '#e6f4ea', 
                          color: '#137333', 
                          borderRadius: '4px', 
                          fontWeight: 'bold', 
                          fontSize: '13px',
                          border: '1px solid #ceead6'
                        }}>
                          ✅ Posted to FB Page
                        </span>
                        <a 
                          href={`https://www.facebook.com/${article.facebookPostId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#1877F2',
                            color: '#fff',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          View on Facebook ↗
                        </a>
                        <button 
                          onClick={() => handleAutoPostToFacebook(article)}
                          disabled={postingId === article.id}
                          title="Click to post this story again to the Facebook Page"
                          style={{ 
                            padding: '6px 12px', 
                            backgroundColor: '#fff', 
                            color: '#002B7F', 
                            border: '1px solid #002B7F', 
                            borderRadius: '4px', 
                            cursor: postingId === article.id ? 'not-allowed' : 'pointer', 
                            fontSize: '12px',
                            fontWeight: 'bold' 
                          }}
                        >
                          {postingId === article.id ? 'Posting...' : 'Re-Post to FB'}
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleAutoPostToFacebook(article)}
                        disabled={postingId === article.id}
                        style={{ 
                          padding: '8px 16px', 
                          backgroundColor: postingId === article.id ? '#999' : '#002B7F', 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: '4px', 
                          cursor: postingId === article.id ? 'not-allowed' : 'pointer', 
                          fontWeight: 'bold',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        {postingId === article.id ? 'Posting to FB...' : '⚡ Auto-Post to FB Page'}
                      </button>
                    )}

                    <button 
                      onClick={() => {
                        const url = encodeURIComponent(`${window.location.origin}/article/${article.id}`);
                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
                      }}
                      style={{ padding: '8px 16px', backgroundColor: '#1877F2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Share Dialog
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
