
import { FileText, Loader2, CheckCircle } from 'lucide-react';
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
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface GenerateDocumentDialogProps {
    templateTitle: string;
    trigger?: React.ReactNode;
}

export function GenerateDocumentDialog({ templateTitle, trigger }: GenerateDocumentDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [selectedCase, setSelectedCase] = useState<string>("");

    const handleGenerate = () => {
        setIsLoading(true);
        // Simulate PDF generation
        setTimeout(() => {
            setIsLoading(false);
            setIsSuccess(true);
            setTimeout(() => {
                setOpen(false);
                setIsSuccess(false);
                setSelectedCase("");
            }, 1500);
        }, 2000);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button size="sm" className="h-7 text-xs bg-[#1c2434] text-white hover:bg-[#2c3a4f] mt-2">
                        Generate
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Generate {templateTitle}</DialogTitle>
                    <DialogDescription>
                        Select a case to generate this document for.
                    </DialogDescription>
                </DialogHeader>

                {!isSuccess ? (
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="case">Select Case</Label>
                            <Select onValueChange={setSelectedCase} value={selectedCase}>
                                <SelectTrigger id="case">
                                    <SelectValue placeholder="Select a case..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LT-2024-0248">LT-2024-0248 (Juan Dela Cruz vs Pedro Santos)</SelectItem>
                                    <SelectItem value="LT-2024-0247">LT-2024-0247 (Maria Santos vs Ana Garcia)</SelectItem>
                                    <SelectItem value="LT-2024-0246">LT-2024-0246 (Pedro Reyes vs Carlos Lopez)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 space-y-2 text-center">
                        <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-lg font-medium">Document Generated!</h3>
                        <p className="text-sm text-muted-foreground">
                            The {templateTitle} has been successfully created.
                        </p>
                    </div>
                )}

                <DialogFooter>
                    {!isSuccess && (
                        <>
                            <Button variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleGenerate}
                                disabled={!selectedCase || isLoading}
                                className="bg-[#1c2434] hover:bg-[#2c3a4f] text-white"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="mr-2 h-4 w-4" />
                                        Generate PDF
                                    </>
                                )}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
