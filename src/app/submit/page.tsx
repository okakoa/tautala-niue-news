'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import imageCompression from 'browser-image-compression';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SubmitStoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Community');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [imageCredit, setImageCredit] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Show a loading state while AuthContext determines if they are logged in
  if (authLoading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;

  // If user is not logged in, prompt them to log in.
  if (!user) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', backgroundColor: '#f8f9fa', padding: '40px', borderRadius: '8px', maxWidth: '500px', margin: '100px auto', borderTop: '4px solid #CE1126' }}>
        <h2 style={{ color: '#002B7F', marginBottom: '15px' }}>Please Sign In</h2>
        <p style={{ color: '#666', marginBottom: '25px' }}>You must be logged into an account to submit a story for publication.</p>
        <Link href="/login" style={{ padding: '10px 20px', backgroundColor: '#002B7F', color: 'white', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
          Go to Sign In
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      let uploadedImageUrl = '';
      if (imageFile) {
        // Convert to base64 data URL to store directly in Firestore
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(imageFile);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
        });
        uploadedImageUrl = dataUrl;
      }

      // Create a new document in the "articles" collection
      await addDoc(collection(db, 'articles'), {
        title,
        category,
        content,
        imageUrl: uploadedImageUrl,
        imageCredit,
        authorId: user.uid,
        authorName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        status: 'pending', // Crucial: All new stories must go to the moderation queue!
        createdAt: new Date().toISOString(),
      });

      setMessage('Story submitted successfully! It is now pending review by a moderator.');
      setTitle('');
      setContent('');
      setImageFile(null);
      setImagePreviewUrl('');
      setImageCredit('');
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', backgroundColor: '#FFFFFF', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h1 style={{ color: '#002B7F', borderBottom: '3px solid #FCD116', paddingBottom: '10px' }}>Submit a Story</h1>
      <p style={{ color: '#666', marginBottom: '20px', fontSize: '16px' }}>
        Have news to share with the Niuean global community? Submit your story below. All submissions are reviewed by our moderation team before publishing.
      </p>

      {message && (
        <div style={{ padding: '15px', marginBottom: '20px', backgroundColor: message.includes('Error') ? '#ffe6e6' : '#e6ffe6', border: message.includes('Error') ? '1px solid #CE1126' : '1px solid #28a745', borderRadius: '4px', color: '#333', fontWeight: 'bold' }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#002B7F' }}>Headline / Title</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' }}
            placeholder="Enter an engaging headline..."
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#002B7F' }}>Category</label>
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
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
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#002B7F' }}>Story Image (Max 1MB, Auto-Compressed)</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                try {
                  const options = {
                    maxSizeMB: 0.5,
                    maxWidthOrHeight: 1200,
                    useWebWorker: true
                  };
                  const compressedFile = await imageCompression(file, options);
                  setImageFile(compressedFile);
                  setImagePreviewUrl(URL.createObjectURL(compressedFile));
                } catch (error) {
                  console.error("Error compressing image:", error);
                  setMessage("Error compressing image. Please try another one.");
                }
              }
            }}
            style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px', backgroundColor: '#fff' }}
          />
          {imagePreviewUrl && (
            <div style={{ marginTop: '10px' }}>
              <img src={imagePreviewUrl} alt="Preview" style={{ maxHeight: '200px', borderRadius: '4px' }} />
            </div>
          )}
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#002B7F' }}>Image Credit</label>
          <input 
            type="text" 
            value={imageCredit}
            onChange={(e) => setImageCredit(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' }}
            placeholder="e.g. Photo by John Doe"
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#002B7F' }}>Story Content</label>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={12}
            style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px', fontFamily: 'inherit', resize: 'vertical' }}
            placeholder="Write your article here... What do you want the community to know?"
          />
        </div>

        <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: '14px 28px', 
              backgroundColor: loading ? '#ccc' : '#CE1126', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              fontSize: '16px', 
              fontWeight: 'bold', 
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Submitting...' : 'Submit for Review'}
          </button>
          
          <button 
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            style={{ 
              padding: '14px 28px', 
              backgroundColor: '#002B7F', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              fontSize: '16px', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {showPreview ? 'Hide Preview' : 'Preview Article'}
          </button>
        </div>
      </form>

      {showPreview && (
        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '2px solid #eee' }}>
          <h2 style={{ color: '#002B7F', marginBottom: '15px' }}>Article Preview</h2>
          <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#f9f9f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <h3 style={{ margin: 0, color: '#002B7F', fontSize: '24px' }}>{title || 'Your Headline Here'}</h3>
              <span style={{ backgroundColor: '#FCD116', color: '#333', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                {category}
              </span>
            </div>
            
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>
              By <strong>{user?.displayName || user?.email?.split('@')[0] || 'Anonymous'}</strong> on {new Date().toLocaleDateString()}
            </p>

            {imagePreviewUrl && (
              <div style={{ marginBottom: '20px' }}>
                <img src={imagePreviewUrl} alt="Article Header" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '4px' }} />
                {imageCredit && <p style={{ fontSize: '12px', color: '#888', marginTop: '5px', fontStyle: 'italic' }}>{imageCredit}</p>}
              </div>
            )}
            
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '4px', border: '1px solid #eee', whiteSpace: 'pre-wrap', fontSize: '16px', lineHeight: '1.6' }}>
              {content || 'Your story content will appear here...'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
