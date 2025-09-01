import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { CallProvider } from './context/CallContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import Register from './components/Register';
import CallModal from './components/call/CallModal';
import TopTabs from './components/TopTabs';
import ChatLayout from './components/chat/ChatLayout';
import Calls from './components/Calls';
import Status from './components/Status';
import './App.css';

const MainLayout = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="app-container">
      {!isAuthPage && <TopTabs />}
      <div className="content-container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/home/chats"
            element={
              <PrivateRoute>
                <ChatLayout />
              </PrivateRoute>
            } />
           <Route path="/home/calls" element={
              <PrivateRoute>
                <Calls />
              </PrivateRoute>
            } />
            <Route path="/home/status" element={
              <PrivateRoute>
                <Status />
              </PrivateRoute>
            } />
          <Route path="/home" element={<Navigate to="/home/chats" />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
      <CallModal />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <CallProvider>
          <Router>
            <MainLayout />
          </Router>
        </CallProvider>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;