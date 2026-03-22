import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Mail, MapPin, Briefcase, Save, Edit2, X, Loader2, Check, Phone, Home } from 'lucide-react';
import './ProfilePage.css';

const toAuthRole = (apiRole) => {
  if (!apiRole) return 'ROLE_USER';
  const s = String(apiRole);
  if (s.startsWith('ROLE_')) return s;
  return `ROLE_${s}`;
};

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    contactDetails: '',
    address: '',
    location: '',
    description: '',
    serviceType: '',
    minimumCharge: 0,
    hourlyCharge: 0,
    availability: true,
    rating: 0
  });
  const [originalProfile, setOriginalProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      if (!user) {
        setSaveStatus('error');
        setLoading(false);
        return;
      }

      const response = await api.get('/profile');
      
      setProfile(response.data);
      setOriginalProfile(response.data);
    } catch (error) {
      let errorMessage = 'Failed to load profile data';
      
      if (error.response?.status === 401) {
        errorMessage = 'Authentication expired. Please login again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. You do not have permission to view this profile.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Profile not found. Please complete your profile first.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (!error.response) {
        errorMessage = 'Network error. Please check your connection and ensure backend is running.';
      }
      
      setSaveStatus(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus('');
    
    try {
      const profileData = {
        name: profile.name?.trim() || '',
        email: profile.email?.trim() || '',
        contactDetails: profile.contactDetails?.trim() || '',
        address: profile.address?.trim() || ''
      };

      if (user.role === 'ROLE_WORKER') {
        profileData.location = profile.location?.trim() || '';
        profileData.description = profile.description?.trim() || '';
        profileData.serviceType = profile.serviceType?.trim() || '';
        profileData.minimumCharge = Number(profile.minimumCharge) || 0;
        profileData.hourlyCharge = Number(profile.hourlyCharge) || 0;
        profileData.availability = profile.availability !== false;
      }

      // Validation
      if (!profileData.name) {
        throw new Error('Name is required');
      }

      if (profileData.email && !profileData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        throw new Error('Invalid email format');
      }

      if (user.role === 'ROLE_WORKER') {
        if (!profileData.location) {
          throw new Error('Location is required for workers');
        }
        if (!profileData.serviceType) {
          throw new Error('Service type is required for workers');
        }
        if (profileData.minimumCharge < 0 || profileData.hourlyCharge < 0) {
          throw new Error('Charges must be non-negative');
        }
      }

      const response = await api.put('/profile', profileData);

      setProfile(response.data);
      setOriginalProfile(response.data);
      updateUser({
        name: response.data.name,
        email: response.data.email,
        role: toAuthRole(response.data.role),
      });
      setIsEditing(false);
      setSaveStatus('success');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      let errorMessage = 'Failed to update profile';
      
      // Check for network errors specifically
      if (!error.response) {
        if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
          errorMessage = 'Network error. Please check your connection and ensure backend is running.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timeout. Please try again.';
        } else {
          errorMessage = 'Network error. Please check your internet connection.';
        }
      } else if (error.response?.data) {
        const data = error.response.data;
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) {
          errorMessage = Object.values(data.errors).filter(Boolean).join(', ');
        } else if (Array.isArray(data.errors)) {
          errorMessage = data.errors.map((err) => err.defaultMessage || err.message).filter(Boolean).join(', ');
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setSaveStatus(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setProfile(originalProfile);
    setIsEditing(false);
    setSaveStatus('');
  };

  const toggleEdit = () => {
    if (isEditing) {
      handleCancel();
    } else {
      setIsEditing(true);
      setSaveStatus('');
    }
  };

  if (loading) return (
    <div className="profile-container container">
      <div className="loader-container">
        <Loader2 className="loader" />
        <p>Loading profile...</p>
      </div>
    </div>
  );

  // Show error state if data failed to load
  if (saveStatus === 'error' && !profile.name) {
    return (
      <div className="profile-container container">
        <div className="error-state">
          <X size={48} />
          <h2>Profile Loading Failed</h2>
          <p>{saveStatus}</p>
          <button onClick={fetchProfile} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const isWorker = user.role === 'ROLE_WORKER';

  return (
    <div className="profile-container container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <button 
          className={`edit-btn ${isEditing ? 'cancel' : ''}`}
          onClick={toggleEdit}
          disabled={isSaving}
        >
          {isEditing ? <X size={16} /> : <Edit2 size={16} />}
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {saveStatus && (
        <div className={`status-message ${saveStatus === 'success' ? 'success' : 'error'}`}>
          {saveStatus === 'success' ? <Check size={16} /> : <X size={16} />}
          {saveStatus === 'success' ? 'Profile updated successfully!' : saveStatus}
        </div>
      )}

      <form onSubmit={handleSave} className="profile-form">
        <div className="form-section">
          <h3><User size={16} /> Basic Information</h3>
          
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              value={profile.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={!isEditing}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email"><Mail size={16} /> Email Address</label>
            <input
              type="email"
              id="email"
              value={profile.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group">
            <label htmlFor="contactDetails"><Phone size={16} /> Contact Number</label>
            <input
              type="text"
              id="contactDetails"
              value={profile.contactDetails || ''}
              onChange={(e) => handleInputChange('contactDetails', e.target.value)}
              disabled={!isEditing}
              placeholder="+1234567890"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address"><Home size={16} /> Address</label>
            <textarea
              id="address"
              value={profile.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              disabled={!isEditing}
              rows={3}
            />
          </div>
        </div>

        {isWorker && (
          <div className="form-section">
            <h3><Briefcase size={16} /> Professional Information</h3>
            
            <div className="form-group">
              <label htmlFor="location"><MapPin size={16} /> Service Location *</label>
              <input
                type="text"
                id="location"
                value={profile.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                disabled={!isEditing}
                required
                placeholder="City, State"
              />
            </div>

            <div className="form-group">
              <label htmlFor="serviceType">Service Type *</label>
              <input
                type="text"
                id="serviceType"
                value={profile.serviceType || ''}
                onChange={(e) => handleInputChange('serviceType', e.target.value)}
                disabled={!isEditing}
                required
                placeholder="e.g., Plumbing, Electrical, Cleaning"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={profile.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={!isEditing}
                rows={3}
                placeholder="Describe your services and experience..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="minimumCharge"><span style={{ fontWeight: 700, marginRight: 6, color: 'var(--color-gold-bright)' }}>₹</span>Minimum Charge</label>
                <input
                  type="number"
                  id="minimumCharge"
                  value={profile.minimumCharge || 0}
                  onChange={(e) => handleInputChange('minimumCharge', e.target.value)}
                  disabled={!isEditing}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label htmlFor="hourlyCharge"><span style={{ fontWeight: 700, marginRight: 6, color: 'var(--color-gold-bright)' }}>₹</span>Hourly Charge</label>
                <input
                  type="number"
                  id="hourlyCharge"
                  value={profile.hourlyCharge || 0}
                  onChange={(e) => handleInputChange('hourlyCharge', e.target.value)}
                  disabled={!isEditing}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={profile.availability !== false}
                  onChange={(e) => handleInputChange('availability', e.target.checked)}
                  disabled={!isEditing}
                />
                Available for work
              </label>
            </div>

            {profile.rating > 0 && (
              <div className="rating-display">
                <strong>Rating:</strong> ⭐ {profile.rating.toFixed(1)}
              </div>
            )}
          </div>
        )}

        {isEditing && (
          <div className="form-actions">
            <button type="button" onClick={handleCancel} className="cancel-btn" disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={isSaving}>
              {isSaving ? <Loader2 size={16} className="spinning" /> : <Save size={16} />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfilePage;
