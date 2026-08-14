import React, { useState, useEffect, useCallback } from 'react';
import { router, usePage } from '@inertiajs/react';
import { SharedData } from '@/types';
import {
    Bell,
    Check,
    CheckCheck,
    ExternalLink,
    Shield,
    FileText,
    FolderPlus,
    UserCheck,
    RefreshCw,
    Trash2,
    Activity,
    Info,
    Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export interface NotificationItem {
    id: number;
    user_id: number;
    audit_log_id: number | null;
    title: string;
    details: string | null;
    module: string | null;
    action: string | null;
    link: string | null;
    read_at: string | null;
    created_at: string;
}

function formatRelativeTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (isNaN(seconds) || seconds < 5) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString();
}

function isAuthOrSecurityEvent(item: NotificationItem): boolean {
    const link = item.link || '';
    const action = (item.action || '').toUpperCase();
    const module = (item.module || '').toLowerCase();

    return link === '/audit' ||
           link === '/dashboard' ||
           action.includes('LOGIN') ||
           action.includes('LOGOUT') ||
           action.includes('AUTH') ||
           action.includes('USER') ||
           module.includes('auth') ||
           module.includes('login') ||
           module.includes('security') ||
           module.includes('user') ||
           module.includes('kernel') ||
           module.includes('system');
}

function getActionBadge(action: string | null, module: string | null) {
    const act = (action || '').toUpperCase();
    const mod = (module || '').toLowerCase();

    if (act.includes('CREATE') || act.includes('ADD') || act.includes('UPLOAD')) {
        return {
            bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
            icon: FolderPlus,
        };
    }
    if (act.includes('UPDATE') || act.includes('EDIT') || act.includes('SAVE')) {
        return {
            bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
            icon: RefreshCw,
        };
    }
    if (act.includes('DELETE') || act.includes('REMOVE') || act.includes('CANCEL')) {
        return {
            bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
            icon: Trash2,
        };
    }
    if (mod.includes('auth') || mod.includes('login') || mod.includes('security') || act.includes('LOGIN') || act.includes('LOGOUT')) {
        return {
            bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
            icon: Shield,
        };
    }
    if (mod.includes('user')) {
        return {
            bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
            icon: UserCheck,
        };
    }

    return {
        bg: 'bg-primary/10 text-primary border-primary/20',
        icon: Activity,
    };
}

