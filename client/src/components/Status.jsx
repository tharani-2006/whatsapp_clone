import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import * as axiosInstance from '../utils/axios';
import './Status.css';

const axios = axiosInstance.default;

const Status = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [statusUpdates, setStatusUpdates] = useState([]);
  const [myStatuses, setMyStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [newStatusText, setNewStatusText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch status updates
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const response = await axios.get('/status');
        const statuses = response.data;

        // Separate my statuses from others
        const myStatusList = statuses.filter(status => status.userId._id === user?.id);
        const othersStatusList = statuses.filter(status => status.userId._id !== user?.id);

        setMyStatuses(myStatusList);
        setStatusUpdates(othersStatusList);
      } catch (error) {
        console.error('Error fetching statuses:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStatuses();
    }
  }, [user]);

  const formatStatusTime = (timestamp) => {
    const now = new Date();
    const statusTime = new Date(timestamp);
    const diffTime = Math.abs(now - statusTime);
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return statusTime.toLocaleDateString();
    }
  };

  const handleAddStatus = () => {
    setShowAddModal(true);
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleCreateStatus = async () => {
    if (!newStatusText.trim() && !selectedImage) return;

    try {
      const formData = new FormData();
      formData.append('content', newStatusText);
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const response = await axios.post('/status', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Add new status to my statuses
      setMyStatuses(prev => [response.data, ...prev]);

      // Reset form
      setNewStatusText('');
      setSelectedImage(null);
      setShowAddModal(false);

      // Emit to socket for real-time updates
      if (socket && response.data) {
        socket.emit('new_status', response.data);
      }
    } catch (error) {
      console.error('Error creating status:', error);
      alert('Failed to create status. Please try again.');
    }
  };

  const handleDeleteStatus = async (statusId) => {
    if (!window.confirm('Delete this status?')) return;

    try {
      await axios.delete(`/status/${statusId}`);
      setMyStatuses(prev => prev.filter(status => status._id !== statusId));

      // Emit to socket for real-time updates
      if (socket) {
        socket.emit('status_deleted', statusId);
      }
    } catch (error) {
      console.error('Error deleting status:', error);
      alert('Failed to delete status. Please try again.');
    }
  };

  const handleViewStatus = (status) => {
    setSelectedStatus(status);
    setShowViewModal(true);

    // Mark as viewed
    setStatusUpdates(prev =>
      prev.map(s =>
        s._id === status._id ? { ...s, viewed: true } : s
      )
    );
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedStatus(null);
  };

  // Real-time status updates
  useEffect(() => {
    if (!socket || !user) return;

    const handleNewStatus = (status) => {
      if (status.userId._id !== user.id) {
        setStatusUpdates(prev => [status, ...prev]);
      }
    };

    const handleStatusDeleted = (statusId) => {
      setStatusUpdates(prev => prev.filter(status => status._id !== statusId));
    };

    socket.on('new_status', handleNewStatus);
    socket.on('status_deleted', handleStatusDeleted);

    return () => {
      socket.off('new_status', handleNewStatus);
      socket.off('status_deleted', handleStatusDeleted);
    };
  }, [socket, user]);

  if (loading) {
    return (
      <div className="status-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading status updates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="status-container">
      <div className="status-header">
        <h2>Status</h2>
        <button className="add-status-button" onClick={handleAddStatus} title="Add Status">
          📷
        </button>
      </div>

      <div className="status-content">
        {/* My Status Section */}
        <div className="my-status-section">
          <div className="section-title">My Status</div>

          {/* My Status Item */}
          <div className="my-status-item" onClick={handleAddStatus}>
            <div className="status-avatar my-avatar">
              <div className="avatar-circle">
                {user?.name?.charAt(0).toUpperCase() || 'M'}
              </div>
              <div className="add-status-icon">+</div>
            </div>
            <div className="status-info">
              <div className="status-name">My Status</div>
              <div className="status-subtitle">
                {myStatuses.length > 0 ? 'Tap to view' : 'Tap to add status update'}
              </div>
            </div>
          </div>

          {/* My Status List */}
          {myStatuses.map(status => (
            <div key={status._id} className="status-item my-status">
              <div className="status-avatar">
                <div className="avatar-circle">
                  {user?.name?.charAt(0).toUpperCase() || 'M'}
                </div>
              </div>
              <div className="status-info">
                <div className="status-content-text">{status.content}</div>
                <div className="status-time">
                  {formatStatusTime(status.createdAt)}
                </div>
              </div>
              <div className="status-actions">
                <button
                  className="delete-status-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteStatus(status._id);
                  }}
                  title="Delete Status"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Updates Section */}
        <div className="recent-updates-section">
          <div className="section-title">Recent updates</div>
          <div className="status-list">
            {statusUpdates.length === 0 ? (
              <div className="empty-status">
                <div className="empty-icon">📊</div>
                <h3>No recent updates</h3>
                <p>When your contacts share status updates, they'll appear here</p>
              </div>
            ) : (
              statusUpdates.map(status => (
                <div
                  key={status._id}
                  className="status-item"
                  onClick={() => handleViewStatus(status)}
                >
                  <div className={`status-avatar ${status.viewed ? 'viewed' : 'unviewed'}`}>
                    <div className="avatar-circle">
                      {status.userId?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                  </div>
                  <div className="status-info">
                    <div className="status-name">{status.userId?.name || 'Unknown'}</div>
                    <div className="status-time">
                      {formatStatusTime(status.createdAt)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Status Modal */}
      {showAddModal && (
        <div className="status-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="status-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Status Update</h3>
              <button
                className="close-button"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-content">
              <textarea
                className="status-input"
                placeholder="What's on your mind?"
                value={newStatusText}
                onChange={(e) => setNewStatusText(e.target.value)}
                maxLength={500}
              />

              <div className="image-upload-section">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <button
                  className="image-upload-button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  📷 Add Photo
                </button>
                {selectedImage && (
                  <div className="selected-image">
                    <span>{selectedImage.name}</span>
                    <button onClick={() => setSelectedImage(null)}>✕</button>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-button"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button
                className="create-button"
                onClick={handleCreateStatus}
                disabled={!newStatusText.trim() && !selectedImage}
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status View Modal */}
      {showViewModal && selectedStatus && (
        <div className="status-modal-overlay" onClick={closeViewModal}>
          <div className="status-view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="status-view-header">
              <div className="status-user-info">
                <div className="status-user-avatar">
                  {selectedStatus.userId?.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="status-user-details">
                  <div className="status-user-name">
                    {selectedStatus.userId?.name || 'Unknown'}
                  </div>
                  <div className="status-timestamp">
                    {formatStatusTime(selectedStatus.createdAt)}
                  </div>
                </div>
              </div>
              <button className="close-view-button" onClick={closeViewModal}>
                ✕
              </button>
            </div>

            <div className="status-view-content">
              {selectedStatus.imageUrl && (
                <div className="status-image">
                  <img
                    src={`http://localhost:5000${selectedStatus.imageUrl}`}
                    alt="Status"
                  />
                </div>
              )}
              {selectedStatus.content && (
                <div className="status-text">
                  {selectedStatus.content}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Status;