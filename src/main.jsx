import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/design-system.css';
import Router from './router/Router';
import { Provider } from 'react-redux';
import { store } from './store';
import AuthProvider from './components/layout/AuthProvider.jsx';
import { Toaster } from 'sonner';
import { TeamProvider } from './context/TeamContext.jsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')).render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TeamProvider>
            <Router />
          </TeamProvider>
          <Toaster
            position='top-right'
            richColors
            toastOptions={{
              className: 'rounded-2xl shadow-xl border border-slate-200/70 bg-white/95 backdrop-blur',
              style: { fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' },
              duration: 3200,
            }}
          />
        </AuthProvider>
      </QueryClientProvider>
    </Provider>
);
