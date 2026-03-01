import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { SharedData } from '@/types';

export function GlobalToast() {
    const { props } = usePage<SharedData>();
    const error = props.error as string | undefined;
    const flash = props.flash as Record<string, string> | undefined;

    useEffect(() => {
        if (error) {
            toast.error('Application Error', {
                description: error,
            });
        }

        if (flash?.success) {
            toast.success('Success', {
                description: flash.success,
            });
        }

        if (flash?.error) {
            toast.error('Error', {
                description: flash.error,
            });
        }
    }, [error, flash]);

    return null;
}
