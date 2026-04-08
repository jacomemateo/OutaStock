import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@contexts/AuthContext';
import LoadingScreen from '@components/LoadingScreen';

let activeCallbackUrl: string | null = null;
let activeCompletionPromise: Promise<string> | null = null;

function getCompletionPromise(
    completeSignIn: (callbackUrl?: string) => Promise<string>,
    callbackUrl: string,
) {
    if (!activeCompletionPromise || activeCallbackUrl !== callbackUrl) {
        activeCallbackUrl = callbackUrl;
        activeCompletionPromise = completeSignIn(callbackUrl);
    }

    return activeCompletionPromise;
}

const AuthCallback = () => {
    const { completeSignIn } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const completeSignInRef = useRef(completeSignIn);

    completeSignInRef.current = completeSignIn;

    useEffect(() => {
        let isActive = true;
        const callbackUrl = window.location.href;

        getCompletionPromise(completeSignInRef.current, callbackUrl)
            .then((returnTo) => {
                if (isActive) {
                    window.location.replace(returnTo);
                }
            })
            .catch((caughtError) => {
                if (isActive) {
                    setError(
                        caughtError instanceof Error
                            ? caughtError.message
                            : 'Sign-in failed unexpectedly.',
                    );
                }
            });

        return () => {
            isActive = false;
        };
    }, []);

    if (error) {
        return <LoadingScreen message={error} mode="processing" title="Sign-in Failed" />;
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
