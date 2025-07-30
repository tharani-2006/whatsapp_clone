import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        email,
        password,
      });
      login(response.data.user, response.data.token);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#00a884]">
      {/* Header */}
      <header className="w-full bg-[#00a884] text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-2">
            <img 
              src="/whatsapp-logo.png" 
              alt="WhatsApp" 
              className="h-6"
            />
            <span className="text-xl font-light">WHATSAPP WEB</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 w-full bg-[#111b21] flex justify-center items-start pt-10">
        <div className="bg-[#202c33] p-8 rounded-lg shadow-lg w-[400px] mt-8">
          <h2 className="text-2xl text-white mb-6 text-center">Login to WhatsApp</h2>
          {error && (
            <div className="bg-red-500 text-white p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded bg-[#2a3942] text-white border-none focus:ring-2 focus:ring-[#00a884] focus:outline-none"
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded bg-[#2a3942] text-white border-none focus:ring-2 focus:ring-[#00a884] focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#00a884] text-white p-3 rounded hover:bg-[#008f6f] transition-colors"
            >
              Login
            </button>
          </form>
          <p className="mt-6 text-center text-[#aebac1]">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#00a884] hover:text-[#008f6f]">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;