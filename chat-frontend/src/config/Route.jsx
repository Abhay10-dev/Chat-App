import { Route, Routes, Navigate } from 'react-router';
import React from 'react';
import LandingPage from '../components/LandingPage';
import ChatPage from '../components/ChatPage';

/**
 * Route guard — redirects to "/" if no username is stored.
 */
function RequireAuth({ children }) {
  const savedUser = localStorage.getItem('chat_username');
  if (!savedUser) return <Navigate to="/" replace />;
  return children;
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/chat/:roomId"
        element={
          <RequireAuth>
            <ChatPage />
          </RequireAuth>
        }
      />
      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;