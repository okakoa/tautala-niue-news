'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export default function SettingsPage() {
  const [allowedRoles, setAllowedRoles] = useState<string[]>(['super_admin', 'admin']);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const docRef = doc(db, 'settings', 'features');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setAllowedRoles(docSnap.data().analyzerAllowedRoles || ['super_admin', 'admin']);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = (role: string) => {
    setAllowedRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await setDoc(doc(db, 'settings', 'features'), {
        analyzerAllowedRoles: allowedRoles
      }, { merge: true });
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div>
      <h2 style={{ color: '#002B7F', borderBottom: '2px solid #FCD116', paddingBottom: '10px' }}>App Settings</h2>
      
      {message && (
        <div style={{ padding: '10px', margin: '15px 0', backgroundColor: message.includes('Error') ? '#ffe6e6' : '#e6ffe6', border: message.includes('Error') ? '1px solid #CE1126' : '1px solid #28a745', borderRadius: '4px', color: '#333', fontWeight: 'bold' }}>
          {message}
        </div>
      )}

      <div style={{ marginTop: '20px', border: '1px solid #ddd', padding: '20px', borderRadius: '8px', backgroundColor: '#f9f9f9', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h3 style={{ color: '#002B7F', marginBottom: '10px' }}>URL Analyzer Feature Control</h3>
        <p style={{ color: '#666', marginBottom: '15px', fontSize: '14px' }}>
          Select which user roles have access to the "Website or Product URL Analyzer" tool on the Home Page. Users without access will see a restricted message.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {['super_admin', 'admin', 'moderator', 'standard'].map(role => (
            <label key={role} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={allowedRoles.includes(role)} 
                onChange={() => handleRoleToggle(role)}
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ textTransform: 'capitalize', fontWeight: 'bold', color: '#333' }}>
                {role.replace('_', ' ')}
              </span>
            </label>
          ))}
        </div>

        <button 
          onClick={handleSave} 
          disabled={saving}
          style={{ padding: '10px 20px', backgroundColor: '#CE1126', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
