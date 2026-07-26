import { router } from '@inertiajs/react';
import { Edit3, Loader2, Save } from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface PhaseData {
    id: number;
    step: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    progress: number;
    status: 'in_progress' | 'upcoming' | 'completed' | string;
}

interface EditPhaseDialogProps {
    phase: PhaseData | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditPhaseDialog({ phase, open, onOpenChange }: EditPhaseDialogProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [status, setStatus] = useState('upcoming');
    const [progress, setProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        if (phase) {
            setTitle(phase.title || '');
            setDescription(phase.description || '');
            setStartDate(phase.start_date || '');
            setEndDate(phase.end_date || '');
            setStatus(phase.status || 'upcoming');
            setProgress(phase.progress ?? 0);
            setErrorMsg(null);
        }
    }, [phase]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!phase) return;

        setIsLoading(true);
        setErrorMsg(null);

        router.post(
            `/ltia/phases/${phase.id}`,
            {
                title,
                description,
                start_date: startDate,
                end_date: endDate,
                status,
                progress: Number(progress),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsLoading(false);
                    onOpenChange(false);
                },
                onError: (errs) => {
                    setIsLoading(false);
                    setErrorMsg(Object.values(errs)[0] || 'Failed to update phase.');
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Edit3 className="h-5 w-5 text-[#dd8b11]" />
                        Edit Phase #{phase?.step}: {phase?.title}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Modify phase title, scope description, date range, status, and progress percentage.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    {errorMsg && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md dark:bg-red-950/40 dark:border-red-900 dark:text-red-300">
                            {errorMsg}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="phase_title" className="text-xs font-semibold">
                            Phase Title
                        </Label>
                        <Input
                            id="phase_title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phase_desc" className="text-xs font-semibold">
                            Scope / Description
                        </Label>
                        <Textarea
                            id="phase_desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phase_start_date" className="text-xs font-semibold">
                                Start Date
                            </Label>
                            <Input
                                id="phase_start_date"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phase_end_date" className="text-xs font-semibold">
                                End Date
                            </Label>
                            <Input
                                id="phase_end_date"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phase_status" className="text-xs font-semibold">
                                Status
                            </Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger id="phase_status">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="upcoming">Upcoming</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phase_progress" className="text-xs font-semibold">
                                Progress Percentage ({progress}%)
                            </Label>
                            <Input
                                id="phase_progress"
                                type="number"
                                min={0}
                                max={100}
                                value={progress}
                                onChange={(e) => setProgress(Number(e.target.value))}
                                required
                            />
                        </div>
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
                                    Save Phase Changes
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
