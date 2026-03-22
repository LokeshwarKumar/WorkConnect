import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Calendar, Clock, Star, ArrowRight, Briefcase } from 'lucide-react';
import './Dashboard.css';

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
};

const UserDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await api.get('/requests/user');
        const data = Array.isArray(response.data) ? response.data : [];
        setRequests(data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching requests:', error);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const statusClass = (s) => (s ? String(s).toLowerCase() : '');

  return (
    <div className="dashboard-container container">
      <header className="dashboard-header">
        <div>
          <h1>
            Welcome, <span className="gold-text">{user?.name}</span>
          </h1>
          <p>Your home for bookings and service history.</p>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{requests.filter((r) => r.status === 'PENDING').length}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{requests.filter((r) => r.status === 'ACCEPTED').length}</span>
            <span className="stat-label">Active</span>
          </div>
        </div>
      </header>

      <section className="dashboard-section">
        <div className="section-header">
          <h2>
            Recent <span className="gold-text">activity</span>
          </h2>
          <Link to="/history" className="outline-btn small">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="loader-container">
            <div className="loader" />
          </div>
        ) : requests.length > 0 ? (
          <div className="activity-list">
            {requests.map((req) => (
              <div key={req.id} className="activity-item card">
                <div className="activity-info">
                  <Briefcase className="gold-text" size={24} />
                  <div>
                    <h3>{req.worker?.name || 'Worker'}</h3>
                    <p>{req.serviceType || 'Service'}</p>
                  </div>
                </div>
                <div className="activity-meta">
                  <div className="meta-item">
                    <Calendar size={14} />
                    <span>{formatDate(req.requestDate)}</span>
                  </div>
                  <div className="meta-item">
                    <span className={`status-badge ${statusClass(req.status)}`}>{req.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No recent requests. Start by searching for a worker.</p>
            <Link to="/search" className="gold-btn">
              Find a worker
            </Link>
          </div>
        )}
      </section>

      <section className="quick-actions">
        <Link to="/search" className="action-card card gold-border quick-action-link">
          <Clock className="gold-text" size={32} />
          <h3>Book service</h3>
          <p>Browse workers by trade, location, and rating.</p>
          <ArrowRight size={20} />
        </Link>
        <Link to="/history" className="action-card card quick-action-link">
          <Star className="gold-text" size={32} />
          <h3>History & reviews</h3>
          <p>Track jobs and rate completed work.</p>
          <ArrowRight size={20} />
        </Link>
      </section>
    </div>
  );
};

export default UserDashboard;
