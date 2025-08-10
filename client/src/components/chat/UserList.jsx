import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from '../../utils/axios';
import './UserList.css';

const UserList = ({ onUserSelect, onClose }) => {
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);
  const { user } = useAuth();

  const searchUser = async (e) => {
    e.preventDefault();
    if (!searchEmail) return;

    setLoading(true);
    setError('');
    setSearchResult(null);

    try {
      const response = await axios.get(`/users/search?email=${searchEmail}`);
      if (response.data._id === user.id) {
        setError("This is your email address");
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
          type="email"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          placeholder="Enter email address"
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
              <span className="user-email">{searchResult.email}</span>
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
