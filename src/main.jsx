import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/design-system.css';
import Router from './router/Router';
import { Provider } from 'react-redux';
import { store } from './store';
import AuthProvider from './components/layout/AuthProvider.jsx';
import { Toaster } from 'sonner';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <Router />
        <Toaster
          position='top-right'
          richColors
          toastOptions={{
            className: 'rounded-2xl shadow-xl border border-slate-200/70 bg-white/95 backdrop-blur',
            style: { fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' },
            duration: 3200,
          }}
          closeButton={true}
        />
      </AuthProvider>
    </Provider>
  </StrictMode>
);
