import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { user, logout } = useAuth();
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
            <span className="text-white">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Welcome to WhatsApp Clone</h2>
          <p className="text-gray-600">
            This is a simple home page. More features will be added soon!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;