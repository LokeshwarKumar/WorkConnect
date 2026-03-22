import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Users, Trash2, Shield, UserCheck, AlertCircle, Briefcase, Star, BarChart3, Check, X } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [tab, setTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, workersRes, statsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/workers'),
        api.get('/admin/stats'),
      ]);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setWorkers(Array.isArray(workersRes.data) ? workersRes.data : []);
      setStats(statsRes.data || null);
    } catch {
      setError('Failed to load admin data. You may not have administrator access.');
      setUsers([]);
      setWorkers([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this customer/admin user from user_profiles?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((u) => u.filter((x) => x.id !== userId));
      loadAll();
    } catch {
      alert('Failed to delete user');
    }
  };

  const handleDeleteWorker = async (workerId) => {
    if (!window.confirm('Delete this worker account? Fails if they still have linked bookings.')) return;
    try {
      await api.delete(`/admin/workers/${workerId}`);
      setWorkers((w) => w.filter((x) => x.id !== workerId));
      loadAll();
    } catch {
      alert('Failed to delete worker (may have active service history).');
    }
  };

  const toggleWorkerApproved = async (workerId, nextApproved) => {
    try {
      const res = await api.put(`/admin/workers/${workerId}/approved?approved=${nextApproved}`);
      setWorkers((w) => w.map((x) => (x.id === workerId ? { ...x, ...res.data } : x)));
    } catch {
      alert('Failed to update worker approval');
    }
  };

  return (
    <div className="admin-container container">
      <header className="admin-header">
        <h1>
          Admin <span className="gold-text">Console</span>
        </h1>
        <p>Users, workers, approvals, and platform metrics.</p>
      </header>

      <div className="admin-tabs">
        <button type="button" className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>
          <BarChart3 size={18} /> Overview
        </button>
        <button type="button" className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>
          <Users size={18} /> Customers & admins
        </button>
        <button type="button" className={tab === 'workers' ? 'active' : ''} onClick={() => setTab('workers')}>
          <Briefcase size={18} /> Workers
        </button>
      </div>

      {error ? (
        <div className="error-box">
          <AlertCircle size={20} /> {error}
        </div>
      ) : loading ? (
        <div className="loader-container">
          <div className="loader" />
        </div>
      ) : (
        <>
          {tab === 'overview' && stats && (
            <div className="admin-content">
              <div className="admin-stats">
                <div className="stat-card card">
                  <Users className="gold-text" />
                  <h3>{stats.customerCount}</h3>
                  <p>Customers</p>
                </div>
                <div className="stat-card card">
                  <Shield className="gold-text" />
                  <h3>{stats.administratorCount}</h3>
                  <p>Administrators</p>
                </div>
                <div className="stat-card card">
                  <UserCheck className="gold-text" />
                  <h3>{stats.workerCount}</h3>
                  <p>Workers</p>
                </div>
                <div className="stat-card card">
                  <Briefcase className="gold-text" />
                  <h3>{stats.totalServiceRequests}</h3>
                  <p>Total bookings</p>
                </div>
                <div className="stat-card card">
                  <Check className="gold-text" />
                  <h3>{stats.completedServiceRequests}</h3>
                  <p>Completed jobs</p>
                </div>
                <div className="stat-card card">
                  <Star className="gold-text" />
                  <h3>{stats.totalReviews}</h3>
                  <p>Reviews</p>
                </div>
              </div>
              <p className="admin-footnote">
                Average review score (platform):{' '}
                <strong>{stats.averageReviewRating != null ? Number(stats.averageReviewRating).toFixed(1) : '—'}</strong> / 5
              </p>
            </div>
          )}

          {tab === 'users' && (
            <div className="user-management card">
              <h2>
                User <span className="gold-text">accounts</span> <span className="muted-count">({users.length})</span>
              </h2>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
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
                          <span className={`role-tag ${String(u.role || 'USER').toLowerCase()}`}>{u.role || 'USER'}</span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="delete-btn"
                            onClick={() => handleDeleteUser(u.id)}
                            disabled={u.role === 'ADMIN'}
                            title={u.role === 'ADMIN' ? 'Cannot delete admin' : 'Delete user'}
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
          )}

          {tab === 'workers' && (
            <div className="user-management card">
              <h2>
                Worker <span className="gold-text">directory</span> <span className="muted-count">({workers.length})</span>
              </h2>
              <p className="admin-hint">Unapproved workers are hidden from customer search.</p>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Service</th>
                      <th>Rating</th>
                      <th>Approved</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workers.map((w) => (
                      <tr key={w.id}>
                        <td>#{w.id}</td>
                        <td>{w.name}</td>
                        <td>{w.serviceType}</td>
                        <td>{w.rating != null ? Number(w.rating).toFixed(1) : '—'}</td>
                        <td>
                          <button
                            type="button"
                            className={`pill-btn ${w.approved ? 'on' : 'off'}`}
                            onClick={() => toggleWorkerApproved(w.id, !w.approved)}
                          >
                            {w.approved ? (
                              <>
                                <Check size={14} /> Yes
                              </>
                            ) : (
                              <>
                                <X size={14} /> No
                              </>
                            )}
                          </button>
                        </td>
                        <td>
                          <button type="button" className="delete-btn" onClick={() => handleDeleteWorker(w.id)}>
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
