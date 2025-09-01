import { Link, useLocation } from 'react-router-dom';
import './TopTabs.css';

const TopTabs = () => {
    const location = useLocation();

    return (
        <div className="top-tabs-container">
            <div className="whatsapp-header">
                <h1>WhatsApp</h1>
            </div>
            <div className="tab-bar">
                <Link
                    to="/home/chats"
                    className={`tab-button ${location.pathname === '/home/chats' ? 'active' : ''}`}
                >
                    <span className="tab-icon">💬</span>
                    <span className="tab-text">Chats</span>
                </Link>
                <Link
                    to="/home/calls"
                    className={`tab-button ${location.pathname === '/home/calls' ? 'active' : ''}`}
                >
                    <span className="tab-icon">📞</span>
                    <span className="tab-text">Calls</span>
                </Link>
                <Link
                    to="/home/status"
                    className={`tab-button ${location.pathname === '/home/status' ? 'active' : ''}`}
                >
                    <span className="tab-icon">📊</span>
                    <span className="tab-text">Status</span>
                </Link>
            </div>
        </div>
    );
}

export default TopTabs;