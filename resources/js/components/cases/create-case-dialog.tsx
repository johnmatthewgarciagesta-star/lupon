
import { Plus } from 'lucide-react';
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

export function CreateCaseDialog() {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setOpen(false);
            // In a real app, we would emit an event or call a prop function here
        }, 1000);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="h-9 bg-[#1c2434] hover:bg-[#2c3a4f] text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    New Case
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>File New Case</DialogTitle>
                    <DialogDescription>
                        Enter the details of the new case. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="nature">Nature of Case</Label>
                                <Select required>
                                    <SelectTrigger id="nature">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="property">Property Dispute</SelectItem>
                                        <SelectItem value="noise">Noise Complaint</SelectItem>
                                        <SelectItem value="debt">Debt Collection</SelectItem>
                                        <SelectItem value="family">Family Dispute</SelectItem>
                                        <SelectItem value="boundary">Boundary Issue</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="date">Date Filed</Label>
                                <Input id="date" type="date" required />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="complainant">Complainant Name</Label>
                            <Input id="complainant" placeholder="Enter complainant's full name" required />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="respondent">Respondent Name</Label>
                            <Input id="respondent" placeholder="Enter respondent's full name" required />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="narrative">Complaint Narrative</Label>
                            <Textarea
                                id="narrative"
                                placeholder="Describe the incident or complaint details..."
                                className="min-h-[100px]"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-[#1c2434] hover:bg-[#2c3a4f] text-white">
                            {isLoading ? "Saving..." : "Save Case"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
