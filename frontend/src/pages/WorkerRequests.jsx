import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CheckCircle, XCircle, Calendar, MapPin, Clock, Filter } from 'lucide-react';
import './Dashboard.css';

const WorkerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');

  const fetchRequests = async () => {
    try {
      const response = await api.get('/requests/worker');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
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
      setRequests(requests.map(r => r.id === requestId ? { ...r, status } : r));
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const filteredRequests = requests.filter(r => r.status === filter);

  return (
    <div className="requests-page container dashboard-container">
      <header className="page-header">
        <h1>Incoming <span className="gold-text">Requests</span></h1>
        <p>Curate your professional schedule.</p>
      </header>

      <div className="filter-tabs">
        {['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'].map(status => (
          <button 
            key={status}
            className={`filter-tab ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loader-container"><div className="loader"></div></div>
      ) : (
        <div className="activity-list">
          {filteredRequests.length > 0 ? filteredRequests.map((req) => (
            <div key={req.id} className="activity-item card">
              <div className="activity-info">
                <div className="avatar-placeholder gold-text">
                  {req.user.name.charAt(0)}
                </div>
                <div>
                  <h3>{req.user.name}</h3>
                  <p>{req.serviceType} • {req.description || 'No description provided'}</p>
                </div>
              </div>
              <div className="activity-meta">
                <div className="meta-item">
                  <Calendar size={14} />
                  <span>{new Date(req.scheduledDate).toLocaleDateString()}</span>
                </div>
                {req.status === 'PENDING' && (
                  <div className="action-btns">
                    <button 
                      onClick={() => handleStatusUpdate(req.id, 'ACCEPTED')}
                      className="status-btn accept"
                    >
                      <CheckCircle size={20} />
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(req.id, 'REJECTED')}
                      className="status-btn reject"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                )}
                {req.status !== 'PENDING' && (
                  <span className={`status-badge ${req.status.toLowerCase()}`}>{req.status}</span>
                )}
              </div>
            </div>
          )) : (
            <div className="empty-state">
              <p>No requests found in this category.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkerRequests;
