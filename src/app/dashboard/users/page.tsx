'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ManageUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersList);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (uid: string, newRole: string) => {
    if (!user) return;
    setMessage('Updating role...');
    
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ uid, newRole })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update role');
      
      setMessage('Role updated successfully!');
      fetchUsers();
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleManageUser = async (uid: string, action: 'enable' | 'disable' | 'delete') => {
    if (!user) return;
    if (action === 'delete' && !window.confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) {
      return;
    }

    setMessage(`Processing ${action}...`);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/manage-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ uid, action })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to ${action} user`);
      
      setMessage(`User ${action}d successfully!`);
      fetchUsers();
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
      <div>
      <h2 style={{ color: '#002B7F', borderBottom: '2px solid #FCD116', paddingBottom: '10px' }}>Manage Users</h2>
      
      {message && (
        <div style={{ padding: '10px', margin: '15px 0', backgroundColor: message.includes('Error') ? '#ffe6e6' : '#e6ffe6', border: message.includes('Error') ? '1px solid #CE1126' : '1px solid #28a745', borderRadius: '4px', color: '#333' }}>
          {message}
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', minWidth: '800px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #ddd', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>Email</th>
              <th style={{ padding: '12px' }}>Name</th>
              <th style={{ padding: '12px' }}>Status</th>
              <th style={{ padding: '12px' }}>Role</th>
              <th style={{ padding: '12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #eee', opacity: u.disabled ? 0.6 : 1 }}>
                <td style={{ padding: '12px' }}>{u.email}</td>
                <td style={{ padding: '12px' }}>{u.displayName || 'N/A'}</td>
                <td style={{ padding: '12px' }}>
                  {u.disabled ? 
                    <span style={{ color: '#CE1126', fontWeight: 'bold', fontSize: '13px' }}>Disabled</span> : 
                    <span style={{ color: '#28a745', fontWeight: 'bold', fontSize: '13px' }}>Active</span>
                  }
                </td>
                <td style={{ padding: '12px' }}>
                  <select 
                    value={u.role || 'standard'} 
                    onChange={(e) => handleChangeRole(u.id, e.target.value)}
                    disabled={u.id === user?.uid} 
                    style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc', cursor: u.id === user?.uid ? 'not-allowed' : 'pointer' }}
                  >
                    <option value="standard">Standard</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </td>
                <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                  {u.disabled ? (
                    <button 
                      onClick={() => handleManageUser(u.id, 'enable')}
                      style={{ padding: '6px 12px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                    >
                      Enable
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleManageUser(u.id, 'disable')}
                      disabled={u.id === user?.uid}
                      style={{ padding: '6px 12px', backgroundColor: '#f0ad4e', color: '#fff', border: 'none', borderRadius: '4px', cursor: u.id === user?.uid ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                    >
                      Disable
                    </button>
                  )}
                  <button 
                    onClick={() => handleManageUser(u.id, 'delete')}
                    disabled={u.id === user?.uid}
                    style={{ padding: '6px 12px', backgroundColor: '#CE1126', color: '#fff', border: 'none', borderRadius: '4px', cursor: u.id === user?.uid ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ marginTop: '20px', fontSize: '13px', color: '#666' }}>
        * Note: As a safety precaution, you cannot change the role, disable, or delete your own account here.
      </p>
    </div>
    </ProtectedRoute>
  );
}
