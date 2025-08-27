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
  const [muted, setMuted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState('00:00');

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
    let intervalId;

    if (callState === 'connected') {
      const startTime = new Date().getTime();
      intervalId = setInterval(() => {
        const now = new Date().getTime();
        const diff = now - startTime;
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
        setElapsedTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
    } else {
      setElapsedTime('00:00');
    }

    return () => clearInterval(intervalId);
  }, [callState]);
  const handleMuteToggle = () => {
    toggleMute();
    setMuted(!muted);
  };

  if (callState === 'idle') return null;

  const renderIncomingCall = () => (
    <div className="call-modal incoming" style={{
      width: '400px',
      padding: '20px',
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    }}>
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
    <div className="call-modal active" style={{
      width: '600px',
      padding: '30px',
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    }}>
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
          <p style={{ fontSize: '18px' }}><strong>Time:</strong> {elapsedTime}</p>
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
    <div className="call-modal calling" style={{
      width: '400px',
      padding: '20px',
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    }}>
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

