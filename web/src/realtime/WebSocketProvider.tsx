import { useEffect, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/hooks/useSession';
import { markUserActivity } from '@/lib/activityBus';
import { queryKeys } from '@/lib/queryKeys';
import { getRealtimeBaseUrl } from '@/services/auth';

type RealtimeEventName =
    | 'inventory.updated'
    | 'product.updated'
    | 'product.created'
    | 'product.deleted'
    | 'settings.updated'
    | 'transaction.created'
    | 'user.updated';

interface RealtimeEvent {
    type: RealtimeEventName;
}

function parseRealtimeEvent(rawMessage: string): RealtimeEvent | null {
    try {
        const parsed = JSON.parse(rawMessage) as {
            event?: RealtimeEventName;
            type?: RealtimeEventName;
        };

        const eventType = parsed.type ?? parsed.event;
        if (!eventType) {
            return null;
        }

        return { type: eventType };
    } catch {
        return null;
    }
}

interface WebSocketProviderProps {
    children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
    const queryClient = useQueryClient();
    const { session } = useSession();

    useEffect(() => {
        if (!session) {
            return;
        }

        let reconnectTimerId: number | null = null;
        let reconnectAttempt = 0;
        let shouldReconnect = true;
        let socket: WebSocket | null = null;

        const invalidateByEvent = (eventType: RealtimeEventName) => {
            switch (eventType) {
                case 'inventory.updated':
                    void queryClient.invalidateQueries({
                        queryKey: queryKeys.inventory.all,
                    });
                    void queryClient.invalidateQueries({
                        queryKey: queryKeys.metrics.all,
                    });
                    return;
                case 'product.updated':
                case 'product.created':
                case 'product.deleted':
                    void Promise.all([
                        queryClient.invalidateQueries({
                            queryKey: queryKeys.products.all,
                        }),
                        queryClient.invalidateQueries({
                            queryKey: queryKeys.inventory.all,
                        }),
                        queryClient.invalidateQueries({
                            queryKey: queryKeys.metrics.all,
                        }),
                    ]);
                    return;
                case 'settings.updated':
                    void Promise.all([
                        queryClient.invalidateQueries({
                            queryKey: queryKeys.settings.all,
                        }),
                        queryClient.invalidateQueries({
                            queryKey: queryKeys.metrics.all,
                        }),
                    ]);
                    return;
                case 'transaction.created':
                    void Promise.all([
                        queryClient.invalidateQueries({
                            queryKey: queryKeys.transactions.all,
                        }),
                        queryClient.invalidateQueries({
                            queryKey: queryKeys.metrics.all,
                        }),
                    ]);
                    return;
                case 'user.updated':
                    void Promise.all([
                        queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
                        queryClient.invalidateQueries({
                            queryKey: queryKeys.session.all,
                        }),
                    ]);
                    return;
            }
        };

        const scheduleReconnect = () => {
            if (!shouldReconnect) {
                return;
            }

            const delay = Math.min(30_000, 1_000 * 2 ** reconnectAttempt);
            reconnectAttempt += 1;
            reconnectTimerId = window.setTimeout(connect, delay);
        };

        const connect = () => {
            try {
                socket = new WebSocket(getRealtimeBaseUrl());
            } catch {
                scheduleReconnect();
                return;
            }

            socket.addEventListener('open', () => {
                reconnectAttempt = 0;
            });

            socket.addEventListener('message', (messageEvent) => {
                markUserActivity('websocket');
                const realtimeEvent = parseRealtimeEvent(messageEvent.data);
                if (!realtimeEvent) {
                    return;
                }

                invalidateByEvent(realtimeEvent.type);
            });

            socket.addEventListener('error', () => {
                socket?.close();
            });

            socket.addEventListener('close', () => {
                scheduleReconnect();
            });
        };

        connect();

        return () => {
            shouldReconnect = false;
            if (reconnectTimerId !== null) {
                window.clearTimeout(reconnectTimerId);
            }
            socket?.close();
        };
    }, [queryClient, session]);

    return <>{children}</>;
}
