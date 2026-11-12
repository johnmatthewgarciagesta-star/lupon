import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Edit3 } from 'lucide-react';

interface CaseItem {
    id: number;
    case_number: string;
    title?: string;
    complainant?: string;
    respondent?: string;
    nature_of_case?: string;
    nature?: string;
    status: string;
    date_filed?: string;
}

interface Props {
    caseItem: CaseItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

const statusOptions = [
    { value: 'Dismissed', label: 'Dismissed', color: 'text-red-600' },
    { value: 'Certified to File Action', label: 'Certified to File Action', color: 'text-purple-600' },
    { value: 'Withdrawn', label: 'Withdrawn', color: 'text-orange-600' },
    { value: 'Settled', label: 'Settled', color: 'text-emerald-600' },
];

export function EditCaseStatusDialog({ caseItem, open, onOpenChange, onSuccess }: Props) {
    const [status, setStatus] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (caseItem) {
            const rawStatus = caseItem.status || '';
            const normalized = rawStatus === 'Certified' ? 'Certified to File Action' : rawStatus;
            const isAllowed = statusOptions.some((opt) => opt.value === normalized);
            setStatus(isAllowed ? normalized : '');
        }
    }, [caseItem]);

    if (!caseItem) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.put(`/cases/${caseItem.id}`, { status }, {
            preserveState: false,
            onSuccess: () => {
                setIsSubmitting(false);
                onOpenChange(false);
                if (onSuccess) onSuccess();
            },
            onError: (errors) => {
                console.error("Failed to update case status", errors);
                setIsSubmitting(false);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader className="border-b pb-3">
                    <div className="flex items-center gap-2">
                        <Edit3 className="h-5 w-5 text-[#dd8b11]" />
                        <DialogTitle className="text-lg font-bold">Update Case Status</DialogTitle>
                    </div>
                    <DialogDescription className="text-xs">
                        Update the current status for Case <strong>{caseItem.case_number}</strong>
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-3">
                    <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border text-xs space-y-1">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                            {caseItem.title || `${caseItem.complainant || 'Complainant'} vs. ${caseItem.respondent || 'Respondent'}`}
                        </div>
                        <div className="text-muted-foreground">
                            Nature: {caseItem.nature_of_case || caseItem.nature || 'Barangay Dispute'}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status-select" className="text-sm font-semibold">
                            Select New Case Status
                        </Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger id="status-select" className="w-full">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        <span className={`font-medium ${opt.color}`}>{opt.label}</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter className="pt-2 border-t mt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isSubmitting || !statusOptions.some((opt) => opt.value === status)}
                            className="bg-[#1c2434] hover:bg-[#2c3a4f] text-[#ffffff]"
                        >
                            {isSubmitting ? "Updating..." : "Save Status Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
