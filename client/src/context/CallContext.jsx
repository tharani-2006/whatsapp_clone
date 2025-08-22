import { createContext, useContext, useState, useRef, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

const CallContext = createContext(null);

export const CallProvider = ({ children }) => {
  const [callState, setCallState] = useState('idle'); // idle, calling, incoming, connected
  const [callType, setCallType] = useState('voice'); // voice, video
  const [remoteUser, setRemoteUser] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callId, setCallId] = useState(null);
  
  const peerConnection = useRef(null);
  const socket = useSocket();
  const { user } = useAuth();

  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = (data) => {
      setCallState('incoming');
      setCallType(data.callType);
      setRemoteUser(data.from);
      setCallId(data.callId);
    };

    const handleCallAccepted = (data) => {
      setCallState('connected');
      initializePeerConnection();
    };

    const handleCallRejected = (data) => {
      setCallState('idle');
      setRemoteUser(null);
      setCallId(null);
    };

    const handleCallEnded = (data) => {
      endCall();
    };

    const handleOffer = async (data) => {
      if (!peerConnection.current) {
        await initializePeerConnection();
      }
      
      try {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        
        socket.emit('answer', {
          to: data.from,
          answer: answer
        });
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    };

    const handleAnswer = async (data) => {
      try {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    };

    const handleIceCandidate = async (data) => {
      try {
        if (peerConnection.current) {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    };

    socket.on('incoming_call', handleIncomingCall);
    socket.on('call_accepted', handleCallAccepted);
    socket.on('call_rejected', handleCallRejected);
    socket.on('call_ended', handleCallEnded);
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice_candidate', handleIceCandidate);

    return () => {
      socket.off('incoming_call', handleIncomingCall);
      socket.off('call_accepted', handleCallAccepted);
      socket.off('call_rejected', handleCallRejected);
      socket.off('call_ended', handleCallEnded);
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('ice_candidate', handleIceCandidate);
    };
  }, [socket]);

  const initializePeerConnection = async () => {
    try {
      peerConnection.current = new RTCPeerConnection(configuration);

      // Add local stream
      if (localStream) {
        localStream.getTracks().forEach(track => {
          peerConnection.current.addTrack(track, localStream);
        });
      }

      // Handle remote stream
      peerConnection.current.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };

      // Handle ICE candidates
      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit('ice_candidate', {
            to: remoteUser,
            candidate: event.candidate
          });
        }
      };

      // Handle connection state changes
      peerConnection.current.onconnectionstatechange = () => {
        if (peerConnection.current.connectionState === 'disconnected' || 
            peerConnection.current.connectionState === 'failed') {
          endCall();
        }
      };

    } catch (error) {
      console.error('Error initializing peer connection:', error);
    }
  };

  const startCall = async (targetUserId, type = 'voice') => {
    try {
      setCallType(type);
      setCallState('calling');
      setRemoteUser(targetUserId);

      // Get user media
      const constraints = {
        audio: true,
        video: type === 'video'
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);

      // Initialize peer connection
      await initializePeerConnection();

      // Create and send offer
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      socket.emit('call_user', {
        from: user.id,
        to: targetUserId,
        callType: type
      });

      socket.emit('offer', {
        to: targetUserId,
        offer: offer
      });

    } catch (error) {
      console.error('Error starting call:', error);
      setCallState('idle');
    }
  };

  const acceptCall = async () => {
    try {
      setCallState('connected');

      // Get user media
      const constraints = {
        audio: true,
        video: callType === 'video'
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);

      // Initialize peer connection
      await initializePeerConnection();

      socket.emit('call_accepted', {
        callId,
        to: remoteUser
      });

    } catch (error) {
      console.error('Error accepting call:', error);
      rejectCall();
    }
  };

  const rejectCall = () => {
    socket.emit('call_rejected', {
      callId,
      to: remoteUser
    });
    setCallState('idle');
    setRemoteUser(null);
    setCallId(null);
  };

  const endCall = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    setRemoteStream(null);
    setCallState('idle');
    setRemoteUser(null);
    setCallId(null);

    if (socket && remoteUser) {
      socket.emit('call_ended', {
        callId,
        to: remoteUser
      });
    }
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  };

  const value = {
    callState,
    callType,
    remoteUser,
    localStream,
    remoteStream,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo
  };

  return (
    <CallContext.Provider value={value}>
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};
