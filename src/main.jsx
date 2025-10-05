import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/design-system.css';
import Router from './router/Router.jsx';
import { Provider } from 'react-redux';
import { store } from './store/index.js';
import AuthProvider from './components/layout/AuthProvider.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </Provider>
  </StrictMode>
);
