import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './UserList.css';

const UserList = ({ onUserSelect }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        // Filter out current user
        setUsers(response.data.filter(u => u._id !== user.id));
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user.id]);

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

  if (loading) {
    return <div className="user-list-loading">Loading users...</div>;
  }

  return (
    <div className="user-list">
      <h2 className="user-list-title">Available Users</h2>
      {users.map(user => (
        <div
          key={user._id}
          className="user-item"
          onClick={() => startChat(user)}
        >
          <div className="user-info">
            <span className="user-email">{user.email}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserList;
