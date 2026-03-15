import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Mail, MapPin, Briefcase, DollarSign, Save, Loader2 } from 'lucide-react';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    contactDetails: '',
    address: '',
    serviceType: '',
    location: '',
    minimumCharge: 0,
    hourlyCharge: 0
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [userRes, workerRes] = await Promise.all([
          api.get('/users/profile'),
          user.role === 'ROLE_WORKER' ? api.get('/workers/profile') : Promise.resolve({ data: {} })
        ]);
        setProfile({ ...userRes.data, ...workerRes.data });
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user.role]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Validate user profile data
      const userProfileData = {
        name: profile.name?.trim(),
        contactDetails: profile.contactDetails?.trim() || '',
        address: profile.address?.trim() || ''
      };

      if (!userProfileData.name) {
        throw new Error('Name is required');
      }

      if (user.role === 'ROLE_USER' || user.role === 'ROLE_WORKER') {
        await api.put('/users/profile', userProfileData);
      }
      
      if (user.role === 'ROLE_WORKER') {
        const workerProfileData = {
          serviceType: profile.serviceType?.trim(),
          location: profile.location?.trim(),
          minimumCharge: Number(profile.minimumCharge) || 0,
          hourlyCharge: Number(profile.hourlyCharge) || 0
        };

        // Validate worker-specific fields
        if (!workerProfileData.serviceType || !workerProfileData.location) {
          throw new Error('Service type and location are required for workers');
        }

        await api.post('/workers/profile', workerProfileData);
      }
      
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Update profile error:', error.response?.data || error);
      
      let errorMessage = 'Failed to update profile';
      
      if (error.response?.data) {
        // Handle validation errors from backend
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors) {
          // Handle field-specific validation errors
          errorMessage = error.response.data.errors.map(err => err.defaultMessage || err.message).join(', ');
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="loader-container"><div className="loader"></div></div>;

  return (
    <div className="profile-container container">
      <header className="profile-header">
        <div className="profile-avatar-large">
          {profile.name?.charAt(0)}
        </div>
        <h1>{profile.name}</h1>
        <p className="gold-text">{user.role.replace('ROLE_', '')}</p>
      </header>

      <div className="profile-content card">
        <form onSubmit={handleUpdate} className="profile-form">
          <div className="form-grid">
            <div className="input-group">
              <label><User size={16} /> Full Name</label>
              <input 
                type="text" 
                value={profile.name || ''} 
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                placeholder="Your Name"
                required
              />
            </div>
            <div className="input-group">
              <label><Mail size={16} /> Email Address</label>
              <input type="email" value={profile.email} disabled />
            </div>
            <div className="input-group">
              <label><User size={16} /> Contact Details</label>
              <input 
                type="text" 
                value={profile.contactDetails || ''} 
                onChange={(e) => setProfile({...profile, contactDetails: e.target.value})}
                placeholder="Phone number, alternate email"
              />
            </div>
            <div className="input-group span-full">
              <label><MapPin size={16} /> Physical Address</label>
              <textarea 
                value={profile.address || ''} 
                onChange={(e) => setProfile({...profile, address: e.target.value})}
                placeholder="Your primary service/billing address"
              />
            </div>

            {user.role === 'ROLE_WORKER' && (
              <>
                <div className="divider span-full">
                  <span>Professional Details</span>
                </div>
                <div className="input-group">
                  <label><Briefcase size={16} /> Service Type</label>
                  <input 
                    type="text" 
                    value={profile.serviceType || ''} 
                    onChange={(e) => setProfile({...profile, serviceType: e.target.value})}
                    placeholder="e.g. Master Plumber"
                    required
                  />
                </div>
                <div className="input-group">
                  <label><DollarSign size={16} /> Minimum Charge</label>
                  <input 
                    type="number" 
                    value={profile.minimumCharge || 0} 
                    onChange={(e) => setProfile({...profile, minimumCharge: Number(e.target.value)})}
                  />
                </div>
                <div className="input-group">
                  <label><DollarSign size={16} /> Hourly Charge</label>
                  <input 
                    type="number" 
                    value={profile.hourlyCharge || 0} 
                    onChange={(e) => setProfile({...profile, hourlyCharge: Number(e.target.value)})}
                  />
                </div>
                <div className="input-group span-full">
                  <label><MapPin size={16} /> Service Location</label>
                  <input 
                    type="text" 
                    value={profile.location || ''} 
                    onChange={(e) => setProfile({...profile, location: e.target.value})}
                    placeholder="City, Region"
                    required
                  />
                </div>
              </>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="gold-btn" disabled={isSaving}>
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Update Profile</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
