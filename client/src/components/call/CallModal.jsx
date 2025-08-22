import { useEffect, useRef } from 'react';
import { useCall } from '../../context/CallContext';
import { useAuth } from '../../context/AuthContext';
import './CallModal.css';

const CallModal = () => {
  const {
    callState,
    callType,
    remoteUser,
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

  if (callState === 'idle') return null;

  const renderIncomingCall = () => (
    <div className="call-modal incoming">
      <div className="call-content">
        <div className="call-header">
          <h3>Incoming {callType === 'video' ? 'Video' : 'Voice'} Call</h3>
          <p>From: {remoteUser}</p>
        </div>
        <div className="call-actions">
          <button className="call-btn accept" onClick={acceptCall}>
            📞 Accept
          </button>
          <button className="call-btn reject" onClick={rejectCall}>
            ❌ Decline
          </button>
        </div>
      </div>
    </div>
  );

  const renderActiveCall = () => (
    <div className="call-modal active">
      <div className="call-content">
        <div className="call-header">
          <h3>{callType === 'video' ? 'Video' : 'Voice'} Call</h3>
          <p>With: {remoteUser}</p>
        </div>
        
        {callType === 'video' && (
          <div className="video-container">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="remote-video"
            />
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="local-video"
            />
          </div>
        )}

        <div className="call-controls">
          <button className="control-btn" onClick={toggleMute}>
            🔇 Mute
          </button>
          {callType === 'video' && (
            <button className="control-btn" onClick={toggleVideo}>
              📹 Video
            </button>
          )}
          <button className="control-btn end" onClick={endCall}>
            ❌ End Call
          </button>
        </div>
      </div>
    </div>
  );

  const renderCalling = () => (
    <div className="call-modal calling">
      <div className="call-content">
        <div className="call-header">
          <h3>Calling...</h3>
          <p>To: {remoteUser}</p>
        </div>
        <div className="call-actions">
          <button className="call-btn end" onClick={endCall}>
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
