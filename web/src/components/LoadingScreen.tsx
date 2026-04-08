import { useLocation, useNavigate } from 'react-router-dom';
import '@styles/LoadingScreen.css';
import logo from '@assets/transparent-default-logo.png';
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
    const { config, isAuthenticated, isConfigured, signIn, signOut, status, user } =
        useAuth();

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
    const primaryActionLabel = isAuthenticated
        ? 'Open Dashboard'
        : 'Sign in with ZITADEL';
    const statusText = isAuthenticated
        ? `Signed in as ${user?.name ?? user?.email ?? user?.preferred_username ?? 'OutaStock User'}`
        : isConfigured
          ? `Ready to sign in through ${config?.issuer}`
          : 'ZITADEL auth is not configured for the frontend yet.';

    const handlePrimaryAction = () => {
        if (isAuthenticated) {
            navigate(returnTo);
            return;
        }

        void signIn(returnTo);
    };

    return (
        <div className="loading-container">
            <div className="loading-content">
                <img src={logo} alt="Company-logo" />
                <div className="loading-state-card">
                    <h1>{title}</h1>
                    <p>{message ?? statusText}</p>
                </div>
                <div className="dashboard-btn">
                    <button
                        className="view-inventory"
                        disabled={!isAuthenticated && !isConfigured}
                        onClick={handlePrimaryAction}
                    >
                        {primaryActionLabel}
                    </button>
                    {isAuthenticated ? (
                        <button
                            className="secondary-action"
                            onClick={() => void signOut()}
                        >
                            Sign Out
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
