import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Calendar, Clock, Star, ArrowRight, Briefcase } from 'lucide-react';
import './Dashboard.css';

const UserDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await api.get('/requests/user');
        setRequests(response.data.slice(0, 5)); // Show only top 5
      } catch (error) {
        console.error('Error fetching requests:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  return (
    <div className="dashboard-container container">
      <header className="dashboard-header">
        <div>
          <h1>Welcome, <span className="gold-text">{user.name}</span></h1>
          <p>Your portal to elite services.</p>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{requests.filter(r => r.status === 'PENDING').length}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{requests.filter(r => r.status === 'ACCEPTED').length}</span>
            <span className="stat-label">Active</span>
          </div>
        </div>
      </header>

      <section className="dashboard-section">
        <div className="section-header">
          <h2>Recent <span className="gold-text">Activity</span></h2>
          <button className="outline-btn small">View All</button>
        </div>

        {loading ? (
          <div className="loader-container"><div className="loader"></div></div>
        ) : requests.length > 0 ? (
          <div className="activity-list">
            {requests.map((req) => (
              <div key={req.id} className="activity-item card">
                <div className="activity-info">
                  <Briefcase className="gold-text" size={24} />
                  <div>
                    <h3>{req.worker.user.name}</h3>
                    <p>{req.serviceType}</p>
                  </div>
                </div>
                <div className="activity-meta">
                  <div className="meta-item">
                    <Calendar size={14} />
                    <span>{new Date(req.scheduledDate).toLocaleDateString()}</span>
                  </div>
                  <div className="meta-item">
                    <span className={`status-badge ${req.status.toLowerCase()}`}>
                      {req.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No recent requests found. Start by searching for a service.</p>
            <button className="gold-btn">Find a Worker</button>
          </div>
        )}
      </section>

      <section className="quick-actions">
        <div className="action-card card gold-border">
          <Clock className="gold-text" size={32} />
          <h3>Book Service</h3>
          <p>Hire top-rated professionals instantly.</p>
          <ArrowRight size={20} />
        </div>
        <div className="action-card card">
          <Star className="gold-text" size={32} />
          <h3>Rate Workers</h3>
          <p>Share your elite experience with others.</p>
          <ArrowRight size={20} />
        </div>
      </section>
    </div>
  );
};

export default UserDashboard;
