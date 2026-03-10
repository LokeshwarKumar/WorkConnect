import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, MapPin, DollarSign, Star, Briefcase, Filter, X } from 'lucide-react';
import './ServiceSearch.css';

const ServiceSearch = () => {
  const [workers, setWorkers] = useState([]);
  const [filters, setFilters] = useState({
    serviceType: '',
    location: '',
    maxCharge: ''
  });
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [bookingData, setBookingData] = useState({
    scheduledDate: '',
    serviceType: '',
    additionalNotes: ''
  });

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/workers/search', {
        params: {
          serviceType: filters.serviceType,
          location: filters.location,
          maxCharge: filters.maxCharge || 1000000,
          page: 0,
          size: 20
        }
      });
      setWorkers(response.data.content);
    } catch (error) {
      console.error('Error fetching workers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/requests', {
        workerId: selectedWorker.id,
        scheduledDate: bookingData.scheduledDate,
        serviceType: selectedWorker.serviceType, // Default to worker's primary service
        description: bookingData.additionalNotes
      });
      alert('Request sent successfully!');
      setSelectedWorker(null);
    } catch (error) {
      alert('Failed to send request');
    }
  };

  return (
    <div className="search-page container">
      <header className="page-header">
        <h1>Elite <span className="gold-text">Marketplace</span></h1>
        <p>Find the finest craftsmanship for your needs.</p>
      </header>

      <div className="search-filters card">
        <div className="filter-group">
          <Search size={18} className="gold-text" />
          <input 
            placeholder="Service (e.g. Plumbing, IT)" 
            value={filters.serviceType}
            onChange={(e) => setFilters({...filters, serviceType: e.target.value})}
          />
        </div>
        <div className="filter-group">
          <MapPin size={18} className="gold-text" />
          <input 
            placeholder="Location" 
            value={filters.location}
            onChange={(e) => setFilters({...filters, location: e.target.value})}
          />
        </div>
        <div className="filter-group">
          <DollarSign size={18} className="gold-text" />
          <input 
            type="number"
            placeholder="Max Charge" 
            value={filters.maxCharge}
            onChange={(e) => setFilters({...filters, maxCharge: e.target.value})}
          />
        </div>
        <button className="gold-btn" onClick={fetchWorkers}>Search</button>
      </div>

      {loading ? (
        <div className="loader-container"><div className="loader"></div></div>
      ) : (
        <div className="workers-grid">
          {workers.map((worker) => (
            <div key={worker.id} className="worker-card card">
              <div className="worker-header">
                <div className="worker-avatar">
                  {worker.user.name.charAt(0)}
                </div>
                <div className="worker-rating">
                  <Star size={14} fill="var(--color-gold-bright)" color="var(--color-gold-bright)" />
                  <span>{worker.rating?.toFixed(1) || 'NEW'}</span>
                </div>
              </div>
              <div className="worker-body">
                <h3>{worker.user.name}</h3>
                <p className="service-type">{worker.serviceType}</p>
                <div className="worker-meta">
                  <span><MapPin size={14} /> {worker.location}</span>
                  <span><DollarSign size={14} /> {worker.charges}/hr</span>
                </div>
              </div>
              <button 
                className="gold-btn full-width"
                onClick={() => setSelectedWorker(worker)}
              >
                Request Service
              </button>
            </div>
          ))}
          {workers.length === 0 && <p className="no-results">No elite workers found matching your criteria.</p>}
        </div>
      )}

      {selectedWorker && (
        <div className="modal-overlay">
          <div className="modal-content card gold-border">
            <button className="close-btn" onClick={() => setSelectedWorker(null)}><X size={24} /></button>
            <h2>Book <span className="gold-text">{selectedWorker.user.name}</span></h2>
            <form onSubmit={handleBookingSubmit} className="booking-form">
              <div className="input-group">
                <label>Scheduled Date</label>
                <input 
                  type="datetime-local" 
                  required 
                  onChange={(e) => setBookingData({...bookingData, scheduledDate: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label>Additional Requirements</label>
                <textarea 
                  placeholder="Describe your specific needs..."
                  onChange={(e) => setBookingData({...bookingData, additionalNotes: e.target.value})}
                />
              </div>
              <button type="submit" className="gold-btn full-width">Confirm Request</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceSearch;
