import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import UserList from './UserList';
import axios from 'axios';
import './Sidebar.css';

const Sidebar = ({ onChatSelect, selectedChat }) => {
  const [showUserList, setShowUserList] = useState(false);
  const [chats, setChats] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/chats', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setChats(response.data);
      } catch (err) {
        console.error('Error fetching chats:', err);
      }
    };

    fetchChats();
  }, []);

  const handleUserSelect = (chat) => {
    setShowUserList(false);
    onChatSelect(chat);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="user-info">
          <span>{user?.email}</span>
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
    </div>
  );
};

export default Sidebar;