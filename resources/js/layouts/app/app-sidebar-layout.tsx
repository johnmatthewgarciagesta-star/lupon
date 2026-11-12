import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import type { AppLayoutProps, SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { ShieldAlert, CheckCircle2, X, AlertTriangle, RefreshCw } from 'lucide-react';

function FlashAlert() {
    const { flash } = usePage<SharedData>().props;
    const [visibleError, setVisibleError] = useState<string | null>(null);
    const [visibleSuccess, setVisibleSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (flash?.error) {
            setVisibleError(flash.error);
        } else {
            setVisibleError(null);
        }
        if (flash?.success) {
            setVisibleSuccess(flash.success);
        } else {
            setVisibleSuccess(null);
        }
    }, [flash]);

    if (!visibleError && !visibleSuccess) return null;

    const lowerError = (visibleError || '').toLowerCase();
    const isAccessDenied = lowerError.includes('access denied') || lowerError.includes('unauthorized') || lowerError.includes('permission');
    const isDuplicate = lowerError.includes('already exists') || lowerError.includes('duplicate');
    const errorTitle = isAccessDenied ? 'Access Denied' : (isDuplicate ? 'Folder / Case Notice' : 'System Notice');
    const hasReloadPrompt = lowerError.includes('reload');

    return (
        <div className="px-4 pt-3 pb-1 max-w-7xl mx-auto w-full">
            {visibleError && (
                <div className="flex items-center justify-between p-4 rounded-xl bg-red-600/90 text-white shadow-lg backdrop-blur-md border border-red-500/50 animate-in fade-in slide-in-from-top-3 duration-300">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/10 shrink-0">
                            {isAccessDenied ? (
                                <ShieldAlert className="w-6 h-6 text-white" />
                            ) : (
                                <AlertTriangle className="w-6 h-6 text-white" />
                            )}
                        </div>
                        <div>
                            <h4 className="font-bold text-sm tracking-wide uppercase text-red-100">{errorTitle}</h4>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                <p className="text-sm font-medium">{visibleError}</p>
                                {hasReloadPrompt && (
                                    <button
                                        type="button"
                                        onClick={() => window.location.reload()}
                                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-white/20 hover:bg-white/30 text-white font-semibold text-xs transition-colors"
                                    >
                                        <RefreshCw className="w-3 h-3" />
                                        Reload Now
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => setVisibleError(null)}
                        className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white/80 hover:text-white shrink-0 ml-2"
                        title="Dismiss"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}
            {visibleSuccess && (
                <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-600/90 text-white shadow-lg backdrop-blur-md border border-emerald-500/50 animate-in fade-in slide-in-from-top-3 duration-300">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/10 shrink-0">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-sm font-medium">{visibleSuccess}</p>
                    </div>
                    <button 
                        onClick={() => setVisibleSuccess(null)}
                        className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white/80 hover:text-white"
                        title="Dismiss"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
}

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <FlashAlert />
                {children}
            </AppContent>
        </AppShell>
    );
}
