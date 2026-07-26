import { FileText, Loader2, Upload } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function SubmitApplicationDialog() {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setOpen(false);
        }, 1200);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="h-9 bg-[#1c2434] hover:bg-[#2c3a4f] text-white">
                    <FileText className="mr-2 h-4 w-4" />
                    Submit Application
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Submit LTIA Application Package</DialogTitle>
                    <DialogDescription>
                        Complete the form below to submit your official entry for the Lupong Tagapamayapa Incentives Awards.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="application_type">Application Entry Type</Label>
                            <Select required defaultValue="standard_ltia">
                                <SelectTrigger id="application_type">
                                    <SelectValue placeholder="Select entry type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="standard_ltia">Standard LTIA Barangay Submission</SelectItem>
                                    <SelectItem value="special_assessment">Special Assessment Submission</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="accomplishments">Key Case Management Summary & Highlights</Label>
                            <Textarea
                                id="accomplishments"
                                placeholder="Summarize key compliance milestones, settlement efficiency, and record management..."
                                className="min-h-[100px]"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="documents">Supporting Verification Documents</Label>
                            <div className="flex items-center justify-center w-full">
                                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-900 hover:bg-slate-100 dark:border-slate-800">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-muted-foreground">PDF, DOCX, or ZIP package (MAX. 25MB)</p>
                                    </div>
                                    <input id="dropzone-file" type="file" className="hidden" multiple />
                                </label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-[#1c2434] hover:bg-[#2c3a4f] text-white">
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting Application...
                                </>
                            ) : (
                                "Submit Application"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
