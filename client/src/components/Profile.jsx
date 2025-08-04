import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';
import './Profile.css';

const Profile = ({ onClose }) => {
  const { user, login } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [about, setAbout] = useState(user?.about || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.put('/user/profile', {
        name,
        about
      });

      // Update the user in context
      login({ ...user, ...response.data }, localStorage.getItem('token'));
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-modal">
      <div className="profile-content">
        <h2>Edit Profile</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          <div className="form-group">
            <label>About</label>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Hey there! I am using WhatsApp"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={user?.email}
              disabled
            />
          </div>
          <div className="button-group">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;