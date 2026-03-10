import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, User, Briefcase, Search, Settings } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          WORK<span className="gold-text">CONNECT</span>
        </Link>
        <div className="navbar-links">
          <Link to="/" className="nav-item">
            <Home size={20} />
            <span>Home</span>
          </Link>

          {user.role === 'ROLE_USER' && (
            <>
              <Link to="/search" className="nav-item">
                <Search size={20} />
                <span>Search</span>
              </Link>
              <Link to="/history" className="nav-item">
                <Briefcase size={20} />
                <span>History</span>
              </Link>
            </>
          )}

          {user.role === 'ROLE_WORKER' && (
            <>
              <Link to="/requests" className="nav-item">
                <Briefcase size={20} />
                <span>Requests</span>
              </Link>
              <Link to="/history" className="nav-item">
                <Briefcase size={20} />
                <span>History</span>
              </Link>
            </>
          )}

          {user.role === 'ROLE_ADMIN' && (
            <Link to="/admin" className="nav-item">
              <Settings size={20} />
              <span>Admin</span>
            </Link>
          )}

          <Link to="/profile" className="nav-item">
            <User size={20} />
            <span>Profile</span>
          </Link>

          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
