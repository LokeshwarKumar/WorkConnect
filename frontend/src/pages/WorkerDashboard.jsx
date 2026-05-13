import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CheckCircle, XCircle, Calendar, MessageCircle } from 'lucide-react';
import RequestChat from '../components/RequestChat';
import './Dashboard.css';

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
};

const WorkerDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ pending: 0, completed: 0, rating: 0 });
  const [loading, setLoading] = useState(true);
  const [chatRequest, setChatRequest] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reqRes, profileRes] = await Promise.all([api.get('/requests/worker'), api.get('/profile')]);
        const list = Array.isArray(reqRes.data) ? reqRes.data : [];
        setRequests(list);
        const completed = list.filter((r) => r.status === 'COMPLETED').length;
        const pending = list.filter((r) => r.status === 'PENDING').length;
        const r = profileRes.data?.rating;
        setStats({
          pending,
          completed,
          rating: r != null && !Number.isNaN(Number(r)) ? Number(r) : 0,
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
      setRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, status } : r)));
      if (status === 'ACCEPTED' || status === 'REJECTED') {
        setStats((s) => ({ ...s, pending: Math.max(0, s.pending - 1) }));
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update status';
      alert(msg);
    }
  };

  return (
    <div className="dashboard-container container">
      <header className="dashboard-header">
        <div>
          <h1>
            Worker <span className="gold-text">Portal</span>
          </h1>
          <p>Manage incoming requests and active jobs.</p>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{stats.pending}</span>
            <span className="stat-label">New requests</span>
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
          <h2>
            Incoming <span className="gold-text">requests</span>
          </h2>
        </div>

        {loading ? (
          <div className="loader-container">
            <div className="loader" />
          </div>
        ) : requests.filter((r) => r.status === 'PENDING').length > 0 ? (
          <div className="activity-list">
            {requests
              .filter((r) => r.status === 'PENDING')
              .map((req) => (
                <div key={req.id} className="activity-item card">
                  <div className="activity-info">
                    <div className="avatar-placeholder gold-text">{(req.user?.name || '?').charAt(0)}</div>
                    <div>
                      <h3>{req.user?.name || 'Customer'}</h3>
                      <p>
                        {req.serviceType || 'Service'} · {req.location || 'Location TBD'}
                      </p>
                      {req.description && <p className="muted">{req.description}</p>}
                    </div>
                  </div>
                  <div className="activity-meta">
                    <div className="meta-item">
                      <Calendar size={14} />
                      <span>{formatDate(req.requestDate)}</span>
                    </div>
                    <div className="action-btns">
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(req.id, 'ACCEPTED')}
                        className="status-btn accept"
                        title="Accept"
                      >
                        <CheckCircle size={20} />
                      </button>
                      <button
                        type="button"
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
            <p>No pending requests right now.</p>
          </div>
        )}
      </section>

      <section className="dashboard-section">
        <div className="section-header">
          <h2>
            Active <span className="gold-text">assignments</span>
          </h2>
        </div>
        <div className="activity-list">
          {requests
            .filter((r) => r.status === 'ACCEPTED')
            .map((req) => (
              <div key={req.id} className="activity-item card">
                <div className="activity-info">
                  <div>
                    <h3>{req.user?.name || 'Customer'}</h3>
                    <p>{req.serviceType || 'Service'}</p>
                  </div>
                </div>
                <div className="activity-meta">
                  <span className="status-badge accepted">In progress</span>
                  <button
                    type="button"
                    className="outline-btn small"
                    onClick={() => setChatRequest(req)}
                  >
                    <MessageCircle size={14} /> Chat
                  </button>
                </div>
              </div>
            ))}
          {requests.filter((r) => r.status === 'ACCEPTED').length === 0 && (
            <p className="no-data">No active assignments.</p>
          )}
        </div>
      </section>

      {chatRequest && (
        <RequestChat
          requestId={chatRequest.id}
          status={chatRequest.status}
          counterpartyName={chatRequest.user?.name || 'Customer'}
          userRole="ROLE_WORKER"
          onClose={() => setChatRequest(null)}
        />
      )}
    </div>
  );
};

export default WorkerDashboard;
