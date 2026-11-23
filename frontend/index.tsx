import './vertex-ai-proxy-interceptor.js';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthGate } from './components/AuthGate';
import { ToastHost } from './components/ToastHost';
import { purgeSeedData } from './utils/purgeSeedData';

purgeSeedData();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthGate>
      {(authUser, onLogout, onRefreshUser) => (
        <App authUser={authUser} onLogout={onLogout} onRefreshAuthUser={onRefreshUser} />
      )}
    </AuthGate>
    <ToastHost />
  </React.StrictMode>
);
