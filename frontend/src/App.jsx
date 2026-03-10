import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import UserDashboard from './pages/UserDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProfilePage from './pages/ProfilePage';
import ServiceSearch from './pages/ServiceSearch';
import ServiceHistory from './pages/ServiceHistory';
import WorkerRequests from './pages/WorkerRequests';

const HomeRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  
  switch (user.role) {
    case 'ROLE_USER': return <Navigate to="/user-dashboard" />;
    case 'ROLE_WORKER': return <Navigate to="/worker-dashboard" />;
    case 'ROLE_ADMIN': return <Navigate to="/admin" />;
    default: return <Navigate to="/login" />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            <Route path="/" element={<HomeRedirect />} />
            
            {/* User Routes */}
            <Route path="/user-dashboard" element={
              <ProtectedRoute roles={['ROLE_USER']}>
                <UserDashboard />
              </ProtectedRoute>
            } />
            <Route path="/search" element={
              <ProtectedRoute roles={['ROLE_USER']}>
                <ServiceSearch />
              </ProtectedRoute>
            } />

            {/* Worker Routes */}
            <Route path="/worker-dashboard" element={
              <ProtectedRoute roles={['ROLE_WORKER']}>
                <WorkerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/requests" element={
              <ProtectedRoute roles={['ROLE_WORKER']}>
                <WorkerRequests />
              </ProtectedRoute>
            } />

            {/* Common Protected Routes */}
            <Route path="/history" element={
              <ProtectedRoute roles={['ROLE_USER', 'ROLE_WORKER']}>
                <ServiceHistory />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute roles={['ROLE_ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;
