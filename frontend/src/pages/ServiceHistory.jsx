import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Calendar, Clock, Star, MessageSquare, CheckCircle, X } from 'lucide-react';
import './Dashboard.css';

const ServiceHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [review, setReview] = useState({ rating: 5, comment: '' });

  const fetchHistory = async () => {
    try {
      const endpoint = user.role === 'ROLE_USER' ? '/requests/user' : '/requests/worker';
      const response = await api.get(endpoint);
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/reviews/request/${selectedRequest.id}`, {
        rating: review.rating,
        comment: review.comment
      });
      alert('Review submitted! Thank you for your feedback.');
      setSelectedRequest(null);
      fetchHistory();
    } catch (error) {
      alert('Failed to submit review');
    }
  };

  const markAsComplete = async (requestId) => {
    try {
      await api.put(`/requests/${requestId}/complete`);
      alert('Service marked as completed!');
      fetchHistory();
    } catch (error) {
      alert('Action failed');
    }
  };

  return (
    <div className="history-page container dashboard-container">
      <header className="page-header">
        <h1>Service <span className="gold-text">History</span></h1>
        <p>A record of your professional engagements.</p>
      </header>

      {loading ? (
        <div className="loader-container"><div className="loader"></div></div>
      ) : (
        <div className="activity-list">
          {history.length > 0 ? history.map((item) => (
            <div key={item.id} className="activity-item card">
              <div className="activity-info">
                <Calendar className="gold-text" size={24} />
                <div>
                  <h3>{user.role === 'ROLE_USER' ? item.worker.user.name : item.user.name}</h3>
                  <p>{item.serviceType}</p>
                </div>
              </div>
              
              <div className="activity-meta">
                <div className="meta-item">
                  <Clock size={14} />
                  <span>{new Date(item.scheduledDate).toLocaleDateString()}</span>
                </div>
                <span className={`status-badge ${item.status.toLowerCase()}`}>
                  {item.status}
                </span>

                {user.role === 'ROLE_USER' && item.status === 'ACCEPTED' && (
                  <button 
                    className="outline-btn small" 
                    onClick={() => markAsComplete(item.id)}
                  >
                    Complete
                  </button>
                )}

                {user.role === 'ROLE_USER' && item.status === 'COMPLETED' && (
                  <button 
                    className="gold-btn small" 
                    onClick={() => setSelectedRequest(item)}
                  >
                    <Star size={14} /> Review
                  </button>
                )}
              </div>
            </div>
          )) : (
            <div className="empty-state">
              <p>Your history is elite but currently empty.</p>
            </div>
          )}
        </div>
      )}

      {selectedRequest && (
        <div className="modal-overlay">
          <div className="modal-content card gold-border">
            <button className="close-btn" onClick={() => setSelectedRequest(null)}><X size={24} /></button>
            <h2>Rate your <span className="gold-text">Experience</span></h2>
            <p className="modal-sub">Reviewing {selectedRequest.worker.user.name}</p>
            
            <form onSubmit={handleReviewSubmit} className="booking-form">
              <div className="input-group">
                <label>Rating (1-5 Stars)</label>
                <div className="rating-select">
                  {[1, 2, 3, 4, 5].map(num => (
                    <button 
                      key={num}
                      type="button"
                      className={`rating-star ${review.rating >= num ? 'active' : ''}`}
                      onClick={() => setReview({...review, rating: num})}
                    >
                      <Star size={24} fill={review.rating >= num ? 'var(--color-gold-bright)' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="input-group">
                <label>Comment</label>
                <textarea 
                  required
                  placeholder="Tell us about the service quality..."
                  value={review.comment}
                  onChange={(e) => setReview({...review, comment: e.target.value})}
                />
              </div>
              <button type="submit" className="gold-btn full-width">Submit Review</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceHistory;
