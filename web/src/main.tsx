import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import '@/index.css';
import App from '@/App.tsx';
import { AuthProvider } from '@contexts/AuthContext';
import AlertProvider from '@contexts/SnackBarAlertContext';
import { ThemeProvider } from '@contexts/ThemeContext';
import { queryClient } from '@/lib/queryClient';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AlertProvider>
                    <AuthProvider>
                        <ThemeProvider>
                            <App />
                        </ThemeProvider>
                    </AuthProvider>
                </AlertProvider>
            </BrowserRouter>
        </QueryClientProvider>
    </StrictMode>,
);
