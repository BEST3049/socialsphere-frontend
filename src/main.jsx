import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-center"
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(14, 14, 16, 0.92)',
            color: '#f5f4f1',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 32px 70px -36px rgba(0,0,0,0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '10px',
            padding: '10px 14px',
            fontSize: '13px',
            fontWeight: 500,
          },
          success: {
            iconTheme: { primary: '#d6a266', secondary: '#0a0a0c' },
          },
          error: {
            iconTheme: { primary: '#e07a6b', secondary: '#0a0a0c' },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
