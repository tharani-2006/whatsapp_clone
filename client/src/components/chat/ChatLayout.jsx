import { useState } from 'react';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import './ChatLayout.css';

const ChatLayout = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const showSidebar = !selectedChat;

  return (
    <div className="chat-layout">
      <div className={showSidebar ? '' : 'sidebar--hidden'}>
        <Sidebar onChatSelect={setSelectedChat} selectedChat={selectedChat} />
      </div>
      <div className={!showSidebar ? '' : 'chat-window--hidden'}>
        <ChatWindow selectedChat={selectedChat} onBack={() => setSelectedChat(null)} />
      </div>
    </div>
  );
};

export default ChatLayout;