import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';
import { initializeTheme } from './hooks/use-appearance';

// --- FRONTEND SABOTAGE TRACKER (Audit Trail Logger) ---
// Catches crashes when React code is maliciously deleted, pushes them directly to Database Audit Log!
window.addEventListener('error', (event) => {
    const errorFile = event.filename ? `File: ${event.filename}:${event.lineno}` : `Page: ${window.location.href}`;
    const stackTrace = event.error?.stack ? ` | Trace: ${event.error.stack.split('\n')[1]?.trim()}` : '';
    
    fetch('/api/system-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: event.message + stackTrace, url: errorFile })
    }).catch(() => {});
});
window.addEventListener('unhandledrejection', (event) => {
    fetch('/api/system-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: event.reason?.message || 'Unhandled Promise Crash', url: window.location.href })
    }).catch(() => {});
});
// ------------------------------------------------------

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <App {...props} />
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
