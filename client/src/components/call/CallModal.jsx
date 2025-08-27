import { useEffect, useRef, useState } from 'react';
import { useCall } from '../../context/CallContext';
import { useAuth } from '../../context/AuthContext';
import './CallModal.css';

const CallModal = () => {
  const {
    callState,
    callType,
    remoteUser,
    remoteUserDetails,
    localStream,
    remoteStream,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo
  } = useCall();

  const { user } = useAuth();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [startTime, setStartTime] = useState(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (callState === 'connected') {
      setStartTime(new Date());
    } else {
      setStartTime(null);
    }
  }, [callState]);

  const formatTime = (date) => {
    if (!date) return '00:00';
    const diff = new Date().getTime() - date.getTime();
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMuteToggle = () => {
    toggleMute();
    setMuted(!muted);
  };

  if (callState === 'idle') return null;

  const renderIncomingCall = () => (
    <div className="call-modal incoming" style={{ width: '400px', padding: '20px' }}>
      <div className="call-content">
        <div className="call-header">
          <h3 style={{ fontSize: '24px' }}>Incoming {callType === 'video' ? 'Video' : 'Voice'} Call</h3>
          {remoteUserDetails ? (
            <>
              <p style={{ fontSize: '16px' }}><strong>Name:</strong> {remoteUserDetails.name || 'Unknown'}</p>
              <p style={{ fontSize: '16px' }}><strong>Phone:</strong> {remoteUserDetails.phone || 'Unknown'}</p>
              <p style={{ fontSize: '16px' }}><strong>Email:</strong> {remoteUserDetails.email || 'Unknown'}</p>
            </>
          ) : (
            <p style={{ fontSize: '16px' }}>From: {remoteUser}</p>
          )}
        </div>
        <div className="call-actions">
          <button className="call-btn accept" onClick={acceptCall} style={{ fontSize: '18px', padding: '10px 20px' }}>
            📞 Accept
          </button>
          <button className="call-btn reject" onClick={rejectCall} style={{ fontSize: '18px', padding: '10px 20px' }}>
            ❌ Decline
          </button>
        </div>
      </div>
    </div>
  );

  const renderActiveCall = () => (
    <div className="call-modal active" style={{ width: '600px', padding: '30px' }}>
      <div className="call-content">
        <div className="call-header">
          <h3 style={{ fontSize: '28px' }}>{callType === 'video' ? 'Video' : 'Voice'} Call</h3>
          {remoteUserDetails ? (
            <>
              <p style={{ fontSize: '18px' }}><strong>Name:</strong> {remoteUserDetails.name || 'Unknown'}</p>
              <p style={{ fontSize: '18px' }}><strong>Phone:</strong> {remoteUserDetails.phone || 'Unknown'}</p>
            </>
          ) : (
            <p style={{ fontSize: '18px' }}>With: {remoteUser}</p>
          )}
          {startTime && <p style={{ fontSize: '18px' }}><strong>Time:</strong> {formatTime(startTime)}</p>}
        </div>

        {callType === 'video' && (
          <div className="video-container" style={{ display: 'flex', justifyContent: 'center' }}>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="remote-video"
              style={{ width: '400px', height: '300px' }}
            />
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="local-video"
              style={{ width: '200px', height: '150px' }}
            />
          </div>
        )}

        <div className="call-controls" style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-around' }}>
          <button className="control-btn" onClick={handleMuteToggle} style={{ fontSize: '20px', padding: '10px 15px' }}>
            {muted ? '🔊 Unmute' : '🔇 Mute'}
          </button>
          {callType === 'video' && (
            <button className="control-btn" onClick={toggleVideo} style={{ fontSize: '20px', padding: '10px 15px' }}>
              📹 Video
            </button>
          )}
          <button className="control-btn end" onClick={endCall} style={{ fontSize: '20px', padding: '10px 15px' }}>
            ❌ End Call
          </button>
        </div>
      </div>
    </div>
  );

  const renderCalling = () => (
    <div className="call-modal calling" style={{ width: '400px', padding: '20px' }}>
      <div className="call-content">
        <div className="call-header">
          <h3 style={{ fontSize: '24px' }}>Calling...</h3>
          {remoteUserDetails ? (
            <>
              <p style={{ fontSize: '16px' }}><strong>Name:</strong> {remoteUserDetails.name || 'Unknown'}</p>
              <p style={{ fontSize: '16px' }}><strong>Phone:</strong> {remoteUserDetails.phone || 'Unknown'}</p>
            </>
          ) : (
            <p style={{ fontSize: '16px' }}>To: {remoteUser}</p>
          )}
        </div>
        <div className="call-actions">
          <button className="call-btn end" onClick={endCall} style={{ fontSize: '18px', padding: '10px 20px' }}>
            ❌ Cancel
          </button>
        </div>
      </div>
    </div>
  );

  switch (callState) {
    case 'incoming':
      return renderIncomingCall();
    case 'connected':
      return renderActiveCall();
    case 'calling':
      return renderCalling();
    default:
      return null;
  }
};

export default CallModal;

