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
      <div className="chat-layout">
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
    <div className="chat-layout">
      <Sidebar onChatSelect={handleSelectChat} selectedChat={selectedChat} />
      {selectedChat ? (
        <ChatWindow
          key={selectedChat._id}
          selectedChat={selectedChat}
          onBack={handleBack}
        />
      ) : (
        <div className="welcome-screen">
          <div className="welcome-content">
            <h1>WhatsApp Clone</h1>
            <p>Select a chat to start messaging.</p>
            <p className="footer-note">End-to-end encrypted (not really)</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatLayout;