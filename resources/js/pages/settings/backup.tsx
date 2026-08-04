import { Head, router } from '@inertiajs/react';
import { Database, RotateCcw, ShieldCheck, HardDrive, Clock, CheckCircle2 } from 'lucide-react';
import { useState, useRef } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Backup & Restore',
        href: '/settings/backup',
    },
];

export default function BackupSettings() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isRestoring, setIsRestoring] = useState(false);
    const [restoreSuccessMsg, setRestoreSuccessMsg] = useState<string | null>(null);

    const handleDownloadBackup = () => {
        window.location.href = '/settings/backup/download';
    };

    const handleTriggerRestore = () => {
        fileInputRef.current?.click();
    };

    const handleRestoreFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!confirm(`Are you sure you want to restore database records from file "${file.name}"? Existing records will be updated.`)) {
            e.target.value = '';
            return;
        }

        setIsRestoring(true);
        setRestoreSuccessMsg(null);

        const formData = new FormData();
        formData.append('backup_file', file);

        router.post('/settings/backup/restore', formData, {
            onSuccess: () => {
                setIsRestoring(false);
                setRestoreSuccessMsg('Database records successfully restored from backup package!');
                if (fileInputRef.current) fileInputRef.current.value = '';
                setTimeout(() => setRestoreSuccessMsg(null), 5000);
            },
            onError: () => {
                setIsRestoring(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Backup & Restore Settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Backup & Restore Security"
                        description="Manage full system database backups and data anti-manipulation recovery"
                    />

                    {restoreSuccessMsg && (
                        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-xs flex items-center gap-2 font-medium">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                            <span>{restoreSuccessMsg}</span>
                        </div>
                    )}

                    <Card className="border shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Database className="h-4 w-4 text-[#dd8b11]" />
                                System Database Backup & Restoration
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Create instant snapshots of all cases, documents, audit trails, and system settings, or restore from a previously saved backup package.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-2">
                            <div className="rounded-lg bg-muted/40 p-3.5 space-y-2 border text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                        Data Anti-Tamper & Security Status:
                                    </span>
                                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                        ACTIVE (Immutable Snapshots)
                                    </span>
                                </div>
                                <div className="flex items-center justify-between pt-1 border-t text-[11px]">
                                    <span className="text-muted-foreground">Automatic Revision Log:</span>
                                    <span className="font-semibold text-foreground">Enabled (On Document Edit/Upload)</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                <Button
                                    type="button"
                                    onClick={handleDownloadBackup}
                                    className="bg-[#1c2434] hover:bg-[#2c3a4f] text-white flex items-center justify-center gap-2 h-10 text-xs font-semibold"
                                >
                                    <HardDrive className="h-4 w-4" />
                                    Create & Download Backup Now
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleTriggerRestore}
                                    disabled={isRestoring}
                                    className="flex items-center justify-center gap-2 h-10 text-xs font-semibold border-amber-500/40 text-[#dd8b11] hover:bg-amber-50 dark:hover:bg-amber-950/40"
                                >
                                    <RotateCcw className={`h-4 w-4 ${isRestoring ? 'animate-spin' : ''}`} />
                                    {isRestoring ? 'Restoring Database...' : 'Restore from Backup File'}
                                </Button>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept=".json,.txt"
                                    onChange={handleRestoreFileSelected}
                                    className="hidden"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
