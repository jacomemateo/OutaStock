import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import '@styles/LoadingScreen/LoadingScreen.css';
import logo from '@assets/logo-black.png';
import { useAuth } from '@contexts/AuthContext';

interface LoadingScreenProps {
    message?: string;
    mode?: 'landing' | 'processing';
    title?: string;
}

const LoadingScreen = ({
    message,
    mode = 'landing',
    title = 'OutaStock',
}: LoadingScreenProps) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const auth = useAuth();

    useEffect(() => {
        if (auth.isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [auth.isAuthenticated, navigate]);

    if (mode === 'processing' || auth.status === 'loading') {
        return (
            <div className="loading-container">
                <div className="loading-content">
                    <img src={logo} alt="Company-logo" />
                    <div className="loading-state-card">
                        <h1>{title}</h1>
                        <p>{message ?? 'Signing you in.'}</p>
                        <div className="loading-text">
                            Please wait
                            <span className="loading-spinner" aria-hidden="true">
                                ◌
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const normalizedEmail = email.trim();
        if (!normalizedEmail || !password) {
            return;
        }

        try {
            await auth.signIn(normalizedEmail, password);
            navigate('/dashboard', { replace: true });
        } catch {
            // AuthContext exposes the user-facing error state for this screen.
        }
    };

    return (
        <div className="loading-container">
            <div className="loading-content">
                <img src={logo} alt="Company-logo" />
                <div className="loading-state-card">
                    <h1>{title}</h1>
                    <p>Sign in with your OutaStock account to continue.</p>
                </div>
                <form
                    className="login-form"
                    onSubmit={(event) => void handleLoginSubmit(event)}
                >
                    <label className="login-field">
                        <span>Email</span>
                        <input
                            autoComplete="email"
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="you@example.com"
                            required
                            type="email"
                            value={email}
                        />
                    </label>
                    <label className="login-field">
                        <span>Password</span>
                        <input
                            autoComplete="current-password"
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Enter your password"
                            required
                            type="password"
                            value={password}
                        />
                    </label>
                    {auth.error ? (
                        <p className="loading-error" role="alert">
                            {auth.error}
                        </p>
                    ) : null}
                    <div className="dashboard-btn login-actions">
                        <button
                            className="view-inventory"
                            disabled={
                                auth.status === 'loading' || !email.trim() || !password
                            }
                            type="submit"
                        >
                            Sign In
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoadingScreen;
