import { useState } from 'react';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import './ChatLayout.css';

const ChatLayout = () => {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div className="chat-layout">
      <Sidebar onChatSelect={setSelectedChat} selectedChat={selectedChat} />
      <ChatWindow selectedChat={selectedChat} />
    </div>
  );
};

export default ChatLayout;