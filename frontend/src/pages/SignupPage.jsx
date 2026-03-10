import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, Briefcase, AlertCircle, Loader2 } from 'lucide-react';
import './Auth.css';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER'
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await signup(formData);
    
    if (result.success) {
      navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
    } else {
      setError(result.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-wrapper">
            <UserPlus size={32} className="gold-text" />
          </div>
          <h1>Join <span className="gold-text">WorkConnect</span></h1>
          <p>Exclusivity meets elite craftsmanship.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="error-box">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="input-group">
            <label>Full Name</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input 
                type="text" 
                name="name"
                placeholder="John Doe" 
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                name="email"
                placeholder="john@example.com" 
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                name="password"
                placeholder="••••••••" 
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Membership Role</label>
            <div className="role-selector">
              <label className={`role-option ${formData.role === 'USER' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="role" 
                  value="USER" 
                  checked={formData.role === 'USER'}
                  onChange={handleChange}
                />
                <User size={16} />
                <span>Customer</span>
              </label>
              <label className={`role-option ${formData.role === 'WORKER' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="role" 
                  value="WORKER" 
                  checked={formData.role === 'WORKER'}
                  onChange={handleChange}
                />
                <Briefcase size={16} />
                <span>Worker</span>
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            className="gold-btn full-width"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already a member? <Link to="/login" className="gold-text">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
