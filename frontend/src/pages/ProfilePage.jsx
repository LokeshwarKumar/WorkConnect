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
    charges: 0
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
      if (user.role === 'ROLE_USER' || user.role === 'ROLE_WORKER') {
        await api.put('/users/profile', {
          contactDetails: profile.contactDetails,
          address: profile.address
        });
      }
      
      if (user.role === 'ROLE_WORKER') {
        await api.post('/workers/profile', {
          serviceType: profile.serviceType,
          location: profile.location,
          charges: profile.charges
        });
      }
      
      alert('Profile updated successfully');
    } catch (error) {
      alert('Failed to update profile');
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
                  />
                </div>
                <div className="input-group">
                  <label><DollarSign size={16} /> Hourly Charges</label>
                  <input 
                    type="number" 
                    value={profile.charges || 0} 
                    onChange={(e) => setProfile({...profile, charges: e.target.value})}
                  />
                </div>
                <div className="input-group span-full">
                  <label><MapPin size={16} /> Service Location</label>
                  <input 
                    type="text" 
                    value={profile.location || ''} 
                    onChange={(e) => setProfile({...profile, location: e.target.value})}
                    placeholder="City, Region"
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
