import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from '../../utils/axios';
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
          <div className="user-item" onClick={() => onUserSelect(searchResult)}>
            <div className="user-info">
              <span className="user-email">{searchResult.email}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
