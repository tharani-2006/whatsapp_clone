import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/register', {
        email,
        password,
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
          <h2 className="text-2xl text-white mb-6 text-center">Create Account</h2>
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
            <div>
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 rounded bg-[#2a3942] text-white border-none focus:ring-2 focus:ring-[#00a884] focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#00a884] text-white p-3 rounded hover:bg-[#008f6f] transition-colors"
            >
              Register
            </button>
          </form>
          <p className="mt-6 text-center text-[#aebac1]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#00a884] hover:text-[#008f6f]">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;