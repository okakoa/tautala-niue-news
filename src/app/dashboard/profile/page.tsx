'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db } from '@/lib/firebase/client';

export default function ProfilePage() {
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [userRole, setUserRole] = useState('standard');
  const [allowedRoles, setAllowedRoles] = useState<string[]>(['super_admin', 'admin']);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const [isEditingName, setIsEditingName] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSuccess, setNameSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'features'));
        if (docSnap.exists() && docSnap.data().analyzerAllowedRoles) {
          setAllowedRoles(docSnap.data().analyzerAllowedRoles);
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setSettingsLoaded(true);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (user) {
      user.getIdTokenResult().then(result => {
        setUserRole((result.claims.role as string) || 'standard');
      });
      setDisplayName(user.displayName || '');
    }
  }, [user]);

  const hasAccessToAnalyzer = allowedRoles.includes(userRole);

  const handleUpdateName = async () => {
    if (!user) return;
    setIsUpdatingName(true);
    setNameError(null);
    setNameSuccess(null);
    try {
      await updateProfile(user, { displayName });
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: displayName
      });
      setNameSuccess('Name updated successfully.');
      setIsEditingName(false);
    } catch (err: any) {
      setNameError(err.message || 'Failed to update name.');
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      setError("Please enter a valid website or product URL.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze the URL. Please try again.");
      }

      setResult(data.result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderResult = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('## ')) {
        elements.push(<h2 key={index} style={{color: '#002B7F', marginTop: '15px'}}>{trimmed.substring(3)}</h2>);
      } else if (trimmed.startsWith('### ')) {
        elements.push(<h3 key={index} style={{color: '#CE1126', marginTop: '10px'}}>{trimmed.substring(4)}</h3>);
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        elements.push(<li key={index} style={{marginBottom: '5px'}}>{trimmed.substring(2)}</li>);
      } else if (trimmed !== '') {
        elements.push(<p key={index} style={{ marginBottom: '10px', lineHeight: '1.5' }}>{trimmed}</p>);
      }
    });

    return elements;
  };

  return (
    <div>
      <h2 style={{ color: '#002B7F', borderBottom: '2px solid #FCD116', paddingBottom: '10px', marginBottom: '20px' }}>
        My Profile & Tools
      </h2>
      
      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #ddd' }}>
        <h3 style={{ color: '#333', margin: '0 0 10px 0' }}>Account Info</h3>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Role:</strong> <span style={{ textTransform: 'uppercase', fontWeight: 'bold', color: '#CE1126' }}>{userRole}</span></p>
        
        <div style={{ marginTop: '10px' }}>
          <p style={{ margin: '0 0 5px 0' }}><strong>Name:</strong></p>
          {isEditingName ? (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={isUpdatingName}
                placeholder="Enter your name"
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: 1, maxWidth: '300px' }}
              />
              <button 
                onClick={handleUpdateName} 
                disabled={isUpdatingName}
                style={{ padding: '8px 16px', backgroundColor: '#002B7F', color: '#fff', border: 'none', borderRadius: '4px', cursor: isUpdatingName ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
              >
                {isUpdatingName ? 'Saving...' : 'Save'}
              </button>
              <button 
                onClick={() => {
                  setIsEditingName(false);
                  setDisplayName(user?.displayName || '');
                  setNameError(null);
                  setNameSuccess(null);
                }} 
                disabled={isUpdatingName}
                style={{ padding: '8px 16px', backgroundColor: '#ccc', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '16px' }}>{user?.displayName || 'N/A'}</span>
              <button 
                onClick={() => setIsEditingName(true)}
                style={{ padding: '4px 12px', backgroundColor: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
              >
                Edit
              </button>
            </div>
          )}
          {nameError && <p style={{ color: '#CE1126', fontSize: '14px', margin: '5px 0 0 0' }}>{nameError}</p>}
          {nameSuccess && <p style={{ color: '#28a745', fontSize: '14px', margin: '5px 0 0 0' }}>{nameSuccess}</p>}
        </div>
      </div>

      <h3 style={{ color: '#002B7F', marginBottom: '15px' }}>URL Analyzer Tool</h3>
      
      {settingsLoaded ? (
        hasAccessToAnalyzer ? (
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            {error && <div style={{ color: '#CE1126', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>⚠️ {error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label htmlFor="urlInput" style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>
                  Enter a Website or Product URL to Analyze
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="url"
                    id="urlInput"
                    placeholder="https://example.com/some-news-or-product"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={isLoading}
                    style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                  <button type="submit" disabled={isLoading} style={{ padding: '10px 20px', backgroundColor: '#002B7F', color: '#fff', border: 'none', borderRadius: '4px', cursor: isLoading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
                    {isLoading ? 'Analyzing...' : 'Generate Steps'}
                  </button>
                </div>
              </div>
            </form>

            {isLoading && (
              <div style={{ marginTop: '20px', textAlign: 'center', color: '#666' }}>
                <p>Analyzing link and generating Niuean community impact steps...</p>
              </div>
            )}

            {result && !isLoading && (
              <div style={{ marginTop: '30px', borderTop: '2px solid #FCD116', paddingTop: '20px' }}>
                <h2 style={{ color: '#002B7F', marginBottom: '15px' }}>Generated Action Steps & Recommendations</h2>
                <div>
                  {renderResult(result)}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #ddd' }}>
            <h2 style={{ color: '#002B7F', marginBottom: '15px' }}>Feature Restricted</h2>
            <p style={{ color: '#666', fontSize: '16px' }}>
              Your current role does not have permission to use the URL Analyzer tool.
            </p>
          </div>
        )
      ) : (
        <p>Loading tools...</p>
      )}
    </div>
  );
}
