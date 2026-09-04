import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import type { AppLayoutProps, SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { ShieldAlert, CheckCircle2, X } from 'lucide-react';

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

    return (
        <div className="px-4 pt-3 pb-1 max-w-7xl mx-auto w-full">
            {visibleError && (
                <div className="flex items-center justify-between p-4 rounded-xl bg-red-600/90 text-white shadow-lg backdrop-blur-md border border-red-500/50 animate-in fade-in slide-in-from-top-3 duration-300">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/10 shrink-0">
                            <ShieldAlert className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm tracking-wide uppercase text-red-100">Access Denied</h4>
                            <p className="text-sm font-medium">{visibleError}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setVisibleError(null)}
                        className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white/80 hover:text-white"
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
