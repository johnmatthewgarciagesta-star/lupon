import { router, usePoll } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

/**
 * useLiveSync
 *
 * Keeps Inertia page data continuously synchronized in the background without full page reloads:
 * 1. Automatically polls every `intervalMs` (default 5000ms) for the specified `only` prop keys.
 *    (Inertia automatically pauses polling when the browser tab is hidden/minimized to save server resources).
 * 2. Immediately triggers a partial reload when the browser window/tab regains focus or visibility,
 *    so switching between tabs (e.g. from an incognito data-encoder tab back to the admin tab)
 *    shows fresh data instantaneously without waiting for the polling timer to tick.
 *
 * @param intervalMs Polling interval in milliseconds (default: 5000ms)
 * @param only Array of Inertia prop keys to refresh (e.g. ['cases', 'stats'])
 * @param enabled Whether live sync is active (default: true)
 */
export function useLiveSync(
    intervalMs: number = 5000,
    only?: string[],
    enabled: boolean = true
) {
    // 1. Regular background polling via Inertia v2
    usePoll(
        intervalMs,
        {
            only: only && only.length > 0 ? only : undefined,
        },
        {
            autoStart: enabled,
            keepAlive: false, // Pauses when tab is hidden to save server load
        }
    );

    const lastFocusRefreshRef = useRef<number>(0);
    const onlyKey = only ? only.join(',') : '';

    // 2. Instant partial reload when window regains focus or tab becomes visible
    useEffect(() => {
        if (!enabled) return;

        const handleFocusOrVisible = () => {
            if (document.hidden) return;

            // Throttle focus refreshes to at most once every 2.5 seconds
            const now = Date.now();
            if (now - lastFocusRefreshRef.current < 2500) return;
            lastFocusRefreshRef.current = now;

            router.reload({
                only: only && only.length > 0 ? only : undefined,
            });
        };

        window.addEventListener('focus', handleFocusOrVisible);
        document.addEventListener('visibilitychange', handleFocusOrVisible);

        return () => {
            window.removeEventListener('focus', handleFocusOrVisible);
            document.removeEventListener('visibilitychange', handleFocusOrVisible);
        };
    }, [enabled, onlyKey]);
}
