import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Calendar, Clock, MessageCircle, Star, X } from 'lucide-react';
import RequestChat from '../components/RequestChat';
import './Dashboard.css';

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
};

const ServiceHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [chatRequest, setChatRequest] = useState(null);
  const [review, setReview] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user?.role) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const endpoint = user.role === 'ROLE_USER' ? '/requests/user' : '/requests/worker';
        const response = await api.get(endpoint);
        if (!cancelled) setHistory(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching history:', error);
        if (!cancelled) setHistory([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user?.role]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequest?.id) return;
    try {
      await api.post('/reviews', {
        serviceRequestId: selectedRequest.id,
        rating: review.rating,
        comment: review.comment?.trim() || undefined,
      });
      alert('Review submitted! Thank you for your feedback.');
      setSelectedRequest(null);
      setReview({ rating: 5, comment: '' });
      const endpoint = user.role === 'ROLE_USER' ? '/requests/user' : '/requests/worker';
      const response = await api.get(endpoint);
      setHistory(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        (typeof error.response?.data === 'string' ? error.response.data : null) ||
        'Failed to submit review';
      alert(msg);
    }
  };

  const markAsComplete = async (requestId) => {
    try {
      await api.put(`/requests/${requestId}/complete`);
      alert('Service marked as completed!');
      const endpoint = user.role === 'ROLE_USER' ? '/requests/user' : '/requests/worker';
      const response = await api.get(endpoint);
      setHistory(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      const msg = error.response?.data?.message || 'Action failed';
      alert(msg);
    }
  };

  const counterpartyName = (item) => {
    if (user.role === 'ROLE_USER') return item.worker?.name || 'Worker';
    return item.user?.name || 'Customer';
  };

  const statusClass = (status) => (status ? String(status).toLowerCase() : '');

  return (
    <div className="history-page container dashboard-container">
      <header className="page-header">
        <h1>
          Service <span className="gold-text">History</span>
        </h1>
        <p>Bookings, status, and feedback.</p>
      </header>

      {loading ? (
        <div className="loader-container">
          <div className="loader" />
        </div>
      ) : (
        <div className="activity-list">
          {history.length > 0 ? (
            history.map((item) => (
              <div key={item.id} className="activity-item card">
                <div className="activity-info">
                  <Calendar className="gold-text" size={24} />
                  <div>
                    <h3>{counterpartyName(item)}</h3>
                    <p>
                      {item.serviceType || 'Service'} · {item.location || 'Location TBD'}
                    </p>
                    {item.description && <p className="muted">{item.description}</p>}
                  </div>
                </div>

                <div className="activity-meta">
                  <div className="meta-item">
                    <Clock size={14} />
                    <span>{formatDate(item.requestDate)}</span>
                  </div>
                  <span className={`status-badge ${statusClass(item.status)}`}>{item.status}</span>

                  {user.role === 'ROLE_USER' && item.status === 'ACCEPTED' && (
                    <button type="button" className="outline-btn small" onClick={() => markAsComplete(item.id)}>
                      Mark complete
                    </button>
                  )}

                  {user.role === 'ROLE_USER' && item.status === 'COMPLETED' && !item.reviewed && (
                    <button type="button" className="gold-btn small" onClick={() => setSelectedRequest(item)}>
                      <Star size={14} /> Review
                    </button>
                  )}

                  {user.role === 'ROLE_USER' && item.status === 'COMPLETED' && item.reviewed && (
                    <span className="muted">Reviewed</span>
                  )}

                  {(item.status === 'ACCEPTED' || item.status === 'COMPLETED') && (
                    <button
                      type="button"
                      className="outline-btn small"
                      onClick={() => setChatRequest(item)}
                    >
                      <MessageCircle size={14} /> Chat
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No service history yet.</p>
            </div>
          )}
        </div>
      )}

      {chatRequest && (
        <RequestChat
          requestId={chatRequest.id}
          status={chatRequest.status}
          counterpartyName={counterpartyName(chatRequest)}
          userRole={user.role}
          onClose={() => setChatRequest(null)}
        />
      )}

      {selectedRequest && (
        <div className="modal-overlay">
          <div className="modal-content card gold-border">
            <button type="button" className="close-btn" onClick={() => setSelectedRequest(null)}>
              <X size={24} />
            </button>
            <h2>
              Rate your <span className="gold-text">experience</span>
            </h2>
            <p className="modal-sub">Reviewing {selectedRequest.worker?.name || 'worker'}</p>

            <form onSubmit={handleReviewSubmit} className="booking-form">
              <div className="input-group">
                <label>Rating (1–5)</label>
                <div className="rating-select">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={`rating-star ${review.rating >= num ? 'active' : ''}`}
                      onClick={() => setReview({ ...review, rating: num })}
                    >
                      <Star size={24} fill={review.rating >= num ? 'var(--color-gold-bright)' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="input-group">
                <label>Comment</label>
                <textarea
                  placeholder="Tell others about the service quality…"
                  value={review.comment}
                  onChange={(e) => setReview({ ...review, comment: e.target.value })}
                  rows={4}
                />
              </div>
              <button type="submit" className="gold-btn full-width">
                Submit review
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceHistory;
