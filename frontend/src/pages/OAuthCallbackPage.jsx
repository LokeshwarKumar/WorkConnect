import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setOAuthSession } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const id = searchParams.get('id');
    const email = searchParams.get('email');
    const name = searchParams.get('name');
    const roles = searchParams.get('roles');

    if (!token || !id || !email) {
      navigate('/login', { replace: true });
      return;
    }

    const role = roles ? roles.split(',')[0] : null;
    const userData = { id, email, role, name };

    setOAuthSession({ token, user: userData });
    window.location.replace('/');
  }, [searchParams, setOAuthSession]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Signing you in...</h1>
        <p>Please wait while we finish your login.</p>
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
