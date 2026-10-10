'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import imageCompression from 'browser-image-compression';
import { useAuth } from '@/context/AuthContext';

export default function MyDraftsPage() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('Community');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreviewUrl, setEditImagePreviewUrl] = useState('');
  const [editImageCredit, setEditImageCredit] = useState('');
  const [savingStatus, setSavingStatus] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMyDrafts();
    }
  }, [user]);

  const fetchMyDrafts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Query by authorId, then filter by status in-memory to avoid needing a composite index
      const q = query(collection(db, 'articles'), where('authorId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      let list = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as any));
      
      list = list.filter(article => article.status === 'draft');
      
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setArticles(list);
    } catch (err) {
      console.error("Error fetching drafts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResubmit = async (id: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'articles', id), {
        status: 'pending',
        updatedAt: new Date().toISOString()
      });
      setMessage('Article successfully re-submitted for moderation!');
      fetchMyDrafts(); // Refresh the list
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
    setEditCategory(article.category || 'Community');
    setEditImagePreviewUrl(article.imageUrl || '');
    setEditImageCredit(article.imageCredit || '');
    setEditImageFile(null);
    setShowPreview(false);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent('');
    setEditTitle('');
    setEditCategory('Community');
    setEditImagePreviewUrl('');
    setEditImageCredit('');
    setEditImageFile(null);
    setShowPreview(false);
  };

  const saveEdit = async (id: string) => {
    if (!user) return;
    setSavingStatus('Starting upload...');
    try {
      let uploadedImageUrl = editImagePreviewUrl;
      
      if (editImageFile) {
        setSavingStatus('Processing image...');
        // Convert to base64 data URL to store directly in Firestore
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(editImageFile);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
        });
        
        uploadedImageUrl = dataUrl;
      }

      setSavingStatus('Updating database...');
      await updateDoc(doc(db, 'articles', id), {
        title: editTitle,
        content: editContent,
        category: editCategory,
        imageUrl: uploadedImageUrl,
        imageCredit: editImageCredit,
        updatedAt: new Date().toISOString()
      });
      setMessage('Draft updated successfully! You can now re-submit it.');
      setEditingId(null);
      fetchMyDrafts();
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(`Error saving edit: ${err.message}`);
    } finally {
      setSavingStatus('');
    }
  };

  if (loading) return <div>Loading your drafts...</div>;

  return (
    <div>
      <h2 style={{ color: '#002B7F', borderBottom: '2px solid #FCD116', paddingBottom: '10px' }}>My Drafts</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        These stories were moved to draft by a moderator. You can edit the content here and re-submit for review.
      </p>
      
      {message && (
        <div style={{ padding: '10px', margin: '15px 0', backgroundColor: message.includes('Error') ? '#ffe6e6' : '#e6ffe6', border: message.includes('Error') ? '1px solid #CE1126' : '1px solid #28a745', borderRadius: '4px', color: '#333', fontWeight: 'bold' }}>
          {message}
        </div>
      )}

      {articles.length === 0 ? (
        <p style={{ marginTop: '20px', color: '#666', fontStyle: 'italic' }}>You have no draft articles.</p>
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
                  
                  <label style={{ fontWeight: 'bold', color: '#002B7F', marginTop: '10px' }}>Category</label>
                  <select 
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px', backgroundColor: '#fff' }}
                  >
                    <option value="Community">Community</option>
                    <option value="Health">Health</option>
                    <option value="Education">Education</option>
                    <option value="Politics">Politics</option>
                    <option value="Sports">Sports</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Technology">Technology</option>
                    <option value="Regional & Global">Regional & Global</option>
                  </select>

                  <label style={{ fontWeight: 'bold', color: '#002B7F', marginTop: '10px' }}>Story Image (Max 1MB)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1200, useWebWorker: true };
                          const compressedFile = await imageCompression(file, options) as File;
                          setEditImageFile(compressedFile);
                          setEditImagePreviewUrl(URL.createObjectURL(compressedFile));
                        } catch (error) {
                          console.error("Error compressing image:", error);
                        }
                      }
                    }}
                    style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px', backgroundColor: '#fff' }}
                  />
                  {editImagePreviewUrl && (
                    <div style={{ marginTop: '10px' }}>
                      <img src={editImagePreviewUrl} alt="Preview" style={{ maxHeight: '200px', borderRadius: '4px' }} />
                    </div>
                  )}

                  <label style={{ fontWeight: 'bold', color: '#002B7F', marginTop: '10px' }}>Image Credit</label>
                  <input 
                    type="text" 
                    value={editImageCredit}
                    onChange={(e) => setEditImageCredit(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' }}
                    placeholder="e.g. Photo by John Doe"
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
                      disabled={!!savingStatus}
                      style={{ padding: '8px 16px', backgroundColor: savingStatus ? '#ccc' : '#002B7F', color: 'white', border: 'none', borderRadius: '4px', cursor: savingStatus ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                    >
                      {savingStatus ? savingStatus : 'Save Draft'}
                    </button>
                    <button 
                      onClick={cancelEditing}
                      disabled={!!savingStatus}
                      style={{ padding: '8px 16px', backgroundColor: '#ccc', color: '#333', border: 'none', borderRadius: '4px', cursor: savingStatus ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => setShowPreview(!showPreview)}
                      style={{ padding: '8px 16px', backgroundColor: '#002B7F', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      {showPreview ? 'Hide Preview' : 'Preview Article'}
                    </button>
                  </div>
                  
                  {showPreview && (
                    <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #eee' }}>
                      <h2 style={{ color: '#002B7F', marginBottom: '15px' }}>Article Preview</h2>
                      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#f9f9f9' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                          <h3 style={{ margin: 0, color: '#002B7F', fontSize: '24px' }}>{editTitle || 'Your Headline Here'}</h3>
                          <span style={{ backgroundColor: '#FCD116', color: '#333', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                            {editCategory}
                          </span>
                        </div>
                        
                        <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>
                          By <strong>{user?.displayName || user?.email?.split('@')[0] || 'Anonymous'}</strong> on {new Date().toLocaleDateString()}
                        </p>
            
                        {editImagePreviewUrl && (
                          <div style={{ marginBottom: '20px' }}>
                            <img src={editImagePreviewUrl} alt="Article Header" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '4px' }} />
                            {editImageCredit && <p style={{ fontSize: '12px', color: '#888', marginTop: '5px', fontStyle: 'italic' }}>{editImageCredit}</p>}
                          </div>
                        )}
                        
                        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '4px', border: '1px solid #eee', whiteSpace: 'pre-wrap', fontSize: '16px', lineHeight: '1.6' }}>
                          {editContent || 'Your story content will appear here...'}
                        </div>
                      </div>
                    </div>
                  )}
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
                    Created on {new Date(article.createdAt).toLocaleDateString()}
                  </p>
                  
                  {article.imageUrl && (
                    <div style={{ marginBottom: '20px' }}>
                      <img src={article.imageUrl} alt="Article Header" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '4px' }} />
                      {article.imageCredit && <p style={{ fontSize: '12px', color: '#888', marginTop: '5px', fontStyle: 'italic' }}>{article.imageCredit}</p>}
                    </div>
                  )}

                  <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '4px', border: '1px solid #eee', whiteSpace: 'pre-wrap', marginBottom: '20px', maxHeight: '300px', overflowY: 'auto', fontSize: '15px', lineHeight: '1.5' }}>
                    {article.content}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => startEditing(article)}
                      style={{ padding: '8px 16px', backgroundColor: '#f0ad4e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Edit Draft
                    </button>
                    <button 
                      onClick={() => handleResubmit(article.id)}
                      style={{ padding: '8px 16px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Re-submit for Review
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
