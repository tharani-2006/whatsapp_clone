import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import ChatLayout from './chat/ChatLayout';
import Calls from './Calls';
import Status from './Status';
import './Home.css';

const Home = () => {
  const location = useLocation();

  return (
    <div className="home-container">
      <div className="tab-bar">
        <Link to="/home/chats" className={`tab-button ${location.pathname === '/home/chats' ? 'active' : ''}`}>
          Chats
        </Link>
        <Link to="/home/calls" className={`tab-button ${location.pathname === '/home/calls' ? 'active' : ''}`}>
          Calls
        </Link>
        <Link to="/home/status" className={`tab-button ${location.pathname === '/home/status' ? 'active' : ''}`}>
          Status
        </Link>
      </div>

      <div className="content">
        <Routes>
          <Route path="/" element={<ChatLayout />} />
          <Route path="/chats" element={<ChatLayout />} />
          <Route path="/calls" element={<Calls />} />
          <Route path="/status" element={<Status />} />
        </Routes>
      </div>
    </div>
  );
};

export default Home;