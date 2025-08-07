import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import UserList from './UserList';
import axios from '../../utils/axios';
import './Sidebar.css';
import Profile from '../Profile';
import Avatar from '../common/Avatar';

const Sidebar = ({ onChatSelect, selectedChat, socket }) => {
  const [showUserList, setShowUserList] = useState(false);
  const [chats, setChats] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get('/chats');
        setChats(response.data);
      } catch (err) {
        console.error('Error fetching chats:', err);
      }
    };

    fetchChats();

    // Listen for profile updates
    socket?.on('profile_updated', () => {
      fetchChats();
    });

    return () => {
      socket?.off('profile_updated');
    };
  }, [socket]);

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
          {chats.map(chat => {
            const otherUser = chat.participants.find(p => p._id !== user?.id);
            return (
              <div
                key={chat._id}
                className={`chat-item ${selectedChat?._id === chat._id ? 'selected' : ''}`}
                onClick={() => onChatSelect(chat)}
              >
                <div className="chat-avatar">
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
      )}

      {showProfile && <Profile onClose={() => setShowProfile(false)} />}
    </div>
  );
};

export default Sidebar;