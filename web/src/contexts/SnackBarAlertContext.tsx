import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { Snackbar, Alert as MuiAlert } from '@mui/material';

interface AlertContextType {
    showAlert: (message: string, severity: 'success' | 'error') => void;
}

// Create the context box
const AlertContext = createContext<AlertContextType | undefined>(undefined);

// Custom hook to use the Alert context
export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
};

interface AlertProviderProps {
    children: ReactNode;
}

const AlertProvider = ({ children }: AlertProviderProps) => {
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error',
    });

    const showAlert = (message: string, severity: 'success' | 'error') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        // put showAlert function in context box
        <AlertContext.Provider value={{ showAlert }}>
            {children}
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleClose}>
                <MuiAlert
                    elevation={6}
                    variant="filled"
                    severity={snackbar.severity}
                    onClose={handleClose}
                >
                    {snackbar.message}
                </MuiAlert>
            </Snackbar>
        </AlertContext.Provider>
    );
};

export default AlertProvider;
