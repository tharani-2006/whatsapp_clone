import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Register.css';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  });
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSendOTP = async () => {
    try {
      await axios.post('/send-otp', { phone: formData.phone });
      setShowOTP(true);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!showOTP) {
      handleSendOTP();
      return;
    }

    try {
      const response = await axios.post('/verify-otp', {
        phone: formData.phone,
        otp
      });
      
      login(response.data.user, response.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
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
            <span className="logo-text">WhatApp</span>
          </div>
        </div>
      </header>

      <div className="main-content">
        <div className="register-form-container">
          <h2 className="form-title">Create Account</h2>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="form">
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
                type="tel"
                placeholder="Phone Number (10 digits)"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field"
                pattern="\d{10}"
                title="Please enter a valid 10-digit phone number"
                required
              />
            </div>

            {showOTP && (
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="input-field"
                  pattern="\d{6}"
                  maxLength="6"
                  required
                />
              </div>
            )}

            <button type="submit" className="submit-button">
              {showOTP ? 'Verify OTP' : 'Get OTP'}
            </button>
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