import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter } from 'react-router';
import { Toaster } from 'sonner';
import { ChatProvider } from './context/ChatContext';
import AppRoutes from './config/Route.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ChatProvider>
        <Toaster richColors position="top-right" closeButton />
        <AppRoutes />
      </ChatProvider>
    </BrowserRouter>
  </StrictMode>
);
