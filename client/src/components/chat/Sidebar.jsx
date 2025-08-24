import { useState, useEffect, useRef } from 'react';
import { IoChatboxEllipsesOutline, IoLogOutOutline } from 'react-icons/io5';
import { BsCameraFill } from 'react-icons/bs';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import axios from '../../utils/axios';
import UserList from './UserList';
import Profile from '../Profile';
import Avatar from '../common/Avatar';
import UserProfile from './UserProfile';
import './Sidebar.css';

const Sidebar = ({ onChatSelect, selectedChat }) => {
  const [showUserList, setShowUserList] = useState(false);
  const [chats, setChats] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { user, login } = useAuth();
  const socket = useSocket();
  const fileInputRef = useRef(null);

  // Fetch chats from backend
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

  // Refresh chats when profile updated via socket
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

  // Handle creating new chat
  const handleNewChat = async (chat) => {
    await fetchChats();
    onChatSelect(chat);
    setShowUserList(false);
  };

  const handleAvatarClick = (e, user) => {
    e.stopPropagation();
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
      if (user) {
        login({ ...user, profilePic: response.data.profilePic }, localStorage.getItem('token'));
      }
      // socket will auto-refresh chats
    } catch (err) {
      console.error('Error uploading profile picture:', err);
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        {/* User avatar / profile */}
        <div 
          className="user-profile" 
          onClick={() => setShowProfile(true)} 
          title="View profile"
        >
          <Avatar user={user} size={40} />
        </div>

        {/* Sidebar action buttons */}
        <div className="sidebar-actions">
          <button
            className="new-chat-button"
            onClick={() => setShowUserList(true)}
            title="New chat"
          >
            <IoChatboxEllipsesOutline />
          </button>

          {!(user && user.profilePic) && (
            <button
              className="new-chat-button"
              onClick={handleUploadClick}
              title="Upload profile photo"
            >
              <BsCameraFill />
            </button>
          )}

          <button
            className="new-chat-button"
            onClick={() => window.location.href = '/login'}
            title="Logout"
          >
            <IoLogOutOutline />
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

      {/* Chat list */}
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

      {/* User profile modal */}
      {selectedUser && (
        <UserProfile 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
        />
      )}

      {/* User list modal */}
      {showUserList && (
        <UserList 
          onUserSelect={handleNewChat}
          onClose={() => setShowUserList(false)} 
        />
      )}

      {/* Current user's profile modal */}
      {showProfile && (
        <Profile onClose={() => setShowProfile(false)} />
      )}
    </div>
  );
};

export default Sidebar;
