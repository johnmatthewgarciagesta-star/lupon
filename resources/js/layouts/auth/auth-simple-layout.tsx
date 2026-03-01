import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';
import { Toaster } from '@/components/ui/sonner';
import { GlobalToast } from '@/components/global-toast';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-white p-6 md:p-10 relative overflow-hidden dark:bg-zinc-950">

            <div className="w-full max-w-sm relative z-10">
                <div className="flex flex-col gap-8 rounded-xl border-4 border-double border-black bg-white p-8 shadow-2xl dark:bg-zinc-900 dark:border-white">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-2 font-medium"
                        >
                            <div className="mb-1 flex h-16 w-16 items-center justify-center rounded-full border-2 border-black bg-white p-3 text-black dark:bg-zinc-900 dark:text-white dark:border-white">
                                <AppLogoIcon className="size-8 fill-current text-current" />
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-xl font-medium">{title}</h1>
                            <p className="text-center text-sm text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
            <Toaster />
            <GlobalToast />
        </div>
    );
}
