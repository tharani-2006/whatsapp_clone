import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import UserList from './UserList';
import axios from '../../utils/axios';
import './Sidebar.css';
import Profile from '../Profile';
import Avatar from '../common/Avatar';
import UserProfile from './UserProfile';

const Sidebar = ({ onChatSelect, selectedChat }) => {
  const [showUserList, setShowUserList] = useState(false);
  const [chats, setChats] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { user, login } = useAuth();
  const socket = useSocket();
  const fileInputRef = useRef(null);

  const fetchChats = async () => {
    try {
      const response = await axios.get('/chats');
      setChats(response.data);
    } catch (err) {
      console.error('Error fetching chats:', err);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const onProfileUpdated = () => {
      fetchChats();
    };
    socket.on('profile_updated', onProfileUpdated);
    return () => {
      socket.off('profile_updated', onProfileUpdated);
    };
  }, [socket]);

  // Updated handler for when a new chat is created
  const handleNewChat = async (chat) => {
    // Update chats list
    await fetchChats();
    // Select the new chat
    onChatSelect(chat);
    // Close the user list modal
    setShowUserList(false);
  };

  const handleAvatarClick = (e, user) => {
    e.stopPropagation(); // Prevent chat selection
    setSelectedUser(user);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('profilePic', file);
      const response = await axios.post('/user/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Update current user in context
      if (user) {
        login({ ...user, profilePic: response.data.profilePic }, localStorage.getItem('token'));
      }
      // Chats will refresh via socket 'profile_updated'
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      // no UI toast system; silently fail in console
    } finally {
      // reset input so same file can be re-selected
      e.target.value = '';
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="user-profile" onClick={() => setShowProfile(true)} title="View profile">
          <Avatar user={user} size={40} />
        </div>
        <div className="sidebar-actions">
          <button 
            className="new-chat-button"
            onClick={() => setShowUserList(true)}
            >
            💬
          </button>
          {!(user && user.profilePic) && (
            <button
              className="new-chat-button"
              onClick={handleUploadClick}
              title="Upload profile photo"
            >
              📷
            </button>
          )}
          <button
            className="new-chat-button"
            onClick={() => window.location.href = '/login'}
            title="Logout"
          >
            ⎋
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      <div className="chat-list">
        {chats.map(chat => {
          const otherUser = chat.participants.find(p => p._id !== user?.id);
          return (
            <div
              key={chat._id}
              className={`chat-item ${selectedChat?._id === chat._id ? 'selected' : ''}`}
              onClick={() => onChatSelect(chat)}
            >
              <div 
                className="chat-avatar"
                onClick={(e) => handleAvatarClick(e, otherUser)}
              >
                <Avatar user={otherUser} size={48} />
              </div>
              <div className="chat-info">
                <span className="chat-name">
                  {otherUser?.name || otherUser?.email}
                </span>
                <span className="last-message">
                  {chat.lastMessage?.content || 'No messages yet'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add UserProfile modal */}
      {selectedUser && (
        <UserProfile 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
        />
      )}

      {showUserList && (
        <UserList 
          onUserSelect={handleNewChat}
          onClose={() => setShowUserList(false)} 
        />
      )}

      {showProfile && (
        <Profile onClose={() => setShowProfile(false)} />
      )}
    </div>
  );
};

export default Sidebar;