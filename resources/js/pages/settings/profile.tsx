import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Database, RotateCcw, HardDrive, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useState, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { BreadcrumbItem, SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<SharedData>().props;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isRestoring, setIsRestoring] = useState(false);
    const [restoreMsg, setRestoreMsg] = useState<string | null>(null);

    const handleDownloadBackup = () => {
        window.location.href = '/settings/backup/download';
    };

    const handleTriggerRestore = () => {
        fileInputRef.current?.click();
    };

    const handleRestoreFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!confirm(`Are you sure you want to restore database records from file "${file.name}"? Existing data will be updated.`)) {
            e.target.value = '';
            return;
        }

        setIsRestoring(true);
        setRestoreMsg(null);

        const formData = new FormData();
        formData.append('backup_file', file);

        router.post('/settings/backup/restore', formData, {
            onSuccess: () => {
                setIsRestoring(false);
                setRestoreMsg('Database records restored from backup successfully!');
                if (fileInputRef.current) fileInputRef.current.value = '';
                setTimeout(() => setRestoreMsg(null), 5000);
            },
            onError: () => {
                setIsRestoring(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile Settings</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Profile information"
                        description="Update your name and email address"
                    />

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>

                                    <Input
                                        id="name"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.name}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder="Full name"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email address</Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.email}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder="Email address"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.email}
                                    />
                                </div>

                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <div>
                                            <p className="-mt-4 text-sm text-muted-foreground">
                                                Your email address is
                                                unverified.{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                >
                                                    Click here to resend the
                                                    verification email.
                                                </Link>
                                            </p>

                                            {status ===
                                                'verification-link-sent' && (
                                                    <div className="mt-2 text-sm font-medium text-green-600">
                                                        A new verification link has
                                                        been sent to your email
                                                        address.
                                                    </div>
                                                )}
                                        </div>
                                    )}

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                    >
                                        Save
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">
                                            Saved
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                <div className="pt-6 border-t space-y-4">
                    <Heading
                        variant="small"
                        title="Database Backup & Restore"
                        description="Download full database backup files or restore system data anti-tamper snapshots"
                    />

                    {restoreMsg && (
                        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-xs flex items-center gap-2 font-medium">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                            <span>{restoreMsg}</span>
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
                        <CardContent className="space-y-4 pt-1">
                            <div className="rounded-lg bg-muted/40 p-3 text-xs space-y-1.5 border">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                        Data Anti-Tamper Status:
                                    </span>
                                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                        ACTIVE
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                <Button
                                    type="button"
                                    onClick={handleDownloadBackup}
                                    className="bg-[#1c2434] hover:bg-[#2c3a4f] text-white flex items-center justify-center gap-2 h-9 text-xs font-semibold"
                                >
                                    <HardDrive className="h-4 w-4" />
                                    Create Backup Now
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleTriggerRestore}
                                    disabled={isRestoring}
                                    className="flex items-center justify-center gap-2 h-9 text-xs font-semibold border-amber-500/40 text-[#dd8b11] hover:bg-amber-50 dark:hover:bg-amber-950/40"
                                >
                                    <RotateCcw className={`h-4 w-4 ${isRestoring ? 'animate-spin' : ''}`} />
                                    {isRestoring ? 'Restoring Backup...' : 'Restore from Backup'}
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
