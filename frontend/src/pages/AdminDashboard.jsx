import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Trash2, Shield, UserCheck, AlertCircle } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      setError('Failed to fetch users. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action is irreversible.')) return;
    
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      alert('User deleted successfully');
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  return (
    <div className="admin-container container">
      <header className="admin-header">
        <h1>Control <span className="gold-text">Center</span></h1>
        <p>Manage the WorkConnect elite community.</p>
      </header>

      {error ? (
        <div className="error-box"><AlertCircle size={20} /> {error}</div>
      ) : loading ? (
        <div className="loader-container"><div className="loader"></div></div>
      ) : (
        <div className="admin-content">
          <div className="admin-stats">
            <div className="stat-card card">
              <Users className="gold-text" />
              <h3>{users.length}</h3>
              <p>Total Members</p>
            </div>
            <div className="stat-card card">
              <Shield className="gold-text" />
              <h3>{users.filter(u => u.roles.some(r => r.name === 'ROLE_ADMIN')).length}</h3>
              <p>Administrators</p>
            </div>
            <div className="stat-card card">
              <UserCheck className="gold-text" />
              <h3>{users.filter(u => u.roles.some(r => r.name === 'ROLE_WORKER')).length}</h3>
              <p>Verified Workers</p>
            </div>
          </div>

          <div className="user-management card">
            <h2>User <span className="gold-text">Management</span></h2>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Roles</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>#{u.id}</td>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        {u.roles.map(r => (
                          <span key={r.id} className={`role-tag ${r.name.toLowerCase().replace('role_', '')}`}>
                            {r.name.replace('ROLE_', '')}
                          </span>
                        ))}
                      </td>
                      <td>
                        <button 
                          className="delete-btn" 
                          onClick={() => handleDeleteUser(u.id)}
                          disabled={u.roles.some(r => r.name === 'ROLE_ADMIN')}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
