type ActivitySource = 'dom' | 'websocket';

type ActivityListener = (timestamp: number, source: ActivitySource) => void;

const activityListeners = new Set<ActivityListener>();

export function markUserActivity(source: ActivitySource) {
    const timestamp = Date.now();
    activityListeners.forEach((listener) => {
        listener(timestamp, source);
    });
}

export function subscribeToActivity(listener: ActivityListener) {
    activityListeners.add(listener);

    return () => {
        activityListeners.delete(listener);
    };
}
