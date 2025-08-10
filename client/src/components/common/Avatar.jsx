import React, { useState, useEffect } from 'react';

const DefaultAvatar = ({ size }) => (
  <div 
    style={{ 
      width: size,
      height: size,
      backgroundColor: '#6c7c86',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    <svg viewBox="0 0 212 212" width="60%" height="60%" style={{ fill: '#aebac1' }}>
      <path d="M106 0a106 106 0 1 0 106 106A106 106 0 0 0 106 0Zm0 170.667a64.667 64.667 0 1 1 64.667-64.667 64.667 64.667 0 0 1-64.667 64.667Z"/>
    </svg>
  </div>
);

const Avatar = ({ user, size = 40 }) => {
  const [showDefault, setShowDefault] = useState(!user?.profilePic);

  if (showDefault) {
    return <DefaultAvatar size={size} />;
  }

  return (
    <div style={{ width: size, height: size }}>
      <img
        src={`http://localhost:5000${user.profilePic}`}
        alt={user.name || user.email}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          objectFit: 'cover'
        }}
        onError={() => setShowDefault(true)}
      />
    </div>
  );
};

export default Avatar;