import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
    const location = useLocation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const {
        config,
        error,
        isAuthenticated,
        isConfigured,
        signInHeadless,
        signOut,
        status,
        user,
    } = useAuth();

    if (mode === 'processing' || status === 'loading') {
        return (
            <div className="loading-container">
                <div className="loading-content">
                    <img src={logo} alt="Company-logo" />
                    <div className="loading-state-card">
                        <h1>{title}</h1>
                        <p>{message ?? 'Connecting to your local ZITADEL instance.'}</p>
                    </div>
                </div>
            </div>
        );
    }

    const returnTo = new URLSearchParams(location.search).get('returnTo') ?? '/dashboard';
    const primaryActionLabel = isAuthenticated ? 'Open Dashboard' : 'Sign In';
    const statusText = isAuthenticated
        ? `Signed in as ${user?.name ?? user?.email ?? user?.preferred_username ?? 'OutaStock User'}`
        : isConfigured
          ? config?.issuer
              ? `Enter your ZITADEL credentials to sign in locally through ${config.issuer}.`
              : 'Enter your ZITADEL credentials to sign in locally.'
          : 'Headless auth is not configured for the frontend yet.';

    const handlePrimaryAction = () => {
        navigate(returnTo);
    };

    const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const normalizedUsername = username.trim();
        if (!normalizedUsername || !password) {
            return;
        }

        try {
            await signInHeadless(normalizedUsername, password);
            navigate(returnTo);
        } catch {
            // AuthContext exposes the user-facing error state for this screen.
        }
    };

    const resolvedMessage = message ?? error ?? statusText;

    return (
        <div className="loading-container">
            <div className="loading-content">
                <img src={logo} alt="Company-logo" />
                <div className="loading-state-card">
                    <h1>{title}</h1>
                    <p>{resolvedMessage}</p>
                </div>
                {isAuthenticated ? (
                    <div className="dashboard-btn">
                        <button className="view-inventory" onClick={handlePrimaryAction}>
                            {primaryActionLabel}
                        </button>
                        <button
                            className="secondary-action"
                            onClick={() => void signOut()}
                        >
                            Sign Out
                        </button>
                    </div>
                ) : (
                    <form
                        className="login-form"
                        onSubmit={(event) => void handleLoginSubmit(event)}
                    >
                        <label className="login-field">
                            <span>Username</span>
                            <input
                                autoComplete="username"
                                disabled={!isConfigured}
                                onChange={(event) => setUsername(event.target.value)}
                                placeholder="Enter your username"
                                required
                                type="text"
                                value={username}
                            />
                        </label>
                        <label className="login-field">
                            <span>Password</span>
                            <input
                                autoComplete="current-password"
                                disabled={!isConfigured}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="Enter your password"
                                required
                                type="password"
                                value={password}
                            />
                        </label>
                        <div className="dashboard-btn login-actions">
                            <button
                                className="view-inventory"
                                disabled={!isConfigured || !username.trim() || !password}
                                type="submit"
                            >
                                {primaryActionLabel}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default LoadingScreen;
