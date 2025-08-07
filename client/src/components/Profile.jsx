import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';
import Avatar from './common/Avatar';
import './Profile.css';

const Profile = ({ onClose }) => {
  const { user, login } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [about, setAbout] = useState(user?.about || '');
  const [profilePic, setProfilePic] = useState(user?.profilePic || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePic', file);

    try {
      setLoading(true);
      const response = await axios.post('/user/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Update local state and context with full URL
      const updatedUser = { ...user, profilePic: response.data.profilePic };
      setProfilePic(response.data.profilePic);
      login(updatedUser, localStorage.getItem('token'));
    } catch (err) {
      setError('Failed to upload profile picture');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.put('/user/profile', {
        name,
        about
      });

      // Update the user in context with new profile data
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
        <div className="profile-header">
          <button className="close-button" onClick={onClose}>&times;</button>
          <h2>Profile</h2>
        </div>

        <div className="profile-picture-container">
          <div className="profile-picture" onClick={() => fileInputRef.current?.click()}>
            <Avatar user={user} size={200} />
            <div className="profile-picture-overlay">
              <span>CHANGE PROFILE PHOTO</span>
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label>
              <span className="label-text">Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                maxLength={25}
              />
            </label>
            <p className="field-info">
              This is not your username or pin. This name will be visible to your WhatsApp contacts.
            </p>
          </div>

          <div className="form-group">
            <label>
              <span className="label-text">About</span>
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Hey there! I am using WhatsApp"
                maxLength={139}
              />
            </label>
          </div>

          <div className="form-group">
            <label>
              <span className="label-text">Email</span>
              <input
                type="email"
                value={user?.email}
                disabled
                className="disabled-input"
              />
            </label>
            <p className="field-info">
              This email is used for login and cannot be changed.
            </p>
          </div>

          <div className="button-group">
            <button 
              type="button" 
              className="cancel-button" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="save-button"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;