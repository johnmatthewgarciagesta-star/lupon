import { router } from '@inertiajs/react';
import { Calendar, Loader2, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface EventData {
    id?: number;
    title: string;
    notes: string;
    event_date: string;
}

interface EventDialogProps {
    event: EventData | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EventDialog({ event, open, onOpenChange }: EventDialogProps) {
    const isEdit = Boolean(event?.id);
    const [title, setTitle] = useState('');
    const [notes, setNotes] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        if (event) {
            setTitle(event.title || '');
            setNotes(event.notes || '');
            setEventDate(event.event_date || '');
            setErrorMsg(null);
        } else {
            setTitle('');
            setNotes('');
            setEventDate(new Date().toISOString().split('T')[0]);
            setErrorMsg(null);
        }
    }, [event, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg(null);

        const url = isEdit ? `/ltia/events/${event?.id}` : '/ltia/events';

        router.post(
            url,
            {
                title,
                notes,
                event_date: eventDate,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsLoading(false);
                    onOpenChange(false);
                },
                onError: (errs) => {
                    setIsLoading(false);
                    setErrorMsg(Object.values(errs)[0] || 'Failed to save event.');
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-[#dd8b11]" />
                        {isEdit ? 'Edit Agenda Event' : 'Add New Calendar Agenda Event'}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Specify event title/objective, scheduled date, and administrative notes or action items.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    {errorMsg && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md dark:bg-red-950/40 dark:border-red-900 dark:text-red-300">
                            {errorMsg}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="event_title" className="text-xs font-semibold">
                            Event Title / Agenda Objective
                        </Label>
                        <Input
                            id="event_title"
                            placeholder="e.g. Pre-Evaluation Alignment Meeting"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="event_date_input" className="text-xs font-semibold">
                            Event Scheduled Date
                        </Label>
                        <Input
                            id="event_date_input"
                            type="date"
                            value={eventDate}
                            onChange={(e) => setEventDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="event_notes" className="text-xs font-semibold">
                            Agenda Notes & Action Items
                        </Label>
                        <Textarea
                            id="event_notes"
                            placeholder="Add guidelines, administrative remarks, or meeting action items..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                        />
                    </div>

                    <DialogFooter className="pt-3">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-[#1c2434] hover:bg-[#2c3a4f] text-white">
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-1.5 h-4 w-4" />
                                    {isEdit ? 'Update Event' : 'Create Event'}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
