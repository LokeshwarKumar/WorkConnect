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

const WorkerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [chatRequest, setChatRequest] = useState(null);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/requests/worker');
      setRequests(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (requestId, status) => {
    try {
      await api.put(`/requests/${requestId}/status?status=${status}`);
      setRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, status } : r)));
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update status';
      alert(msg);
    }
  };

  const filteredRequests = requests.filter((r) => r.status === filter);
  const statusClass = (s) => (s ? String(s).toLowerCase() : '');

  return (
    <div className="requests-page container dashboard-container">
      <header className="page-header">
        <h1>
          Incoming <span className="gold-text">requests</span>
        </h1>
        <p>Accept, reject, and track all booking states.</p>
      </header>

      <div className="filter-tabs">
        {['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'].map((status) => (
          <button
            key={status}
            type="button"
            className={`filter-tab ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loader-container">
          <div className="loader" />
        </div>
      ) : (
        <div className="activity-list">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((req) => (
              <div key={req.id} className="activity-item card">
                <div className="activity-info">
                  <div className="avatar-placeholder gold-text">{(req.user?.name || '?').charAt(0)}</div>
                  <div>
                    <h3>{req.user?.name || 'Customer'}</h3>
                    <p>
                      {req.serviceType || 'Service'} · {req.description || 'No description provided'}
                    </p>
                    <p className="muted">{req.location || 'Location TBD'}</p>
                  </div>
                </div>
                <div className="activity-meta">
                  <div className="meta-item">
                    <Calendar size={14} />
                    <span>{formatDate(req.requestDate)}</span>
                  </div>
                  {req.status === 'PENDING' && (
                    <div className="action-btns">
                      <button type="button" onClick={() => handleStatusUpdate(req.id, 'ACCEPTED')} className="status-btn accept">
                        <CheckCircle size={20} />
                      </button>
                      <button type="button" onClick={() => handleStatusUpdate(req.id, 'REJECTED')} className="status-btn reject">
                        <XCircle size={20} />
                      </button>
                    </div>
                  )}
                  {req.status !== 'PENDING' && (
                    <span className={`status-badge ${statusClass(req.status)}`}>{req.status}</span>
                  )}
                  {(req.status === 'ACCEPTED' || req.status === 'COMPLETED') && (
                    <button
                      type="button"
                      className="outline-btn small"
                      onClick={() => setChatRequest(req)}
                    >
                      <MessageCircle size={14} /> Chat
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No requests in this category.</p>
            </div>
          )}
        </div>
      )}

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

export default WorkerRequests;
