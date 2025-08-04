import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';

const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/home" 
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;