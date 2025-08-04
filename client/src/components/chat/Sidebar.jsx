import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import UserList from './UserList';
import axios from '../../utils/axios';
import './Sidebar.css';
import Profile from '../Profile';

const Sidebar = ({ onChatSelect, selectedChat }) => {
  const [showUserList, setShowUserList] = useState(false);
  const [chats, setChats] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    const fetchChats = async () => {
      if (!token) return;

      try {
        const response = await axios.get('http://localhost:5000/api/chats', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setChats(response.data);
      } catch (err) {
        if (err.response?.status === 401) {
          // Handle unauthorized error - maybe logout the user
          console.log('Session expired. Please login again.');
        } else {
          console.error('Error fetching chats:', err);
        }
      }
    };

    fetchChats();
  }, [token]);

  const handleUserSelect = (chat) => {
    setShowUserList(false);
    onChatSelect(chat);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="user-info">
          <img
            src={user?.profilePic || '/default-avatar.png'}
            alt="Profile"
            className="profile-pic"
            onClick={() => setShowProfile(true)}
          />
          <span>{user?.name || user?.email}</span>
        </div>
        <button 
          className="new-chat-button"
          onClick={() => setShowUserList(!showUserList)}
        >
          New Chat
        </button>
      </div>

      {showUserList ? (
        <UserList onUserSelect={handleUserSelect} />
      ) : (
        <div className="chat-list">
          {chats.map(chat => (
            <div
              key={chat._id}
              className={`chat-item ${selectedChat?._id === chat._id ? 'selected' : ''}`}
              onClick={() => onChatSelect(chat)}
            >
              <div className="chat-info">
                <span className="chat-name">
                  {chat.participants.find(p => p._id !== user?.id)?.email}
                </span>
                <span className="last-message">
                  {chat.lastMessage?.content || 'No messages yet'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showProfile && <Profile onClose={() => setShowProfile(false)} />}
    </div>
  );
};

export default Sidebar;