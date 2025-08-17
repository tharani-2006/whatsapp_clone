import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from '../../utils/axios';
import './UserList.css';

const UserList = ({ onUserSelect, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);
  const { user } = useAuth();

  const searchUser = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;

    setLoading(true);
    setError('');
    setSearchResult(null);

    try {
      const response = await axios.get(`/users/search?query=${searchQuery}`);
      if (response.data._id === user.id) {
        setError("This is your email address or phone number");
      } else {
        setSearchResult(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'User not found');
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (selectedUser) => {
    try {
      setCreatingChat(true);
      setError('');

      const response = await axios.post('/chat', { 
        userId: selectedUser._id 
      });

      const chatResponse = await axios.get(`/chat/${response.data._id}`);
      onUserSelect(chatResponse.data);
      onClose();
    } catch (err) {
      console.error('Error starting chat:', err);
      setError('Failed to start chat');
    } finally {
      setCreatingChat(false);
    }
  };

  return (
    <div className="user-list">
      <h2 className="user-list-title">New Chat</h2>
      <form onSubmit={searchUser} className="search-form">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Enter email or phone number"
          className="search-input"
          required
        />
        <button type="submit" className="search-button" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <div className="search-error">{error}</div>}

      {searchResult && (
        <div className="search-result">
          <div 
            className="user-item" 
            onClick={() => handleStartChat(searchResult)}
          >
            <div className="user-info">
              <span className="user-name">{searchResult.name || 'No name'}</span>
              <span className="user-email">{searchResult.email}</span>
              <span className="user-phone">{searchResult.phone}</span>
            </div>
          </div>
        </div>
      )}

      {searchResult && (
        <button 
          onClick={() => handleStartChat(searchResult)}
          disabled={loading || creatingChat}
          className="start-chat-button"
        >
          {creatingChat ? 'Starting chat...' : 'Start Chat'}
        </button>
      )}
    </div>
  );
};

export default UserList;
