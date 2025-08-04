import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from '../../utils/axios';
import './ChatWindow.css';

const ChatWindow = ({ selectedChat }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const response = await axios.post('/message', {
        chatId: selectedChat._id,
        content: newMessage
      });

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
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatWindow;