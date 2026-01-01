import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import { AuthProvider } from './contexts/AuthContext';
import { EmpresaProvider } from './contexts/EmpresaContext';
import { ThemeProvider } from './contexts/ThemeContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <EmpresaProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </EmpresaProvider>
    </AuthProvider>
  </React.StrictMode>,
);
