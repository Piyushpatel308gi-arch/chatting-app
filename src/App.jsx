// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./hooks/useAuth";
import { CallProvider } from "./contexts/CallContext";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Chat from "./components/Chat/Chat";
import PrivateChat from "./components/Chat/PrivateChat";
import IncomingCall from "./components/Calls/IncomingCall";
import { Toaster } from "react-hot-toast";

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  return currentUser ? children : <Navigate to="/login" />;
};

function AppContent() {
  const { currentUser } = useAuth();

  return (
    <div className="App">
      <Toaster position="top-right" />
      {currentUser && <IncomingCall />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <PrivateChat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/group-chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/chat" />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CallProvider>
          <AppContent />
        </CallProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;