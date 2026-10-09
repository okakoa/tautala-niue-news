'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SubmitStoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Community');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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
      // Create a new document in the "articles" collection
      await addDoc(collection(db, 'articles'), {
        title,
        category,
        content,
        authorId: user.uid,
        authorName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        status: 'pending', // Crucial: All new stories must go to the moderation queue!
        createdAt: new Date().toISOString(),
      });

      setMessage('Story submitted successfully! It is now pending review by a moderator.');
      setTitle('');
      setContent('');
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
            <option value="Regional & Global">Regional & Global</option>
          </select>
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
            alignSelf: 'flex-start',
            transition: 'background-color 0.2s'
          }}
        >
          {loading ? 'Submitting...' : 'Submit for Review'}
        </button>
      </form>
    </div>
  );
}
