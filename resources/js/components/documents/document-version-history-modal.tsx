import React, { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import {
    ShieldCheck, History, RotateCcw, Clock, User, HardDrive, AlertTriangle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface VersionItem {
    id: number;
    version_number: number;
    edited_by_name: string;
    change_type: string;
    ip_address?: string;
    created_at: string;
}

interface DocumentVersionHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    documentId: number | null;
    documentTitle?: string;
    canEdit?: boolean;
}

export function DocumentVersionHistoryModal({
    isOpen,
    onClose,
    documentId,
    documentTitle = 'Document',
    canEdit = true,
}: DocumentVersionHistoryModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [versions, setVersions] = useState<VersionItem[]>([]);
    const [currentVersion, setCurrentVersion] = useState<number>(1);
    const [restoringVersionId, setRestoringVersionId] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen && documentId) {
            setIsLoading(true);
            fetch(`/documents/${documentId}/versions`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setVersions(data.versions || []);
                        setCurrentVersion(data.current_version || 1);
                    }
                    setIsLoading(false);
                })
                .catch(() => setIsLoading(false));
        }
    }, [isOpen, documentId]);

    const handleRestore = (version: VersionItem) => {
        if (!documentId) return;
        if (!confirm(`Are you sure you want to restore "${documentTitle}" back to Version #${version.version_number}? This will revert any unauthorized or recent edits.`)) {
            return;
        }

        setRestoringVersionId(version.id);
        router.post(`/documents/${documentId}/restore-version/${version.id}`, {}, {
            onSuccess: () => {
                setRestoringVersionId(null);
                onClose();
            },
            onError: () => setRestoringVersionId(null),
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xl p-6">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                        <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        Security & Revision Backup History
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Anti-tamper immutable backup snapshots for <strong>{documentTitle}</strong>. You can inspect or restore any historical state.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-3 space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {isLoading ? (
                        <div className="py-12 text-center text-xs text-muted-foreground">
                            <Clock className="h-6 w-6 animate-spin mx-auto mb-2 text-[#dd8b11]" />
                            Loading revision backups...
                        </div>
                    ) : versions.length === 0 ? (
                        <div className="py-8 text-center text-xs text-muted-foreground bg-muted/20 rounded border border-dashed p-4">
                            <HardDrive className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                            <p className="font-semibold">No backup snapshots recorded yet.</p>
                            <p className="text-[11px] mt-0.5">Every view, edit, or system update automatically generates an encrypted backup copy here.</p>
                        </div>
                    ) : (
                        versions.map((ver, idx) => {
                            const isCurrent = idx === 0;
                            return (
                                <div
                                    key={ver.id}
                                    className={`p-3.5 rounded-lg border text-xs flex items-center justify-between gap-3 transition-colors ${
                                        isCurrent
                                            ? 'bg-emerald-500/5 border-emerald-500/30 dark:bg-emerald-950/20'
                                            : 'bg-card border-border hover:bg-muted/30'
                                    }`}
                                >
                                    <div className="space-y-1 min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-foreground">
                                                Version #{ver.version_number}
                                            </span>
                                            {isCurrent && (
                                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 font-bold text-[10px] px-2 py-0.2">
                                                    Active State
                                                </Badge>
                                            )}
                                            <Badge variant="secondary" className="text-[10px] capitalize font-medium">
                                                {ver.change_type}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
                                            <span className="flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                {ver.edited_by_name}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {ver.created_at}
                                            </span>
                                        </div>
                                    </div>

                                    {canEdit && !isCurrent && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={restoringVersionId === ver.id}
                                            className="h-8 text-xs font-semibold border-amber-400 text-[#dd8b11] hover:bg-amber-50 dark:hover:bg-amber-950/40 shrink-0"
                                            onClick={() => handleRestore(ver)}
                                        >
                                            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                                            {restoringVersionId === ver.id ? 'Restoring...' : 'Restore'}
                                        </Button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="pt-3 border-t flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold dark:text-emerald-400">
                        <ShieldCheck className="h-3.5 w-3.5" /> Data Security & Backup Protection Active
                    </span>
                    <Button variant="secondary" size="sm" onClick={onClose} className="h-8 text-xs">
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
