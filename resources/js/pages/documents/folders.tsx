import { Head, Link, router, usePage } from '@inertiajs/react';
import { SharedData } from '@/types';
import {
    Folder, FolderPlus, FileText, Search, Plus, Eye, Upload, FilePlus, Loader2, X, Filter, Trash2, ChevronDown, ChevronUp, ShieldCheck
} from 'lucide-react';
import { DocumentVersionHistoryModal } from '@/components/documents/document-version-history-modal';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import AppLayout from '@/layouts/app-layout';

interface CaseFolder {
    id: number;
    case_number: string;
    folder_name: string;
    complainant: string;
    respondent: string;
    nature_of_case: string;
    status: string;
    date_filed: string;
    documents: Array<{
        id: number;
        type: string;
        file_path?: string;
        status?: string;
        created_at?: string;
        creator?: { name: string };
    }>;
}

interface FoldersProps {
    caseFolders: CaseFolder[];
}

export default function DocumentsFolders({ caseFolders = [] }: FoldersProps) {
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth?.user?.role === 'Administrator' || auth?.user?.role === 'Admin' || auth?.roles?.includes('Administrator') || auth?.roles?.includes('Admin');
    const canEdit = !isAdmin;

    // Search filter for folders
    const [search, setSearch] = useState('');

    // Toggle for Case Folders Grid (Selective / Minimized by default)
    const [showCaseFolders, setShowCaseFolders] = useState(false);

    // Modal states for Create Case Folder
    const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [newFolderCaseNo, setNewFolderCaseNo] = useState('');
    const [newFolderComplainant, setNewFolderComplainant] = useState('');
    const [newFolderRespondent, setNewFolderRespondent] = useState('');
    const [newFolderNature, setNewFolderNature] = useState('');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);

    // Modal states for Direct Upload to Folder
    const [uploadFolderTarget, setUploadFolderTarget] = useState<CaseFolder | null>(null);
    const [folderUploadFile, setFolderUploadFile] = useState<File | null>(null);
    const [folderDocType, setFolderDocType] = useState('Evidence File / Document');
    const [isUploadingToFolder, setIsUploadingToFolder] = useState(false);

    // Selected folder for inspection drawer
    const [inspectedFolder, setInspectedFolder] = useState<CaseFolder | null>(null);

    // Folder Deletion State
    const [folderToDelete, setFolderToDelete] = useState<CaseFolder | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Document Version Security History Modal
    const [historyDoc, setHistoryDoc] = useState<{ id: number; title: string } | null>(null);

    const handleDeleteFolder = () => {
        if (!folderToDelete) return;
        setIsDeleting(true);
        router.delete(`/documents/folders/${folderToDelete.id}`, {
            onSuccess: () => {
                setFolderToDelete(null);
                setIsDeleting(false);
            },
            onError: () => setIsDeleting(false)
        });
    };

    // Filter case folders by search (matches case-026, complainant, respondent, case_number)
    const filteredFolders = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return caseFolders;
        return caseFolders.filter((f) =>
            f.folder_name.toLowerCase().includes(q) ||
            f.case_number.toLowerCase().includes(q) ||
            f.complainant.toLowerCase().includes(q) ||
            f.respondent.toLowerCase().includes(q) ||
            f.nature_of_case.toLowerCase().includes(q)
        );
    }, [search, caseFolders]);

    const handleCreateFolderSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;
        setIsCreatingFolder(true);
        router.post('/documents/create-folder', {
            folder_name: newFolderName,
            case_number: newFolderCaseNo,
            complainant: newFolderComplainant,
            respondent: newFolderRespondent,
            nature_of_case: newFolderNature,
        }, {
            onSuccess: () => {
                setIsCreateFolderModalOpen(false);
                setNewFolderName('');
                setNewFolderCaseNo('');
                setNewFolderComplainant('');
                setNewFolderRespondent('');
                setNewFolderNature('');
                setIsCreatingFolder(false);
            },
            onError: () => setIsCreatingFolder(false)
        });
    };

    const handleFolderUploadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadFolderTarget || !folderUploadFile) return;

        const allowedExtensions = ['pdf', 'png', 'jpg', 'jpeg'];
        const ext = folderUploadFile.name.split('.').pop()?.toLowerCase() || '';

        if (!allowedExtensions.includes(ext)) {
            alert('Invalid file type. Only PDF, PNG, and JPG files are accepted.');
            return;
        }

        setIsUploadingToFolder(true);
        const formData = new FormData();
        formData.append('case_id', String(uploadFolderTarget.id));
        formData.append('file', folderUploadFile);
        formData.append('document_type', folderDocType);

        router.post('/documents/upload-to-folder', formData, {
            onSuccess: () => {
                setUploadFolderTarget(null);
                setFolderUploadFile(null);
                setIsUploadingToFolder(false);
            },
            onError: (errors: any) => {
                setIsUploadingToFolder(false);
                if (errors?.file) {
                    alert('Invalid file type. Only PDF, PNG, and JPG files are accepted.');
                } else if (errors) {
                    alert(Object.values(errors).join('\n') || 'Upload failed.');
                }
            }
        });
    };

    const breadcrumbs = [
        { title: 'Documents', href: '/documents/folders' },
        { title: 'Documents Folder', href: '/documents/folders' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Documents Folder" />

            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 text-slate-900 dark:text-slate-100">
                {/* ── Page Header ── */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Folder className="h-6 w-6 text-[#dd8b11]" />
                            Documents Folder
                        </h2>
                        <p className="text-muted-foreground">
                            Dedicated case file organization and folder management repository
                        </p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Folder Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input
                                id="folder-search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search folder name (e.g. case-026)..."
                                className="h-9 w-[260px] pl-8 pr-8"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* Create Case Folder Trigger */}
                        {canEdit && (
                            <Button
                                onClick={() => setIsCreateFolderModalOpen(true)}
                                className="h-9 bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-sm"
                            >
                                <FolderPlus className="mr-2 h-4 w-4" />
                                + Create Case Folder
                            </Button>
                        )}
                    </div>
                </div>

                {/* ── Case Folders Repository Grid ── */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-3 p-3.5 bg-card border rounded-lg shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-500/10 rounded-lg">
                                <Folder className="h-5 w-5 text-[#dd8b11]" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold flex items-center gap-2">
                                    Case Folder Repositories
                                    <Badge variant="outline" className="bg-amber-50 text-[#dd8b11] border-amber-300 font-bold text-[11px] px-2 py-0.5">
                                        {filteredFolders.length} {filteredFolders.length === 1 ? 'Folder' : 'Folders'}
                                    </Badge>
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    {showCaseFolders 
                                        ? `Showing ${filteredFolders.length} case folder repositories`
                                        : search
                                            ? `Search query "${search}" matches ${filteredFolders.length} folder(s). Click "Show Case Folders" to view.`
                                            : 'Click "Show Case Folders" to display case folder repositories.'}
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs font-semibold flex items-center gap-2 border-amber-500/40 text-[#dd8b11] hover:bg-amber-500/10 dark:hover:bg-amber-950/40"
                            onClick={() => setShowCaseFolders(!showCaseFolders)}
                        >
                            {showCaseFolders ? (
                                <>
                                    <ChevronUp className="h-4 w-4" />
                                    Hide Case Folders
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="h-4 w-4" />
                                    Show Case Folders
                                </>
                            )}
                        </Button>
                    </div>

                    {showCaseFolders && (
                        filteredFolders.length === 0 ? (
                            <Card className="p-12 text-center border-2 border-dashed bg-muted/20">
                                <Folder className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
                                <h3 className="text-base font-bold">No case folders found</h3>
                                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                                    {search
                                        ? `No case folder matches "${search}". Try clearing your search.`
                                        : 'Click "+ Create Case Folder" above to initialize a new dedicated case directory (e.g. case-026).'}
                                </p>
                                {search && (
                                    <Button variant="outline" size="sm" onClick={() => setSearch('')} className="mt-4 h-8 text-xs">
                                        Clear Search Filter
                                    </Button>
                                )}
                            </Card>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredFolders.map((folder) => (
                                <Card key={folder.id} className="border shadow-sm hover:shadow-md transition-shadow group">
                                    <CardHeader className="p-4 pb-2 border-b bg-slate-50/50 dark:bg-slate-900/50 flex flex-row items-center justify-between">
                                        <div className="min-w-0 flex-1 pr-2">
                                            <CardTitle 
                                                className="text-base font-bold flex items-center gap-2 text-foreground cursor-pointer group-hover:text-[#dd8b11] transition-colors truncate"
                                                onClick={() => setInspectedFolder(folder)}
                                            >
                                                📁 {folder.folder_name}
                                            </CardTitle>
                                            <p className="text-xs text-muted-foreground mt-0.5 font-medium truncate">
                                                {folder.complainant} vs. {folder.respondent}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <Badge variant="outline" className="bg-amber-50 text-[#dd8b11] border-amber-300 font-semibold text-[11px] px-2 py-0.5">
                                                {folder.case_number}
                                            </Badge>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 shrink-0"
                                                title="Delete Folder"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFolderToDelete(folder);
                                                }}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 space-y-3">
                                        <div className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                                            <span>Folder Contents ({folder.documents.length}):</span>
                                            <span className="text-[10px] text-muted-foreground font-normal">{folder.status}</span>
                                        </div>

                                        {folder.documents.length === 0 ? (
                                            <div className="py-4 text-center text-xs text-muted-foreground/60 bg-muted/10 rounded border border-dashed">
                                                No documents inside this folder yet.
                                            </div>
                                        ) : (
                                            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                                                {folder.documents.map((doc) => (
                                                    <div key={doc.id} className="text-xs p-2 rounded bg-background border flex items-center justify-between hover:bg-muted/40 transition-colors">
                                                        <div className="flex items-center gap-2 truncate pr-2">
                                                            <FileText className="h-3.5 w-3.5 text-[#dd8b11] flex-shrink-0" />
                                                            <span className="truncate font-medium">📄 {doc.type.replace(/_/g, ' ')}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 shrink-0">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                                                title="Security Revision History & Recovery"
                                                                onClick={() => setHistoryDoc({ id: doc.id, title: doc.type.replace(/_/g, ' ') })}
                                                            >
                                                                <ShieldCheck className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                                                title="View Document"
                                                                onClick={() => window.open(doc.file_path || `/documents/view/${doc.id}`, '_blank')}
                                                            >
                                                                <Eye className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {canEdit && (
                                            <div className="flex items-center gap-2 pt-2 border-t">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 text-xs font-semibold w-1/2 border-amber-300 text-[#dd8b11] hover:bg-amber-50"
                                                    onClick={() => window.open(`/documents/new?case_id=${folder.id}`, '_blank')}
                                                >
                                                    <FilePlus className="mr-1 h-3 w-3" />
                                                    Generate Form
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="h-7 text-xs font-semibold w-1/2 bg-slate-800 text-white hover:bg-slate-700"
                                                    onClick={() => setUploadFolderTarget(folder)}
                                                >
                                                    <Upload className="mr-1 h-3 w-3" />
                                                    Upload File
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )
                )}
            </div>

            {/* Document Security Revision History Modal */}
            <DocumentVersionHistoryModal
                isOpen={!!historyDoc}
                onClose={() => setHistoryDoc(null)}
                documentId={historyDoc?.id ?? null}
                documentTitle={historyDoc?.title ?? ''}
                canEdit={canEdit}
            />

                {/* ── Create Case Folder Modal ── */}
                <Dialog open={isCreateFolderModalOpen} onOpenChange={setIsCreateFolderModalOpen}>
                    <DialogContent className="sm:max-w-md p-6">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                                <FolderPlus className="h-5 w-5 text-[#dd8b11]" />
                                Create Case Document Folder
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Initialize a dedicated folder repository (e.g. <strong className="text-foreground">case-026</strong>) to organize forms and evidence.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreateFolderSubmit} className="space-y-4 mt-2">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Folder Name / ID (e.g., case-026)</Label>
                                <Input
                                    placeholder="e.g., case-026"
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    className="h-9 text-xs"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Case Number (Optional)</Label>
                                <Input
                                    placeholder="e.g., KP-2026-0026"
                                    value={newFolderCaseNo}
                                    onChange={(e) => setNewFolderCaseNo(e.target.value)}
                                    className="h-9 text-xs"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Complainant Name</Label>
                                    <Input
                                        placeholder="Juan Dela Cruz"
                                        value={newFolderComplainant}
                                        onChange={(e) => setNewFolderComplainant(e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Respondent Name</Label>
                                    <Input
                                        placeholder="Pedro Santos"
                                        value={newFolderRespondent}
                                        onChange={(e) => setNewFolderRespondent(e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Nature of Dispute / Case Type</Label>
                                <Input
                                    placeholder="e.g., Boundary Dispute / Amicable Settlement"
                                    value={newFolderNature}
                                    onChange={(e) => setNewFolderNature(e.target.value)}
                                    className="h-9 text-xs"
                                />
                            </div>

                            <DialogFooter className="pt-2 flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsCreateFolderModalOpen(false)}
                                    disabled={isCreatingFolder}
                                    className="h-9 text-xs"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isCreatingFolder || !newFolderName.trim()}
                                    className="h-9 text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center"
                                >
                                    {isCreatingFolder && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                                    Create Folder Repository
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* ── Direct Upload File to Case Folder Modal ── */}
                <Dialog open={Boolean(uploadFolderTarget)} onOpenChange={(open) => !open && setUploadFolderTarget(null)}>
                    <DialogContent className="sm:max-w-md p-6">
                        {uploadFolderTarget && (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                                        <Upload className="h-5 w-5 text-[#dd8b11]" />
                                        Upload File to 📁 {uploadFolderTarget.folder_name}
                                    </DialogTitle>
                                    <DialogDescription className="text-xs">
                                        Upload evidence files or PDFs into folder <strong className="text-foreground">{uploadFolderTarget.folder_name}</strong> ({uploadFolderTarget.case_number}).
                                    </DialogDescription>
                                </DialogHeader>

                                <form onSubmit={handleFolderUploadSubmit} className="space-y-4 mt-2">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold">Document Title / Type</Label>
                                        <Input
                                            placeholder="e.g., Evidence Photo / Scanned Agreement"
                                            value={folderDocType}
                                            onChange={(e) => setFolderDocType(e.target.value)}
                                            className="h-9 text-xs"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold">Select File (PDF, PNG, JPG)</Label>
                                        <Input
                                            type="file"
                                            accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0] || null;
                                                if (file) {
                                                    const allowedExtensions = ['pdf', 'png', 'jpg', 'jpeg'];
                                                    const ext = file.name.split('.').pop()?.toLowerCase() || '';
                                                    if (!allowedExtensions.includes(ext)) {
                                                        alert('Invalid file type. Only PDF, PNG, and JPG files are accepted.');
                                                        e.target.value = '';
                                                        setFolderUploadFile(null);
                                                        return;
                                                    }
                                                }
                                                setFolderUploadFile(file);
                                            }}
                                            className="h-9 text-xs cursor-pointer"
                                            required
                                        />
                                    </div>

                                    <DialogFooter className="pt-2 flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setUploadFolderTarget(null)}
                                            disabled={isUploadingToFolder}
                                            className="h-9 text-xs"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isUploadingToFolder || !folderUploadFile}
                                            className="h-9 text-xs bg-slate-800 hover:bg-slate-700 text-white font-semibold flex items-center"
                                        >
                                            {isUploadingToFolder && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                                            Upload Document to Folder
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </>
                        )}
                    </DialogContent>
                </Dialog>

                {/* ── Delete Folder Confirmation Modal ── */}
                <Dialog open={Boolean(folderToDelete)} onOpenChange={(open) => !open && setFolderToDelete(null)}>
                    <DialogContent className="sm:max-w-md p-6">
                        {folderToDelete && (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="text-lg font-bold flex items-center gap-2 text-red-600">
                                        <Trash2 className="h-5 w-5" />
                                        Delete Case Folder
                                    </DialogTitle>
                                    <DialogDescription className="text-xs pt-2 text-foreground/90 leading-relaxed font-medium">
                                        Are you sure you want to delete folder <strong className="text-red-600 font-bold">[{folderToDelete.folder_name}]</strong>? This action will permanently remove all attached KP forms and files contained within this folder.
                                    </DialogDescription>
                                </DialogHeader>

                                <DialogFooter className="pt-4 flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setFolderToDelete(null)}
                                        disabled={isDeleting}
                                        className="h-9 text-xs"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleDeleteFolder}
                                        disabled={isDeleting}
                                        className="h-9 text-xs bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center"
                                    >
                                        {isDeleting && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                                        Confirm Delete Folder
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
