import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import './ChatLayout.css';

const ChatLayout = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
  };

  const handleBack = () => {
    setSelectedChat(null);
  };

  if (isMobileView) {
    return (
      <div className="chat-layout-mobile">
        {selectedChat ? (
          <ChatWindow
            key={selectedChat._id}
            selectedChat={selectedChat}
            onBack={handleBack}
          />
        ) : (
          <Sidebar onChatSelect={handleSelectChat} selectedChat={selectedChat} />
        )}
      </div>
    );
  }

  return (
    <div className="chat-layout-desktop">
      <div className="chat-sidebar-container">
        <Sidebar onChatSelect={handleSelectChat} selectedChat={selectedChat} />
      </div>
      <div className="chat-main-container">
        {selectedChat ? (
          <ChatWindow
            key={selectedChat._id}
            selectedChat={selectedChat}
            onBack={handleBack}
          />
        ) : (
          <div className="welcome-screen">
            <div className="welcome-content">
              <div className="welcome-icon">💬</div>
              <h1>WhatsApp Web</h1>
              <p>Send and receive messages without keeping your phone online.</p>
              <p>Use WhatsApp on up to 4 linked devices and 1 phone at the same time.</p>
              <p className="footer-note">🔒 Your personal messages are end-to-end encrypted</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatLayout;