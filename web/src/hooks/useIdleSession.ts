import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAlert } from '@contexts/SnackBarAlertContext';
import { subscribeToActivity, markUserActivity } from '@/lib/activityBus';
import { queryKeys } from '@/lib/queryKeys';
import type { AuthSession } from '@/services/auth';

const IDLE_TIMEOUT_MS = 5 * 60 * 1000;
const WARNING_TIMEOUT_MS = 4 * 60 * 1000;
const SESSION_REFRESH_INTERVAL_MS = 60 * 1000;
const ACTIVE_REFRESH_WINDOW_MS = 2 * 60 * 1000;
const IDLE_CHECK_INTERVAL_MS = 15 * 1000;
const ACTIVITY_EVENTS = [
    'mousemove',
    'mousedown',
    'keydown',
    'scroll',
    'touchstart',
] as const;

interface UseIdleSessionOptions {
    session: AuthSession | null;
    signOut: (message?: string) => void;
}

export function useIdleSession({ session, signOut }: UseIdleSessionOptions) {
    const queryClient = useQueryClient();
    const { showAlert } = useAlert();
    const lastActivityTimestampRef = useRef(0);
    const warningShownRef = useRef(false);
    const sessionUserId = session?.user.userId ?? null;

    useEffect(() => {
        if (!sessionUserId) {
            return;
        }

        lastActivityTimestampRef.current = Date.now();
        warningShownRef.current = false;

        const handleActivity = (timestamp: number) => {
            lastActivityTimestampRef.current = timestamp;
            warningShownRef.current = false;
        };

        const unsubscribe = subscribeToActivity((timestamp) => {
            handleActivity(timestamp);
        });

        const activityHandler = () => {
            markUserActivity('dom');
        };

        ACTIVITY_EVENTS.forEach((eventName) => {
            window.addEventListener(eventName, activityHandler, { passive: true });
        });

        const idleCheckId = window.setInterval(() => {
            const inactiveMs = Date.now() - lastActivityTimestampRef.current;

            if (inactiveMs >= IDLE_TIMEOUT_MS) {
                signOut('You were signed out after 5 minutes of inactivity.');
                return;
            }

            if (inactiveMs >= WARNING_TIMEOUT_MS && !warningShownRef.current) {
                warningShownRef.current = true;
                showAlert(
                    'You will be logged out soon due to inactivity.',
                    'warning',
                );
            }
        }, IDLE_CHECK_INTERVAL_MS);

        const refreshIntervalId = window.setInterval(() => {
            const inactiveMs = Date.now() - lastActivityTimestampRef.current;
            if (inactiveMs < ACTIVE_REFRESH_WINDOW_MS) {
                void queryClient.invalidateQueries({ queryKey: queryKeys.session.all });
            }
        }, SESSION_REFRESH_INTERVAL_MS);

        markUserActivity('dom');

        return () => {
            unsubscribe();
            window.clearInterval(idleCheckId);
            window.clearInterval(refreshIntervalId);
            ACTIVITY_EVENTS.forEach((eventName) => {
                window.removeEventListener(eventName, activityHandler);
            });
        };
    }, [queryClient, sessionUserId, showAlert, signOut]);
}
