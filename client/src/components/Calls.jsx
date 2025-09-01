import { useState, useEffect } from 'react';
import * as axiosInstance from '../utils/axios';
import './Calls.css';

const axios = axiosInstance.default;

const Calls = () => {
  const [callHistory, setCallHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCallHistory = async () => {
      try {
        const response = await axios.get('/callHistory');
        setCallHistory(response.data);
      } catch (error) {
        setError(error);
        console.error('Error fetching call history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCallHistory();
  }, []);

  const formatCallTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getCallIcon = (type, status) => {
    if (type === 'video') {
      return status === 'missed' ? '📹❌' : '📹';
    }
    return status === 'missed' ? '📞❌' : '📞';
  };

  const getCallStatusColor = (status) => {
    switch (status) {
      case 'missed': return '#ff4444';
      case 'incoming': return '#00a884';
      case 'outgoing': return '#00a884';
      default: return '#8696a0';
    }
  };

  if (loading) {
    return (
      <div className="calls-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading call history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="calls-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Unable to load calls</h3>
          <p>Please check your connection and try again</p>
        </div>
      </div>
    );
  }

  return (
    <div className="calls-container">
      <div className="calls-header">
        <h2>Recent Calls</h2>
        <button className="new-call-button" title="New Call">
          📞
        </button>
      </div>

      <div className="calls-list">
        {callHistory.length === 0 ? (
          <div className="empty-calls">
            <div className="empty-icon">📞</div>
            <h3>No recent calls</h3>
            <p>When you make or receive calls, they'll appear here</p>
          </div>
        ) : (
          callHistory.map(call => (
            <div key={call._id} className="call-item">
              <div className="call-avatar">
                <div className="avatar-circle">
                  {call.caller?.name?.charAt(0).toUpperCase() || '?'}
                </div>
              </div>

              <div className="call-info">
                <div className="call-name">
                  {call.caller?.name || call.caller?.email || 'Unknown'}
                </div>
                <div className="call-details">
                  <span
                    className="call-type"
                    style={{ color: getCallStatusColor(call.status) }}
                  >
                    {getCallIcon(call.type, call.status)} {call.status || 'completed'}
                  </span>
                  <span className="call-time">
                    {formatCallTime(call.createdAt)}
                  </span>
                </div>
              </div>

              <div className="call-actions">
                <button
                  className="call-action-button"
                  title={`${call.type === 'video' ? 'Video' : 'Voice'} call`}
                >
                  {call.type === 'video' ? '📹' : '📞'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Calls;