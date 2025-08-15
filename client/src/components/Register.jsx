import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import emailjs from 'emailjs-com';
import EMAILJS_CONFIG from '../utils/emailjsConfig';
import './Register.css';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Initialize EmailJS
    emailjs.init(EMAILJS_CONFIG.USER_ID);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendOTP = async () => {
    if (!formData.email || !formData.name) {
      setError('Please fill in all fields first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const otpCode = generateOTP();
      
      // Send OTP via EmailJS
      const templateParams = {
        to_email: formData.email,
        to_name: formData.name,
        otp_code: otpCode,
        message: `Your WhatsApp verification code is: ${otpCode}`
      };

      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams,
        EMAILJS_CONFIG.USER_ID
      );

      // Store OTP in localStorage temporarily (in production, you might want to use a more secure method)
      localStorage.setItem('tempOTP', otpCode);
      localStorage.setItem('tempUserData', JSON.stringify(formData));
      
      setOtpSent(true);
      setShowOtpInput(true);
      setError('');
    } catch (err) {
      console.error('Error sending OTP:', err);
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!showOtpInput) {
      await sendOTP();
      return;
    }

    // Verify OTP
    const storedOTP = localStorage.getItem('tempOTP');
    if (otp !== storedOTP) {
      setError('Invalid OTP. Please try again.');
      return;
    }

    // Clear temporary data
    localStorage.removeItem('tempOTP');
    localStorage.removeItem('tempUserData');

    try {
      const userData = JSON.parse(localStorage.getItem('tempUserData') || '{}');
      const response = await axios.post('http://localhost:5000/api/register', userData);
      login(response.data.user, response.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  const resendOTP = () => {
    setOtp('');
    setError('');
    sendOTP();
  };

  return (
    <div className="register-container">
      <header className="header">
        <div className="header-content">
          <div className="header-logo">
            <img 
              src="./images/whatsapp.png" 
              alt="WhatsApp" 
              className="logo-image"
            />
            <span className="logo-text">WhatsApp</span>
          </div>
        </div>
      </header>

      <div className="main-content">
        <div className="register-form-container">
          <h2 className="form-title">
            {showOtpInput ? 'Verify OTP' : 'Create Account'}
          </h2>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="form">
            {!showOtpInput ? (
              <>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    placeholder="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    placeholder="Password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </>
            ) : (
              <>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="input-field"
                    maxLength="6"
                    pattern="\d{6}"
                    required
                  />
                </div>
                <button type="submit" className="submit-button">
                  Verify & Register
                </button>
                <button 
                  type="button" 
                  onClick={resendOTP}
                  className="resend-button"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Resend OTP'}
                </button>
              </>
            )}
          </form>
          <p className="login-link">
            Already have an account?{' '}
            <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;