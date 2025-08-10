import React from 'react';
import Avatar from '../common/Avatar';
import './UserProfile.css';

const UserProfile = ({ user, onClose }) => {
  if (!user) return null;

  // Format phone number if it exists
  const formatPhoneNumber = (phone) => {
    if (!phone) return 'Not available';
    // Add spacing for better readability
    return phone.replace(/(\d{2})(\d{5})(\d{5})/, '$1 $2 $3');
  };

  return (
    <div className="user-profile-modal">
      <div className="user-profile-content">
        <div className="profile-header">
          <button className="close-button" onClick={onClose}>&times;</button>
          <h2>Contact Info</h2>
        </div>

        <div className="profile-info">
          <div className="profile-picture-large">
            <Avatar user={user} size={200} />
          </div>

          <div className="info-section">
            <h3>Name</h3>
            <p>{user.name || 'Not set'}</p>
          </div>

          <div className="info-section">
            <h3>Phone</h3>
            <p>{formatPhoneNumber(user.phone)}</p>
          </div>

          <div className="info-section">
            <h3>About</h3>
            <p>{user.about || 'Hey there! I am using WhatsApp'}</p>
          </div>

          <div className="info-section">
            <h3>Email</h3>
            <p>{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;