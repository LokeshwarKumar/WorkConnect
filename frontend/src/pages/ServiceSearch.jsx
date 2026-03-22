import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Search, MapPin, Star, Briefcase, X, MessageSquare, Phone, DollarSign } from 'lucide-react';
import './ServiceSearch.css';

const ServiceSearch = () => {
  const [workers, setWorkers] = useState([]);
  const [filters, setFilters] = useState({
    serviceType: '',
    location: '',
    keyword: '',
    maxCharge: '',
    minRating: '',
  });
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [workerReviews, setWorkerReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    description: '',
    location: '',
  });

  const fetchWorkers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/workers/search', {
        params: {
          serviceType: filters.serviceType || undefined,
          location: filters.location || undefined,
          keyword: filters.keyword || undefined,
          maxCharge: filters.maxCharge ? Number(filters.maxCharge) : 1000000,
          minRating: filters.minRating !== '' ? Number(filters.minRating) : 0,
          page: 0,
          size: 24,
        },
      });
      setWorkers(response.data?.content || []);
    } catch (error) {
      console.error('Error fetching workers:', error);
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  }, [filters.serviceType, filters.location, filters.keyword, filters.maxCharge, filters.minRating]);

  useEffect(() => {
    fetchWorkers();
  }, []);

  useEffect(() => {
    const loadReviews = async () => {
      if (!selectedWorker?.id) {
        setWorkerReviews([]);
        return;
      }
      setReviewsLoading(true);
      try {
        const res = await api.get(`/reviews/worker/${selectedWorker.id}`);
        setWorkerReviews(res.data || []);
      } catch {
        setWorkerReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };
    loadReviews();
  }, [selectedWorker]);

  const openBook = (worker) => {
    setSelectedWorker(worker);
    setBookingData({
      description: '',
      location: worker.location || '',
    });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    const desc = bookingData.description?.trim();
    const loc = bookingData.location?.trim();
    if (!desc || !loc) {
      alert('Please provide a service description and location for the visit.');
      return;
    }
    try {
      await api.post('/requests', {
        workerId: selectedWorker.id,
        description: desc,
        location: loc,
      });
      alert('Request sent successfully! The worker can accept or decline from their dashboard.');
      setSelectedWorker(null);
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        (typeof error.response?.data === 'string' ? error.response.data : null) ||
        'Failed to send request';
      alert(msg);
    }
  };

  const displayRating = (r) => (r != null && !Number.isNaN(Number(r)) ? Number(r).toFixed(1) : '—');

  return (
    <div className="search-page container">
      <header className="page-header">
        <h1>
          Service <span className="gold-text">Marketplace</span>
        </h1>
        <p>Find skilled workers by trade, location, keywords, and rating.</p>
      </header>

      <div className="search-filters card">
        <div className="filter-group">
          <Search size={18} className="gold-text" />
          <input
            placeholder="Work type (e.g. Plumbing)"
            value={filters.serviceType}
            onChange={(e) => setFilters({ ...filters, serviceType: e.target.value })}
          />
        </div>
        <div className="filter-group">
          <MapPin size={18} className="gold-text" />
          <input
            placeholder="Location"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          />
        </div>
        <div className="filter-group">
          <Briefcase size={18} className="gold-text" />
          <input
            placeholder="Keywords (matches services & bio)"
            value={filters.keyword}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
          />
        </div>
        <div className="filter-group">
          <DollarSign size={18} className="gold-text" />
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Max min. charge"
            value={filters.maxCharge}
            onChange={(e) => setFilters({ ...filters, maxCharge: e.target.value })}
          />
        </div>
        <div className="filter-group">
          <Star size={18} className="gold-text" />
          <input
            type="number"
            min="0"
            max="5"
            step="0.5"
            placeholder="Min rating"
            value={filters.minRating}
            onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
          />
        </div>
        <button type="button" className="gold-btn" onClick={fetchWorkers}>
          Search
        </button>
      </div>

      {loading ? (
        <div className="loader-container">
          <div className="loader" />
        </div>
      ) : (
        <div className="workers-grid">
          {workers.map((worker) => (
            <div key={worker.id} className="worker-card card">
              <div className="worker-header">
                <div className="worker-avatar">{(worker.name || '?').charAt(0)}</div>
                <div className="worker-rating">
                  <Star size={14} fill="var(--color-gold-bright)" color="var(--color-gold-bright)" />
                  <span>{displayRating(worker.rating)}</span>
                </div>
              </div>
              <div className="worker-body">
                <h3>{worker.name}</h3>
                <p className="service-type">{worker.serviceType}</p>
                <div className="worker-meta">
                  <span>
                    <MapPin size={14} /> {worker.location || '—'}
                  </span>
                  <span>
                    <span style={{ fontWeight: 700, marginRight: 4, color: 'var(--color-gold-bright)' }}>₹</span>
                    min {worker.minimumCharge ?? '—'} · {worker.hourlyCharge ?? '—'}/hr
                  </span>
                  <span>
                    <Phone size={14} /> {worker.contactDetails || '—'}
                  </span>
                  <span>
                    <Briefcase size={14} /> {worker.servicesDone ?? 0} services done
                  </span>
                </div>
                {worker.description && <p className="worker-desc-preview">{worker.description}</p>}
              </div>
              <button type="button" className="gold-btn full-width" onClick={() => openBook(worker)}>
                Request service
              </button>
            </div>
          ))}
          {workers.length === 0 && (
            <p className="no-results">No workers match your filters. Try broadening search.</p>
          )}
        </div>
      )}

      {selectedWorker && (
        <div className="modal-overlay">
          <div className="modal-content card gold-border">
            <button type="button" className="close-btn" onClick={() => setSelectedWorker(null)}>
              <X size={24} />
            </button>
            <h2>
              Book <span className="gold-text">{selectedWorker.name}</span>
            </h2>
            <p className="modal-sub">
              {selectedWorker.serviceType} · Rating {displayRating(selectedWorker.rating)}
            </p>
            <p className="muted" style={{ marginTop: '-0.25rem' }}>
              <Phone size={14} style={{ marginRight: 6 }} /> Mobile: {selectedWorker.contactDetails || '—'}
            </p>
            <p className="muted" style={{ marginTop: '0.25rem' }}>
              <Briefcase size={14} style={{ marginRight: 6 }} /> {selectedWorker.servicesDone ?? 0} services done
            </p>

            <div className="reviews-section">
              <h4>
                <MessageSquare size={16} /> Recent reviews
              </h4>
              {reviewsLoading ? (
                <p className="muted">Loading reviews…</p>
              ) : workerReviews.length === 0 ? (
                <p className="muted">No reviews yet.</p>
              ) : (
                <ul className="review-mini-list">
                  {workerReviews.slice(0, 5).map((rev) => (
                    <li key={rev.id}>
                      <strong>{rev.reviewerName}</strong> · {rev.rating}★ — {rev.comment || 'No comment'}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <form onSubmit={handleBookingSubmit} className="booking-form">
              <div className="input-group">
                <label>Service location *</label>
                <input
                  type="text"
                  required
                  value={bookingData.location}
                  onChange={(e) => setBookingData({ ...bookingData, location: e.target.value })}
                  placeholder="Address or area for the visit"
                />
              </div>
              <div className="input-group">
                <label>Describe what you need *</label>
                <textarea
                  required
                  rows={4}
                  value={bookingData.description}
                  onChange={(e) => setBookingData({ ...bookingData, description: e.target.value })}
                  placeholder="Scope of work, timing preferences, access notes…"
                />
              </div>
              <button type="submit" className="gold-btn full-width">
                Send request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceSearch;
