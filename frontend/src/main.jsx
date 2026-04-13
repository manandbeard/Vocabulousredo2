import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { ThemeProvider } from '@/hooks/useTheme';
import { SidebarProvider } from '@/hooks/useSidebar';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <SidebarProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </SidebarProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
