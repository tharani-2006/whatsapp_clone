import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import axios from '../../utils/axios';
import './ChatWindow.css';
import Avatar from '../common/Avatar';

const ChatWindow = ({ selectedChat }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const socket = useSocket();
  const messagesEndRef = useRef(null);

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat?._id) return;
      
      setLoading(true);
      try {
        const response = await axios.get(`/chat/${selectedChat._id}/messages`);
        setMessages(response.data);
        scrollToBottom();
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedChat?._id]);

  // Socket connection and message handling
  useEffect(() => {
    if (socket && selectedChat?._id) {
      // Join chat room
      socket.emit('join_chat', selectedChat._id);

      // Listen for new messages
      const handleNewMessage = (message) => {
        setMessages(prev => {
          // Avoid duplicate messages
          const messageExists = prev.some(m => m._id === message._id);
          if (messageExists) return prev;
          return [...prev, message];
        });
        scrollToBottom();
      };

      socket.on('receive_message', handleNewMessage);

      return () => {
        socket.off('receive_message', handleNewMessage);
      };
    }
  }, [socket, selectedChat]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const messageData = {
        chatId: selectedChat._id,
        content: newMessage
      };

      // Send to server
      const response = await axios.post('/message', messageData);

      // Emit through socket with full message data
      socket.emit('new_message', response.data);

      // Update local state
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      scrollToBottom();
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!selectedChat || !selectedChat.participants) {
    return (
      <div className="chat-window empty-chat">
        <span>Select a chat to start messaging</span>
      </div>
    );
  }

  const otherUser = selectedChat.participants.find(p => p._id !== user?.id);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-user">
          <Avatar user={otherUser} size={40} />
          <span>{otherUser?.name || otherUser?.email}</span>
        </div>
      </div>

      <div className="messages-container">
        {loading ? (
          <div className="loading">Loading messages...</div>
        ) : (
          <>
            {messages.map(message => (
              <div
                key={message._id}
                className={`message ${message.sender._id === user.id ? 'sent' : 'received'}`}
              >
                <div className="message-content">{message.content}</div>
                <div className="message-time">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatWindow;