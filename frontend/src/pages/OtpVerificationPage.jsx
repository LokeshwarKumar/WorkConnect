import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  KeyRound,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import './Auth.css';

const OtpVerificationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp, resendOtp } = useAuth();

  const email = location.state?.email || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const [timeLeft, setTimeLeft] = useState(300);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate('/signup', { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(
      secs
    ).padStart(2, '0')}`;
  };

  const handleChange = (value, index) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();

    const pastedData = e.clipboardData.getData('text').trim();

    if (!/^\d{6}$/.test(pastedData)) return;

    const digits = pastedData.split('');
    setOtp(digits);

    inputRefs.current[5]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    const fullOtp = otp.join('');

    if (fullOtp.length !== 6) {
      setError('Please enter a complete 6-digit OTP');
      return;
    }

    setIsVerifying(true);

    try {
      const result = await verifyOtp(email, fullOtp);

      if (result.success) {
        setSuccess(
          'Email verified successfully! Redirecting to sign in...'
        );

        setTimeout(() => {
          navigate('/login', {
            state: {
              message:
                'Account verified successfully! Please sign in.'
            }
          });
        }, 2000);
      } else {
        setError(result.message || 'Invalid OTP');
      }
    } catch (err) {
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setError('');
    setSuccess('');
    setIsResending(true);

    try {
      const result = await resendOtp(email);

      if (result.success) {
        setSuccess('A new OTP has been sent to your email.');

        setOtp(['', '', '', '', '', '']);
        setTimeLeft(300);
        setCanResend(false);

        inputRefs.current[0]?.focus();
      } else {
        setError(result.message || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-wrapper">
            <KeyRound size={32} className="gold-text" />
          </div>

          <h1>
            Verify <span className="gold-text">Email</span>
          </h1>

          <p>We sent a 6-digit verification code to:</p>

          <div
            className="email-display gold-text"
            style={{
              marginTop: '0.5rem',
              fontWeight: '600',
              wordBreak: 'break-all'
            }}
          >
            {email}
          </div>
        </div>

        <form onSubmit={handleVerify} className="auth-form">
          {error && (
            <div className="error-box">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              className="success-box"
              style={{
                background: 'rgba(46, 204, 113, 0.1)',
                border: '1px solid #2ecc71',
                color: '#2ecc71',
                padding: '0.8rem',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                fontSize: '0.85rem'
              }}
            >
              <CheckCircle size={18} />
              <span>{success}</span>
            </div>
          )}

          <div className="input-group">
            <label
              style={{
                textAlign: 'center',
                width: '100%'
              }}
            >
              Enter verification code
            </label>

            <div className="otp-input-container">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={digit}
                  className="otp-box"
                  ref={(el) => (inputRefs.current[index] = el)}
                  onChange={(e) =>
                    handleChange(e.target.value, index)
                  }
                  onKeyDown={(e) =>
                    handleKeyDown(e, index)
                  }
                  onPaste={handlePaste}
                  required
                />
              ))}
            </div>
          </div>

          <div className="timer-container">
            {timeLeft > 0 ? (
              <span>
                Code expires in:{' '}
                <strong className="gold-text">
                  {formatTime(timeLeft)}
                </strong>
              </span>
            ) : (
              <span
                className="error-text"
                style={{ color: '#ff4d4d' }}
              >
                The OTP has expired. Please request a new one.
              </span>
            )}
          </div>

          <button
            type="submit"
            className="gold-btn full-width"
            disabled={
              isVerifying || otp.join('').length !== 6
            }
          >
            {isVerifying ? (
              <Loader2
                className="animate-spin"
                size={20}
              />
            ) : (
              'Verify Code'
            )}
          </button>

          <div
            className="auth-footer"
            style={{ marginTop: '1.5rem' }}
          >
            <p>
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={!canResend || isResending}
                className="resend-btn gold-text"
              >
                {isResending
                  ? 'Sending...'
                  : 'Resend Code'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OtpVerificationPage;