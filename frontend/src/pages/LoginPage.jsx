import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import './Auth.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await login(email, password);
    
    if (result.success) {
      const origin = location.state?.from?.pathname || '/';
      navigate(origin);
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
            <LogIn size={32} className="gold-text" />
          </div>
          <h1>Welcome <span className="gold-text">Back</span></h1>
          <p>The standard of professional services.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="error-box">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="gold-btn full-width"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/signup" className="gold-text">Register Now</Link></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
