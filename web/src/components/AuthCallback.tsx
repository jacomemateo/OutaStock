import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@contexts/AuthContext';
import LoadingScreen from '@components/LoadingScreen';

const AuthCallback = () => {
    const { completeSignIn } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const hasStarted = useRef(false);
    const completeSignInRef = useRef(completeSignIn);

    completeSignInRef.current = completeSignIn;

    useEffect(() => {
        if (hasStarted.current) {
            return;
        }

        hasStarted.current = true;
        let isMounted = true;

        completeSignInRef.current(window.location.href)
            .then((returnTo) => {
                if (isMounted) {
                    window.location.replace(returnTo);
                }
            })
            .catch((caughtError) => {
                if (isMounted) {
                    setError(
                        caughtError instanceof Error
                            ? caughtError.message
                            : 'Sign-in failed unexpectedly.',
                    );
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    if (error) {
        return (
            <LoadingScreen
                message={error}
                mode="processing"
                title="Sign-in Failed"
            />
        );
    }

    return (
        <LoadingScreen
            message="Exchanging your authorization code with ZITADEL."
            mode="processing"
            title="Completing Sign-in"
        />
    );
};

export default AuthCallback;
