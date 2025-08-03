import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import axios from 'axios';
import './ChatWindow.css';

const ChatWindow = ({ selectedChat }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const { user } = useAuth();
  const socket = useSocket();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch messages when a chat is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) return;
      
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:5000/api/chat/${selectedChat._id}/messages`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        setMessages(response.data);
        scrollToBottom();
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedChat?._id]); // Add dependency on selectedChat._id

  useEffect(() => {
    if (socket) {
      // Listen for new messages
      socket.on('receive_message', (messageData) => {
        if (messageData.chatId === selectedChat?._id) {
          setMessages(prev => [...prev, messageData]);
          scrollToBottom();
        }
      });

      // Listen for typing status
      socket.on('user_typing', (data) => {
        if (data.chatId === selectedChat?._id && data.userId !== user.id) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 3000);
        }
      });

      return () => {
        socket.off('receive_message');
        socket.off('user_typing');
      };
    }
  }, [socket, selectedChat, user]);

  const handleTyping = () => {
    if (socket && selectedChat) {
      if (typingTimeout) clearTimeout(typingTimeout);

      socket.emit('typing', {
        chatId: selectedChat._id,
        userId: user.id,
        recipientId: selectedChat.participants.find(p => p._id !== user.id)?._id
      });

      const timeout = setTimeout(() => {
        setIsTyping(false);
      }, 3000);

      setTypingTimeout(timeout);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const response = await axios.post(
        'http://localhost:5000/api/message',
        {
          chatId: selectedChat._id,
          content: newMessage
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Emit message through socket
      if (socket) {
        socket.emit('send_message', {
          ...response.data,
          recipientId: selectedChat.participants.find(p => p._id !== user.id)?._id
        });
      }

      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      scrollToBottom();
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // If no chat is selected, show empty state
  if (!selectedChat) {
    return (
      <div className="chat-window empty-chat">
        <span>Select a chat to start messaging</span>
      </div>
    );
  }

  const otherParticipant = selectedChat.participants?.find(p => p._id !== user?.id);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <span>{otherParticipant?.email || 'Loading...'}</span>
        {isTyping && <div className="typing-indicator">typing...</div>}
      </div>

      <div className="messages-container">
        {loading ? (
          <div className="loading">Loading messages...</div>
        ) : (
          <>
            {messages.map(message => (
              <div
                key={message._id}
                className={`message ${message.sender._id === user?.id ? 'sent' : 'received'}`}
              >
                <div className="message-content">{message.content}</div>
                <div className="message-time">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          placeholder="Type a message"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatWindow;