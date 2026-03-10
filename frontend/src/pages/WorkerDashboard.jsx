import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { CheckCircle, XCircle, Clock, Star, Calendar } from 'lucide-react';
import './Dashboard.css';

const WorkerDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ pending: 0, completed: 0, rating: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reqRes, profileRes] = await Promise.all([
          api.get('/requests/worker'),
          api.get('/workers/profile')
        ]);
        setRequests(reqRes.data);
        const completed = reqRes.data.filter(r => r.status === 'COMPLETED').length;
        const pending = reqRes.data.filter(r => r.status === 'PENDING').length;
        setStats({
          pending,
          completed,
          rating: profileRes.data.rating || 0
        });
      } catch (error) {
        console.error('Error fetching worker data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStatusUpdate = async (requestId, status) => {
    try {
      await api.put(`/requests/${requestId}/status?status=${status}`);
      setRequests(requests.map(r => r.id === requestId ? { ...r, status } : r));
      // Update local stats
      if (status === 'ACCEPTED') setStats(s => ({ ...s, pending: s.pending - 1 }));
      if (status === 'REJECTED') setStats(s => ({ ...s, pending: s.pending - 1 }));
    } catch (error) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="dashboard-container container">
      <header className="dashboard-header">
        <div>
          <h1>Worker <span className="gold-text">Portal</span></h1>
          <p>Excellence in every service.</p>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{stats.pending}</span>
            <span className="stat-label">New Requests</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.rating.toFixed(1)}</span>
            <span className="stat-label">Rating</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.completed}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
      </header>

      <section className="dashboard-section">
        <div className="section-header">
          <h2>Incoming <span className="gold-text">Service Requests</span></h2>
        </div>

        {loading ? (
          <div className="loader-container"><div className="loader"></div></div>
        ) : requests.filter(r => r.status === 'PENDING').length > 0 ? (
          <div className="activity-list">
            {requests.filter(r => r.status === 'PENDING').map((req) => (
              <div key={req.id} className="activity-item card">
                <div className="activity-info">
                  <div className="avatar-placeholder gold-text">
                    {req.user.name.charAt(0)}
                  </div>
                  <div>
                    <h3>{req.user.name}</h3>
                    <p>{req.serviceType} • {req.location || 'Client Location'}</p>
                  </div>
                </div>
                <div className="activity-meta">
                  <div className="meta-item">
                    <Calendar size={14} />
                    <span>{new Date(req.scheduledDate).toLocaleDateString()}</span>
                  </div>
                  <div className="action-btns">
                    <button 
                      onClick={() => handleStatusUpdate(req.id, 'ACCEPTED')}
                      className="status-btn accept" 
                      title="Accept"
                    >
                      <CheckCircle size={20} />
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(req.id, 'REJECTED')}
                      className="status-btn reject" 
                      title="Reject"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No new requests at the moment. Your excellence is awaited.</p>
          </div>
        )}
      </section>

      {/* Accepted/Active Section */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>Active <span className="gold-text">Assignments</span></h2>
        </div>
        <div className="activity-list">
          {requests.filter(r => r.status === 'ACCEPTED').map(req => (
            <div key={req.id} className="activity-item card">
              <div className="activity-info">
                <div>
                  <h3>{req.user.name}</h3>
                  <p>{req.serviceType}</p>
                </div>
              </div>
              <div className="activity-meta">
                <span className="status-badge accepted">In Progress</span>
              </div>
            </div>
          ))}
          {requests.filter(r => r.status === 'ACCEPTED').length === 0 && (
             <p className="no-data">No active assignments.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default WorkerDashboard;
