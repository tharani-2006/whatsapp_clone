import React from 'react';

const Avatar = ({ user, size = 40 }) => {
  const DefaultAvatar = () => (
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

  if (!user?.profilePic) {
    return <DefaultAvatar />;
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
        onError={(e) => {
          e.target.style.display = 'none';
          // Create and append default avatar properly
          const parent = e.target.parentElement;
          parent.innerHTML = ''; // Clear the parent
          const defaultAvatar = document.createElement('div');
          defaultAvatar.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            background-color: #6c7c86;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          `;
          defaultAvatar.innerHTML = `
            <svg viewBox="0 0 212 212" width="60%" height="60%" style="fill: #aebac1">
              <path d="M106 0a106 106 0 1 0 106 106A106 106 0 0 0 106 0Zm0 170.667a64.667 64.667 0 1 1 64.667-64.667 64.667 64.667 0 0 1-64.667 64.667Z"/>
            </svg>
          `;
          parent.appendChild(defaultAvatar);
        }}
      />
    </div>
  );
};

export default Avatar;