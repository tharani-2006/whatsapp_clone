import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import './Register.css';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, phone: digitsOnly });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const formatPhoneForServer = (digits) => {
    if (!digits) return '';
    return `+91${digits}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        phone: formatPhoneForServer(formData.phone),
      };
      await api.post('/register', payload);
      const loginResp = await api.post('/login', { email: formData.email, password: formData.password });
      login(loginResp.data.user, loginResp.data.token);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
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
            <span className="logo-text">WhatsApp</span>
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
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ padding: '10px 12px', background: '#f0f2f5', borderRadius: '8px' }}>+91</span>
                <input
                  type="tel"
                  placeholder="10-digit phone number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field"
                  pattern="^[0-9]{10}$"
                  maxLength={10}
                  inputMode="numeric"
                  autoComplete="tel"
                  title="Enter exactly 10 digits"
                  required
                />
              </div>
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
              {loading ? 'Creating account...' : 'Create Account'}
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