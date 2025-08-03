import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './UserList.css';

const UserList = ({ onUserSelect }) => {
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const searchUser = async (e) => {
    e.preventDefault();
    if (!searchEmail) return;

    setLoading(true);
    setError('');
    setSearchResult(null);

    try {
      const response = await axios.get(
        `http://localhost:5000/api/users/search?email=${searchEmail}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data) {
        if (response.data._id === user.id) {
          setError("This is your email address");
        } else {
          setSearchResult(response.data);
        }
      } else {
        setError('User not found');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error searching for user');
    } finally {
      setLoading(false);
    }
  };

  const startChat = async (selectedUser) => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/chat',
        { userId: selectedUser._id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      onUserSelect(response.data);
    } catch (err) {
      console.error('Error starting chat:', err);
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
            onClick={() => onUserSelect(searchResult)}
          >
            <div className="user-info">
              <span className="user-email">{searchResult.email}</span>
              <button 
                className="start-chat-button"
                onClick={() => startChat(searchResult)}
              >
                Start Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