export function NotificationBell() {
    const { auth } = usePage<SharedData>().props;
    const userRole = auth?.user?.role || (auth?.roles && auth.roles[0]) || '';
    const isAdmin = Boolean(userRole === 'Administrator' || userRole === 'Admin' || auth?.roles?.includes('Administrator') || auth?.roles?.includes('Admin'));

    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [selectedEventNotification, setSelectedEventNotification] = useState<NotificationItem | null>(null);

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await fetch('/notifications', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unread_count || 0);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        // Poll every 12 seconds
        const interval = setInterval(fetchNotifications, 12000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const getCsrfToken = () => {
        return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '';
    };

    const handleMarkAsRead = async (e: React.MouseEvent, id: number) => {
        if (e) e.stopPropagation();
        try {
            const response = await fetch(`/notifications/${id}/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            if (response.ok) {
                setNotifications(prev =>
                    prev.map(item => item.id === id ? { ...item, read_at: new Date().toISOString() } : item)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            setLoading(true);
            const response = await fetch('/notifications/read-all', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            if (response.ok) {
                const now = new Date().toISOString();
                setNotifications(prev => prev.map(item => ({ ...item, read_at: item.read_at || now })));
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationClick = (item: NotificationItem) => {
        if (!item.read_at) {
            fetch(`/notifications/${item.id}/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
            }).catch(console.error);

            setNotifications(prev =>
                prev.map(n => n.id === item.id ? { ...n, read_at: new Date().toISOString() } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        }

        setIsOpen(false);

        // If it is a Sign In / Logout / Auth event, pop up the details modal directly on Dashboard
        if (isAuthOrSecurityEvent(item)) {
            setSelectedEventNotification(item);
            return;
        }

        if (item.link) {
            router.visit(item.link);
        } else {
            setSelectedEventNotification(item);
        }
    };

    return (
        <>
            <DropdownMenu open={isOpen} onOpenChange={(open) => {
                setIsOpen(open);
                if (open) fetchNotifications();
            }}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative h-9 w-9 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        aria-label="Notifications"
                    >
                        <Bell className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-sm animate-in zoom-in duration-200">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="w-80 sm:w-96 p-0 shadow-xl rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 z-50"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 px-4 py-3 bg-neutral-50/50 dark:bg-neutral-900/50">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">Notifications</span>
                            {unreadCount > 0 && (
                                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/10 text-xs font-semibold px-2 py-0.5">
                                    {unreadCount} new
                                </Badge>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleMarkAllAsRead}
                                disabled={loading}
                                className="h-7 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 px-2 gap-1"
                            >
                                <CheckCheck className="h-3.5 w-3.5" />
                                Mark all read
                            </Button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-[380px] overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                                <div className="h-10 w-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 mb-2">
                                    <Bell className="h-5 w-5" />
                                </div>
                                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">No notifications yet</p>
                                <p className="text-xs text-neutral-400 mt-1 max-w-[200px]">
                                    Activities logged in the Audit Trail will appear here automatically.
                                </p>
                            </div>
                        ) : (
                            notifications.map((item) => {
                                const isUnread = !item.read_at;
                                const badgeInfo = getActionBadge(item.action, item.module);
                                const IconComponent = badgeInfo.icon;
                                const isAuthEvent = isAuthOrSecurityEvent(item);

                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => handleNotificationClick(item)}
                                        className={`group flex items-start gap-3 p-3.5 cursor-pointer transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/60 ${
                                            isUnread ? 'bg-primary/[0.03] dark:bg-primary/[0.05]' : ''
                                        }`}
                                    >
                                        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${badgeInfo.bg}`}>
                                            <IconComponent className="h-4 w-4" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-1 mb-0.5">
                                                <p className={`text-xs font-semibold truncate ${
                                                    isUnread ? 'text-neutral-900 dark:text-neutral-50 font-bold' : 'text-neutral-700 dark:text-neutral-300'
                                                }`}>
                                                    {item.title}
                                                </p>
                                                <span className="text-[10px] text-neutral-400 shrink-0">
                                                    {formatRelativeTime(item.created_at)}
                                                </span>
                                            </div>

                                            {item.details && (
                                                <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                                                    {item.details}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-2 mt-1.5">
                                                {item.module && (
                                                    <span className="inline-flex items-center text-[10px] font-medium text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                                                        {item.module}
                                                    </span>
                                                )}
                                                {isAuthEvent && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                                                        Dashboard Pop-up
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {isUnread && (
                                            <button
                                                onClick={(e) => handleMarkAsRead(e, item.id)}
                                                title="Mark as read"
                                                className="mt-1 shrink-0 p-1 text-neutral-400 hover:text-primary rounded hover:bg-neutral-200/50 dark:hover:bg-neutral-700 transition-colors"
                                            >
                                                <span className="h-2 w-2 rounded-full bg-primary block" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-neutral-100 dark:border-neutral-800 p-2 bg-neutral-50/50 dark:bg-neutral-900/50 text-center">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setIsOpen(false);
                                if (isAdmin) {
                                    router.visit('/audit');
                                } else {
                                    router.visit('/dashboard');
                                }
                            }}
                            className="w-full text-xs text-neutral-600 dark:text-neutral-400 hover:text-primary justify-center gap-1.5 font-medium"
                        >
                            <span>{isAdmin ? 'View Full Audit Trail' : 'Go to Dashboard'}</span>
                            <ExternalLink className="h-3 w-3" />
                        </Button>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Dashboard Pop-Up Event Modal */}
            <Dialog open={!!selectedEventNotification} onOpenChange={(open) => !open && setSelectedEventNotification(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 rounded-full bg-amber-500/10 text-[#dd8b11] border border-amber-500/20">
                                <Shield className="h-5 w-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-bold">
                                    {selectedEventNotification?.title}
                                </DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground">
                                    {selectedEventNotification?.module || 'Security & Activity Notification'}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-3 py-2">
                        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border text-xs space-y-2">
                            <div className="flex justify-between items-center text-muted-foreground">
                                <span>Event Time:</span>
                                <span className="font-semibold text-foreground">
                                    {selectedEventNotification?.created_at ? new Date(selectedEventNotification.created_at).toLocaleString() : ''}
                                </span>
                            </div>
                            {selectedEventNotification?.action && (
                                <div className="flex justify-between items-center text-muted-foreground">
                                    <span>Action Type:</span>
                                    <span className="font-bold text-[#dd8b11]">
                                        {selectedEventNotification.action}
                                    </span>
                                </div>
                            )}
                            {selectedEventNotification?.details && (
                                <div className="pt-2 border-t border-border/60">
                                    <span className="font-medium text-muted-foreground block mb-1">Details:</span>
                                    <p className="text-foreground leading-relaxed font-mono text-[11px] bg-white dark:bg-black/40 p-2.5 rounded border">
                                        {selectedEventNotification.details}
                                    </p>
                                </div>
                            )}
                        </div>

                        <p className="text-[11px] text-muted-foreground italic flex items-center gap-1">
                            <Info className="h-3 w-3 text-amber-500 shrink-0" />
                            This activity summary is displayed directly as a pop-up on your Dashboard view.
                        </p>
                    </div>

                    <DialogFooter className="flex gap-2 sm:justify-between">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setSelectedEventNotification(null);
                                router.visit('/dashboard');
                            }}
                            className="text-xs gap-1.5 font-semibold"
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Go to Dashboard
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => setSelectedEventNotification(null)}
                            className="text-xs bg-[#dd8b11] hover:bg-[#cb7d0f] text-white font-semibold"
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
