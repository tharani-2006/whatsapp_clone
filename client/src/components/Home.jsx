import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ChatLayout from './chat/ChatLayout';

const Home = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-green-600 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-white text-xl font-bold">WhatsApp Clone</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      
      <div className="home">
        <ChatLayout />
      </div>
    </div>
  );
};

export default Home;