import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
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
  const { user } = useAuth();

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

  // Updated handler for when a new chat is created
  const handleNewChat = async (chat) => {
    // Update chats list
    await fetchChats();
    // Select the new chat
    onChatSelect(chat);
    // Close the user list modal
    setShowUserList(false);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="user-profile" onClick={() => setShowProfile(true)}>
          <Avatar user={user} size={40} />
        </div>
        <button 
          className="new-chat-button"
          onClick={() => setShowUserList(true)}
        >
          New Chat
        </button>
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