import { Head, Link, router, usePage } from '@inertiajs/react';
import { SharedData } from '@/types';
import {
    FileText, Bell, FileCheck, FileMinus, Search, Download, Eye, Plus,
    Scale, AlertTriangle, Gavel, Handshake, Calendar, BadgeCheck, X,
    FileSignature, ClipboardCheck, UserPlus, Send, History, Trash2,
    ClipboardList, Briefcase, ShieldAlert, BadgeInfo, Edit, Upload, Loader2,
    Folder, FolderPlus, FilePlus, ChevronDown, ChevronUp, ShieldCheck
} from 'lucide-react';
import { DocumentVersionHistoryModal } from '@/components/documents/document-version-history-modal';

const ICON_MAP: Record<string, any> = {
    FileSignature,
    FileText,
    ClipboardList,
    Briefcase,
    ShieldAlert,
    BadgeInfo,
    Scale,
    Bell,
    Handshake,
    Gavel,
    AlertTriangle,
    FileMinus,
    Calendar,
    UserPlus,
    ClipboardCheck,
    Send,
    FileCheck
};
import { useEffect, useMemo, useState } from 'react';
import { useLiveSync } from '@/hooks/use-live-sync';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from "@/components/ui/textarea";
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

// ─── Template definitions (Updated categorization) ──────────────────────────────
const TEMPLATES = [
    { title: 'Complaint Form', description: 'KP Form No. 7 – Formal complaint filing', icon: FileText, type: 'complaint', isEditable: false },
    { title: 'Summons', description: 'KP Form No. 9 – Official notice to appear', icon: Bell, type: 'summons', isEditable: true },
    { title: 'Amicable Settlement', description: 'KP Form No. 16 – Agreement between parties', icon: Handshake, type: 'amicable_settlement', isEditable: true },
    { title: 'Affidavit of Withdrawal', description: 'Statement to withdraw complaint', icon: FileMinus, type: 'affidavit_withdrawal', isEditable: false },
    { title: 'Notice of Hearing (Conciliation)', description: 'Notice for Conciliation Proceedings', icon: Calendar, type: 'hearing_conciliation', isEditable: true },
    { title: 'Notice of Hearing (Mediation)', description: 'Notice for Mediation Proceedings', icon: Calendar, type: 'hearing_mediation', isEditable: true },
    { title: 'Notice of Hearing (Fail. to Appear)', description: 'Failure to appear at hearing', icon: Calendar, type: 'hearing_failure_appear', isEditable: true },
    { title: 'Notice of Hearing (Counterclaim)', description: 'Failure to appear – Counterclaim', icon: Calendar, type: 'hearing_failure_appear_counterclaim', isEditable: true },
    { title: 'Certificate to File Action (Court)', description: 'Authorization for court filing', icon: Scale, type: 'cert_file_action_court', isEditable: true },
    { title: 'Certificate to Bar Action', description: 'Barring future action', icon: Gavel, type: 'cert_bar_action', isEditable: true },
    { title: 'Certificate to Bar Counterclaim', description: 'Barring future counterclaim', icon: Gavel, type: 'cert_bar_counterclaim', isEditable: true },
    { title: 'Motion for Execution', description: 'Request for enforcement of settlement/award', icon: FileSignature, type: 'motion_execution', isEditable: true },
    { title: 'Officers Return', description: 'Record of summons or notice service', icon: ClipboardCheck, type: 'officers_return', isEditable: true },
    { title: 'Letter of Demand', description: 'Formal demand for action or payment', icon: Send, type: 'letter_of_demand', isEditable: true },
];

// ─── Helpers ──────────────────────────────────────────────────────────────
const getTemplateTitle = (type: string) => {
    if (type === 'uploaded' || type === 'upload') return 'Uploaded Document';
    if (type === 'custom_form' || type === 'custom') return 'Custom Form';
    const template = TEMPLATES.find(t => t.type === type);
    return template ? template.title : type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

interface Document {
    id: number;
    type: string;
    status: string;
    date: string | null;
    case_id: number | null;
    case_number: string | null;
    creator: { name: string } | null;
}

interface Template {
    id: number;
    title: string;
    description: string;
    type: string;
    icon: any;
    isCustom: boolean;
    isEditable?: boolean;
    file_path?: string;
    content?: any;
}

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

interface AiQuota {
    used: number;
    limit: number;
    isExceeded: boolean;
    resets_at?: string;
}

interface DocumentsProps {
    documents: Document[];
    stats: {
        total: number;
        summons: number;
        settlements: number;
        recent: number;
    };
    customTemplates: any[];
    hiddenTemplates: string[];
    caseFolders?: CaseFolder[];
    aiQuota?: AiQuota;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Documents({ documents, stats, customTemplates, hiddenTemplates, caseFolders = [], aiQuota }: DocumentsProps) {
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth?.user?.role === 'Administrator' || auth?.user?.role === 'Admin' || auth?.roles?.includes('Administrator') || auth?.roles?.includes('Admin') || (auth?.user?.email && auth.user.email.toLowerCase() === 'kataru@gmail.com');
    const canEdit = !isAdmin;

    // Real-time sync for documents list, custom templates, stats, and quota
    useLiveSync(5000, ['documents', 'stats', 'customTemplates', 'caseFolders', 'aiQuota']);

    // Quota state for weekly AI scans
    const [quotaState, setQuotaState] = useState<AiQuota>(aiQuota || { used: 0, limit: 20, isExceeded: false });

    useEffect(() => {
        if (aiQuota) {
            setQuotaState(aiQuota);
        }
    }, [aiQuota]);

    // Search filters templates
    const [search, setSearch] = useState('');
    // Filter for recent docs table only
    const [docFilter, setDocFilter] = useState('all');
    // Collapsible Recent Documents section state (defaults to collapsed for single-page view)
    const [showRecentDocs, setShowRecentDocs] = useState(false);

    // ─── Case Folder Management States ────────────────────────────────────────
    const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [newFolderCaseNo, setNewFolderCaseNo] = useState('');
    const [newFolderComplainant, setNewFolderComplainant] = useState('');
    const [newFolderRespondent, setNewFolderRespondent] = useState('');
    const [newFolderNature, setNewFolderNature] = useState('');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);

    const [uploadFolderTarget, setUploadFolderTarget] = useState<CaseFolder | null>(null);
    const [folderUploadFile, setFolderUploadFile] = useState<File | null>(null);
    const [folderDocType, setFolderDocType] = useState('Evidence File / Document');
    const [isUploadingToFolder, setIsUploadingToFolder] = useState(false);

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
            onError: () => setIsUploadingToFolder(false)
        });
    };

    // ─── Scanned Ingestion States ─────────────────────────────────────────────
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);
    const [tempFilePath, setTempFilePath] = useState<string | null>(null);
    
    // Editable review fields
    const [caseId, setCaseId] = useState<number | null>(null);
    const [caseSearch, setCaseSearch] = useState('');
    const [caseSuggestions, setCaseSuggestions] = useState<any[]>([]);
    
    const [docType, setDocType] = useState('complaint');
    const [complainant, setComplainant] = useState('');
    const [respondent, setRespondent] = useState('');
    const [caseNo, setCaseNo] = useState('');
    const [natureOfCase, setNatureOfCase] = useState('');
    const [summary, setSummary] = useState('');
    
    // For submitting the final form
    const [isSaving, setIsSaving] = useState(false);
    const [historyDoc, setHistoryDoc] = useState<{ id: number; title: string } | null>(null);

    // Lookup cases for linking
    const handleCaseSearch = async (val: string) => {
        setCaseSearch(val);
        if (!val.trim()) {
            setCaseSuggestions([]);
            return;
        }
        try {
            const res = await fetch(`/api/cases/lookup?search=${encodeURIComponent(val)}`);
            if (res.ok) {
                const data = await res.json();
                setCaseSuggestions(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Selecting a case from suggestions
    const selectCase = (c: any) => {
        setCaseId(c.id);
        setCaseNo(c.case_number);
        setNatureOfCase(c.nature_of_case);
        setCaseSearch(`${c.case_number} - ${c.title}`);
        setCaseSuggestions([]);
    };

    // Handle initial scanned file upload to Gemini API
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsScanning(true);
        setScanError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Read the encrypted XSRF-TOKEN cookie set by Laravel.
            // This is updated on every request and is always fresh, avoiding stale token issues from Inertia navigation.
            const getXsrfToken = (): string => {
                const name = 'XSRF-TOKEN';
                const value = `; ${document.cookie}`;
                const parts = value.split(`; ${name}=`);
                if (parts.length === 2) {
                    return decodeURIComponent(parts.pop()?.split(';').shift() || '');
                }
                return '';
            };

            const xsrfToken = getXsrfToken();
            const res = await fetch('/documents/upload', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': xsrfToken,
                },
                body: formData
            });

            let result;
            try {
                result = await res.json();
            } catch (jsonErr) {
                throw new Error(`Server returned an invalid response (Status ${res.status}). Please verify that your uploaded file size does not exceed the server's upload limit.`);
            }

            if (result.quota_exceeded || res.status === 429) {
                if (result.quota) {
                    setQuotaState(result.quota);
                } else {
                    setQuotaState(prev => ({ ...prev, isExceeded: true, used: 20 }));
                }
                setScanError(result.message || 'Weekly AI upload limit reached (20/20 files used). Please manually fill up your complaint or affidavit of withdrawal form.');
                return;
            }

            if (res.ok && result.success) {
                setTempFilePath(result.temp_file);
                const data = result.data || {};
                
                // Pre-fill editable inputs with AI-extracted values
                setComplainant(data.complainant || '');
                setRespondent(data.respondent || '');
                setCaseNo(data.case_no || '');
                setNatureOfCase(data.nature_of_case || '');
                setSummary(data.summary || '');
                
                // Map document_type to nearest enum
                if (data.document_type) {
                    setDocType(data.document_type);
                }
            } else {
                setScanError(result.message || 'Failed to scan the document. Please try again.');
            }
        } catch (err: any) {
            setScanError('An error occurred during scanning: ' + err.message);
        } finally {
            setIsScanning(false);
        }
    };

    const [caseNoError, setCaseNoError] = useState<string | null>(null);

    // Confirm and save final data to DB
    const handleSaveScanned = () => {
        if (!tempFilePath) return;

        if (!complainant.trim() || !respondent.trim()) {
            alert('Please fill in both the Complainant Name and Respondent Name before saving.');
            return;
        }

        if (!confirm('Are you sure you want to save this document to the database? Please review the entered details to ensure there are no mistakes.')) {
            return;
        }

        setIsSaving(true);
        setCaseNoError(null);

        router.post('/documents/store-scanned', {
            temp_file: tempFilePath,
            type: docType,
            complainant,
            respondent,
            case_no: caseNo,
            nature_of_case: natureOfCase,
            summary,
            case_id: caseId
        }, {
            onSuccess: () => {
                setIsSaving(false);
                setIsUploadModalOpen(false);
                resetModal();
            },
            onError: (errors: any) => {
                setIsSaving(false);
                if (errors.case_no) {
                    setCaseNoError(Array.isArray(errors.case_no) ? errors.case_no[0] : errors.case_no);
                } else {
                    alert(Object.values(errors).join('\n') || 'Failed to save scanned document.');
                }
            }
        });
    };

    // Reset all states
    const resetModal = () => {
        setTempFilePath(null);
        setScanError(null);
        setCaseId(null);
        setCaseSearch('');
        setCaseSuggestions([]);
        setDocType('complaint');
        setComplainant('');
        setRespondent('');
        setCaseNo('');
        setNatureOfCase('');
        setSummary('');
        setIsScanning(false);
        setIsSaving(false);
    };

    const breadcrumbs = [{ title: 'Documents', href: '/documents' }];

    // Combine built-in with custom
    const allAvailableTemplates = useMemo(() => {
        const custom = (customTemplates ?? []).map(t => ({
            ...t,
            icon: ICON_MAP[t.icon_name || 'FileSignature'] || FileSignature,
            isCustom: true
        }));

        const standard = TEMPLATES
            .filter(t => !(hiddenTemplates ?? []).includes(t.type))
            .map(t => ({ ...t, isCustom: false, id: 0 }));

        return [...standard, ...custom];
    }, [customTemplates, hiddenTemplates]);

    // ── Filter templates by search query ─────────────────────────────────────
    const filteredTemplates = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return allAvailableTemplates;
        return allAvailableTemplates.filter(t =>
            t.title.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.type.toLowerCase().includes(q)
        );
    }, [search, allAvailableTemplates]);

    // ── Filter recent documents by type dropdown and search ──────────────────────
    const filteredDocs = useMemo(() => {
        const q = search.trim().toLowerCase();
        return (documents ?? []).filter(doc => {
            const matchesType = docFilter === 'all' || doc.type === docFilter;
            const title = getTemplateTitle(doc.type).toLowerCase();
            const caseNum = (doc.case_number ?? '').toLowerCase();
            const creator = (doc.creator?.name ?? '').toLowerCase();
            const matchesSearch = !q || title.includes(q) || caseNum.includes(q) || creator.includes(q);
            return matchesType && matchesSearch;
        });
    }, [documents, docFilter, search]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Documents" />

            <div className="flex flex-col h-[calc(100vh-3.5rem)] p-4 md:p-6 space-y-4 overflow-hidden">

                {/* ── Page Header ── */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Document Management</h2>
                        <p className="text-muted-foreground">Search and generate official Lupon documents</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Search — filters template cards */}
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input
                                id="template-search"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search templates…"
                                className="h-9 w-[220px] pl-8 pr-8"
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
                        {/* Upload Scan (AI), Create Folder & Add Document buttons */}
                        {canEdit && (
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={() => setIsCreateFolderModalOpen(true)}
                                    className="h-9 bg-[#dd8b11] hover:bg-[#c47c0f] text-white"
                                >
                                    <FolderPlus className="mr-2 h-4 w-4" />
                                    Add Folder
                                </Button>
                                <Button
                                    onClick={() => setIsUploadModalOpen(true)}
                                    className="h-9 bg-slate-800 hover:bg-slate-700 text-white"
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Scan (AI)
                                </Button>
                                <Link href="/documents/new">
                                    <Button id="add-document-btn" className="h-9 bg-[#dd8b11] hover:bg-[#c47c0f] text-white">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Document
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>


                {/* ── Case Document Folders Management Section ── */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold tracking-tight flex items-center gap-2 text-foreground">
                                <Folder className="h-5 w-5 text-[#dd8b11]" />
                                Case Document Folders Management
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                Dedicated case folders (`case-026`, `case-027`) storing generated KP forms and uploaded files
                            </p>
                        </div>
                        {canEdit && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 border-amber-400 text-[#dd8b11] hover:bg-amber-50 font-semibold text-xs"
                                onClick={() => setIsCreateFolderModalOpen(true)}
                            >
                                <FolderPlus className="mr-1.5 h-3.5 w-3.5" />
                                New Case Folder
                            </Button>
                        )}
                    </div>

                    {caseFolders.length === 0 ? (
                        <Card className="p-8 text-center border-2 border-dashed bg-muted/20">
                            <Folder className="h-10 w-10 mx-auto mb-2 text-muted-foreground/40" />
                            <p className="text-sm font-semibold">No case document folders created yet.</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Click "Create Case Folder" to build a dedicated case folder repository (e.g., case-026).</p>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {caseFolders.map((folder) => (
                                <Card key={folder.id} className="border shadow-sm hover:shadow-md transition-shadow">
                                    <CardHeader className="p-4 pb-2 border-b bg-muted/20 flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                                                📁 {folder.folder_name}
                                            </CardTitle>
                                            <p className="text-xs text-muted-foreground mt-0.5 font-medium truncate max-w-[220px]">
                                                {folder.complainant} vs. {folder.respondent}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="bg-amber-50 text-[#dd8b11] border-amber-300 font-semibold text-[11px] px-2 py-0.5">
                                            {folder.case_number}
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="p-4 space-y-3">
                                        <div className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                                            <span>Folder Contents ({folder.documents.length}):</span>
                                            <span className="text-[10px] text-muted-foreground font-normal">{folder.status}</span>
                                        </div>

                                        {folder.documents.length === 0 ? (
                                            <div className="py-4 text-center text-xs text-muted-foreground/60 bg-muted/10 rounded border border-dashed">
                                                No files inside this folder yet.
                                            </div>
                                        ) : (
                                            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                                                {folder.documents.map((doc) => (
                                                    <div key={doc.id} className="text-xs p-2 rounded bg-background border flex items-center justify-between hover:bg-muted/40 transition-colors">
                                                        <div className="flex items-center gap-2 truncate pr-2">
                                                            <FileText className="h-3.5 w-3.5 text-[#dd8b11] flex-shrink-0" />
                                                            <span className="truncate font-medium">📄 {doc.type.replace(/_/g, ' ')}</span>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                                            onClick={() => window.open(`/documents/view/${doc.id}`, '_blank')}
                                                        >
                                                            <Eye className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

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
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Document Templates ── */}
                <Card className="flex-1 flex flex-col min-h-0 border shadow-sm overflow-hidden">
                    <CardHeader className="py-3 px-4 shrink-0 border-b">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                                <CardTitle className="text-base font-bold">Document Templates</CardTitle>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {search
                                        ? `${filteredTemplates.length} of ${allAvailableTemplates.length} templates matching "${search}"`
                                        : `Choose from all ${allAvailableTemplates.length} official Lupon forms`}
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-4">
                        {filteredTemplates.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                                <FileText className="h-10 w-10 mb-3 text-[#dd8b11]" />
                                <p className="font-medium text-sm">No templates match "{search}"</p>
                                <button
                                    onClick={() => setSearch('')}
                                    className="text-xs mt-2 text-primary underline-offset-2 hover:underline"
                                >
                                    Clear search
                                </button>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {filteredTemplates.map((template: Template, idx) => {
                                    const fillHref = template.isCustom ? `/documents/fill-custom/${template.id}` : `/documents/create/${template.type}`;
                                    const editHref = template.isCustom ? `/documents/edit-template/${template.id}` : `/documents/edit-standard/${template.type}`;
                                    const isViewOnly = template.isEditable === false || (template.isCustom && (template as any).content?.is_view_only);
                                    const pdfUrl = template.isCustom 
                                        ? ((template as any).file_path?.startsWith('/storage/') ? (template as any).file_path : `/storage/${(template as any).file_path}`)
                                        : `/forms/${template.type}.pdf`;

                                    return (
                                        <div
                                            key={template.isCustom ? `custom-${template.id}` : template.type}
                                            onClick={() => {
                                                if (isAdmin) {
                                                    router.visit(`/cases?doc_type=${encodeURIComponent(template.type)}&doc_title=${encodeURIComponent(template.title)}`);
                                                } else if (isViewOnly) {
                                                    window.open(pdfUrl, '_blank');
                                                } else {
                                                    window.location.href = fillHref;
                                                }
                                            }}
                                            className="flex flex-col justify-between p-4 rounded-lg border bg-card hover:border-[#dd8b11]/30 hover:bg-[#dd8b11]/5 dark:hover:bg-[#dd8b11]/10 transition-all group cursor-pointer relative shadow-sm hover:shadow-md"
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div className="p-2 bg-[#dd8b11] rounded-lg mt-0.5 shrink-0 group-hover:bg-[#cb7d0f] transition-colors">
                                                    <template.icon className="h-4 w-4 text-white dark:text-black stroke-[2]" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="text-sm font-bold leading-tight group-hover:text-[#dd8b11] transition-colors truncate">{template.title}</p>
                                                        {isViewOnly && (
                                                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground whitespace-nowrap shrink-0">View Only</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{template.description}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/50">
                                                <span className="text-[11px] text-muted-foreground group-hover:text-[#dd8b11] transition-colors font-medium">
                                                    {isAdmin ? 'Click to view cases' : (isViewOnly ? 'Click to view form' : 'Click to fill form')}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                        {isViewOnly && !isAdmin && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    window.open(pdfUrl, '_blank');
                                                                }}
                                                                className="inline-flex items-center justify-center rounded bg-[#dd8b11] text-white px-2.5 py-1 text-[11px] font-bold tracking-wide hover:bg-[#c47c0f] transition-colors uppercase shadow-xs gap-1"
                                                                title="View Document Template"
                                                            >
                                                                <Eye className="h-3 w-3" />
                                                                <span>View Form</span>
                                                            </button>
                                                        )}
                                                        {!isViewOnly && (
                                                            <a
                                                                href={editHref}
                                                                onClick={e => e.stopPropagation()}
                                                                className="inline-flex items-center justify-center rounded-md h-7 w-7 text-muted-foreground hover:bg-amber-100 hover:text-[#dd8b11] dark:hover:bg-amber-950/40 transition-colors"
                                                                title="Word Editor"
                                                            >
                                                                <Edit className="h-3.5 w-3.5" />
                                                            </a>
                                                        )}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const msg = template.isCustom
                                                                    ? 'Are you sure you want to delete this custom template?'
                                                                    : 'Are you sure you want to remove this standard template from the list?';

                                                                if (confirm(msg)) {
                                                                    const url = `/documents/delete/${template.id || 0}`;
                                                                    const data = !template.isCustom ? { document_type: template.type } : {};
                                                                    router.post(url, data);
                                                                }
                                                            }}
                                                            className="inline-flex items-center justify-center rounded-md h-7 w-7 text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/40 transition-colors"
                                                            title="Delete Template"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ── Recent Documents Collapsible Section ── */}
                <Card id="recent-documents-section" className="border shadow-sm shrink-0">
                    <CardHeader 
                        className="py-3.5 px-4 flex flex-row items-center justify-between flex-wrap gap-3 cursor-pointer select-none hover:bg-muted/20 transition-colors"
                        onClick={() => setShowRecentDocs(!showRecentDocs)}
                    >
                        <div className="flex items-center gap-3">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <History className="h-4 w-4 text-[#dd8b11]" />
                                Recent Documents
                            </CardTitle>
                            <Badge variant="outline" className="bg-amber-500/10 text-[#dd8b11] border-amber-300 dark:bg-amber-950/40 dark:border-amber-800 font-bold text-xs px-2.5 py-0.5">
                                {documents.length} Recent Documents Made
                            </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                            {showRecentDocs && (
                                <div className="flex items-center gap-2 flex-wrap" onClick={e => e.stopPropagation()}>
                                    <select
                                        id="doc-filter-type"
                                        value={docFilter}
                                        onChange={e => setDocFilter(e.target.value)}
                                        className="h-8 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring max-w-[180px]"
                                    >
                                        <option value="all">All Types</option>
                                        <optgroup label="Standard Forms">
                                            {TEMPLATES.map(t => (
                                                <option key={t.type} value={t.type}>{t.title}</option>
                                            ))}
                                        </optgroup>
                                        <optgroup label="Other">
                                            <option value="custom_form">Custom Form</option>
                                            <option value="upload">Uploaded</option>
                                        </optgroup>
                                    </select>
                                    {docFilter !== 'all' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 text-xs"
                                            onClick={() => setDocFilter('all')}
                                        >
                                            <X className="h-3 w-3 mr-1" /> Clear
                                        </Button>
                                    )}
                                    {canEdit && (
                                        <Link href="/documents/new">
                                            <Button className="h-8 bg-[#dd8b11] hover:bg-[#c47c0f] text-white text-xs">
                                                <Plus className="mr-1.5 h-3.5 w-3.5" />
                                                Add Document
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            )}
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 text-xs font-semibold flex items-center gap-1.5 border-amber-500/40 text-[#dd8b11] hover:bg-amber-500/10 dark:hover:bg-amber-950/40"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowRecentDocs(!showRecentDocs);
                                }}
                            >
                                {showRecentDocs ? (
                                    <>
                                        <ChevronUp className="h-4 w-4" />
                                        Hide Recent Documents
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="h-4 w-4" />
                                        Show Recent Documents
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardHeader>
                    {showRecentDocs && (
                        <CardContent className="pt-2 border-t">
                            <div className="rounded-md border mt-2">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Document Type</th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Case No.</th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Encoded By</th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredDocs.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                                                    <History className="h-8 w-8 mx-auto mb-2 text-[#dd8b11]" />
                                                    {docFilter !== 'all'
                                                        ? `No documents of type "${docFilter}".`
                                                        : (
                                                            <span>
                                                                No documents yet.{' '}
                                                                <Link href="/documents/new" className="text-primary underline-offset-2 hover:underline">
                                                                    Add one
                                                                </Link>
                                                                {' '}or fill out a template above.
                                                            </span>
                                                        )
                                                    }
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredDocs.map(doc => (
                                                <tr key={doc.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                                                    <td className="px-4 py-3 font-medium">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-[#dd8b11] rounded-lg flex-shrink-0">
                                                                <FileText className="h-4 w-4 text-white dark:text-black stroke-[2]" />
                                                            </div>
                                                            <div>
                                                                <div>{getTemplateTitle(doc.type)}</div>
                                                                <div className="text-xs text-muted-foreground">{doc.type}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {doc.case_number ? (
                                                            <span className="font-mono text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-[#dd8b11] border border-amber-300 dark:border-amber-800 px-2 py-0.5 rounded">
                                                                {doc.case_number}
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted-foreground/50">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground text-sm">
                                                        {doc.creator?.name || 'Encoder'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge variant="outline" className="font-normal capitalize">
                                                            {doc.status || 'generated'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground text-sm">
                                                        {doc.date ? new Date(doc.date).toLocaleDateString() : '—'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => setHistoryDoc({ id: doc.id, title: getTemplateTitle(doc.type) || doc.type })}
                                                                title="Security Revision History & Recovery"
                                                                className="inline-flex items-center justify-center rounded-md h-9 px-2 text-xs font-medium hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 dark:hover:bg-emerald-950/40 transition-colors gap-1 border border-emerald-300 dark:border-emerald-800"
                                                            >
                                                                <ShieldCheck className="h-4 w-4" />
                                                                History
                                                            </button>
                                                            <a
                                                                href={`/documents/view/${doc.id}`}
                                                                target="_blank"
                                                                title="View Document"
                                                                className="inline-flex items-center justify-center rounded-md h-9 w-9 hover:bg-[#dd8b11] transition-colors text-muted-foreground hover:text-white"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </a>
                                                            {canEdit && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        if (confirm('Are you sure you want to delete this document?')) {
                                                                            router.post(`/documents/delete/${doc.id}`);
                                                                        }
                                                                    }}
                                                                    title="Delete Document"
                                                                    className="inline-flex items-center justify-center rounded-md h-9 w-9 hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-xs text-muted-foreground mt-3">
                                {filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''}
                                {docFilter !== 'all' && ` (filtered by type: ${docFilter})`}
                            </p>
                        </CardContent>
                    )}
                </Card>

            {/* ─── Upload Scan (AI) Modal ─── */}
            <Dialog open={isUploadModalOpen} onOpenChange={(open) => {
                if (!open) {
                    resetModal();
                }
                setIsUploadModalOpen(open);
            }}>
                <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Upload className="h-5 w-5 text-[#dd8b11]" />
                            Upload Scanned Document (AI Scanner)
                        </DialogTitle>
                        <DialogDescription>
                            Upload a physical form image. Google Gemini will parse the handwriting to populate fields.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Step 1: Upload File or Show Quota Limit Fallback / Spinner */}
                    {!tempFilePath && !isScanning && (
                        quotaState.isExceeded ? (
                            /* ── When Weekly AI Scan Limit is Reached: Fallback Manual Fill-Up Options ── */
                            <div className="space-y-4 py-2">
                                <div className="p-4 bg-amber-500/10 border border-amber-500/30 dark:bg-amber-950/30 rounded-xl space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                                            <AlertTriangle className="h-5 w-5 text-[#dd8b11]" />
                                            <span>Weekly AI Upload Limit Reached</span>
                                        </div>
                                        <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 border-amber-300 font-bold text-xs">
                                            {quotaState.used} / {quotaState.limit} Scans Used
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
                                        The maximum weekly capacity of 20 scanned files for AI document extraction has been reached. AI scanning will automatically reset {quotaState.resets_at ? `on ${quotaState.resets_at}` : 'at the start of next week'}.
                                    </p>
                                </div>

                                {scanError && (
                                    <div className="p-3 bg-red-500/10 border border-red-200 text-red-700 dark:text-red-400 rounded-md text-xs font-medium">
                                        {scanError}
                                    </div>
                                )}

                                <div className="rounded-xl border bg-card p-4 space-y-3 shadow-xs">
                                    <div>
                                        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                                            <FileSignature className="h-4 w-4 text-[#dd8b11]" />
                                            Manually Fill Up Your Document (Second Option)
                                        </h4>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Since AI scanning is at maximum capacity, choose a form below to manually encode and generate your document:
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                                        {/* Manual Complaint Form Card */}
                                        <div className="border rounded-lg p-3.5 bg-background hover:border-[#dd8b11]/60 hover:shadow-xs transition-all flex flex-col justify-between">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <div className="p-2 bg-amber-500/10 rounded-md text-[#dd8b11]">
                                                        <FileText className="h-4 w-4" />
                                                    </div>
                                                    <Badge variant="secondary" className="text-[10px] font-semibold">
                                                        KP Form No. 7
                                                    </Badge>
                                                </div>
                                                <h5 className="text-xs font-bold text-foreground">Complaint Form</h5>
                                                <p className="text-[11px] text-muted-foreground line-clamp-2">
                                                    Manually enter complainant, respondent, and formal complaint statement.
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={() => {
                                                    setIsUploadModalOpen(false);
                                                    router.visit('/documents/create/complaint');
                                                }}
                                                className="w-full mt-3 bg-[#dd8b11] hover:bg-[#c47c0f] text-white text-xs font-semibold h-8"
                                            >
                                                Manually Fill Up Complaint
                                            </Button>
                                        </div>

                                        {/* Manual Affidavit of Withdrawal Card */}
                                        <div className="border rounded-lg p-3.5 bg-background hover:border-[#dd8b11]/60 hover:shadow-xs transition-all flex flex-col justify-between">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <div className="p-2 bg-slate-500/10 rounded-md text-slate-700 dark:text-slate-300">
                                                        <FileMinus className="h-4 w-4" />
                                                    </div>
                                                    <Badge variant="secondary" className="text-[10px] font-semibold">
                                                        Withdrawal
                                                    </Badge>
                                                </div>
                                                <h5 className="text-xs font-bold text-foreground">Affidavit of Withdrawal</h5>
                                                <p className="text-[11px] text-muted-foreground line-clamp-2">
                                                    Manually input sworn statement to withdraw or dismiss an active complaint.
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setIsUploadModalOpen(false);
                                                    router.visit('/documents/create/affidavit_withdrawal');
                                                }}
                                                className="w-full mt-3 border-[#dd8b11]/40 text-[#dd8b11] hover:bg-amber-500/10 text-xs font-semibold h-8"
                                            >
                                                Manually Fill Up Affidavit
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* ── Normal State (< 20 Scans): Standard Drag-and-Drop File Upload (Manual buttons strictly hidden) ── */
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-lg p-8 hover:bg-muted/30 transition-colors cursor-pointer relative min-h-[200px]">
                                <input
                                    type="file"
                                    accept="image/*,.pdf,application/pdf"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <Upload className="h-10 w-10 text-muted-foreground/60 mb-4" />
                                <p className="text-sm font-semibold mb-1">Click to upload scanned document or image</p>
                                <p className="text-xs text-muted-foreground">PDF, PNG, JPG, or JPEG up to 15MB</p>
                                {scanError && (
                                    <p className="text-xs text-red-500 mt-4 text-center bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-md border border-red-200 dark:border-red-900/30">
                                        {scanError}
                                    </p>
                                )}
                            </div>
                        )
                    )}

                    {/* Loading State during AI parsing */}
                    {isScanning && (
                        <div className="flex flex-col items-center justify-center py-12 text-center min-h-[200px]">
                            <Loader2 className="h-10 w-10 text-[#dd8b11] animate-spin mb-4" />
                            <p className="text-sm font-semibold mb-1">AI Ingestion in Progress...</p>
                            <p className="text-xs text-muted-foreground max-w-[280px]">
                                Google Gemini is transcribing handwriting and extracting details from the document.
                            </p>
                        </div>
                    )}

                    {/* Step 2: Review and Edit AI Extracted Fields */}
                    {tempFilePath && !isScanning && (
                        <div className="space-y-4 py-2">
                            <div className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 text-xs px-3 py-2 rounded-md border border-green-200 dark:border-green-900/20 mb-2">
                                ✓ AI Ingestion completed! Please verify and correct the details below.
                            </div>

                            {/* Link to Existing Case Folder */}
                            <div className="space-y-1.5 relative">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="case-folder-select-index" className="text-xs font-semibold flex items-center gap-1.5">
                                        <Folder className="h-3.5 w-3.5 text-[#dd8b11]" />
                                        <span>Link to Existing Case Folder (Optional)</span>
                                    </Label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsCreateFolderModalOpen(true)}
                                        className="h-6 text-[11px] font-semibold text-[#dd8b11] hover:text-[#c47c0f] hover:bg-amber-50 dark:hover:bg-amber-950/40 px-2 flex items-center gap-1"
                                    >
                                        <FolderPlus className="h-3.5 w-3.5" />
                                        <span>+ Add Folder</span>
                                    </Button>
                                </div>

                                <select
                                    id="case-folder-select-index"
                                    value={caseId || ''}
                                    onChange={(e) => {
                                        const selectedId = e.target.value ? Number(e.target.value) : null;
                                        if (!selectedId) {
                                            setCaseId(null);
                                            setCaseSearch('');
                                            return;
                                        }
                                        const folder = (caseFolders ?? []).find(f => f.id === selectedId);
                                        if (folder) {
                                            setCaseId(folder.id);
                                            if (folder.case_number) setNewFolderCaseNo(folder.case_number);
                                            if (folder.complainant) setNewFolderComplainant(folder.complainant);
                                            if (folder.respondent) setNewFolderRespondent(folder.respondent);
                                            if (folder.nature_of_case) setNewFolderNature(folder.nature_of_case);
                                            setCaseSearch(`${folder.folder_name} (${folder.case_number || 'No Case #'}) - ${folder.complainant} vs. ${folder.respondent}`);
                                        }
                                    }}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">-- Select an Existing Case Folder --</option>
                                    {(caseFolders ?? []).map((f) => (
                                        <option key={f.id} value={f.id}>
                                            📁 {f.folder_name} {f.case_number ? `(${f.case_number})` : ''} - {f.complainant || 'Party'} vs. {f.respondent || 'Party'}
                                        </option>
                                    ))}
                                </select>

                                {caseId && (
                                    <div className="flex items-center justify-between mt-1 px-2.5 py-1.5 bg-amber-500/10 border border-amber-300/40 rounded text-xs">
                                        <span className="font-medium text-[#dd8b11] flex items-center gap-1 truncate">
                                            <Folder className="h-3.5 w-3.5 shrink-0" />
                                            Linked to Folder: <strong className="ml-1 font-bold">{caseSearch || `Folder #${caseId}`}</strong>
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => { setCaseId(null); setCaseSearch(''); }}
                                            className="text-xs text-red-500 font-medium hover:underline shrink-0 ml-2"
                                        >
                                            Unlink
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {/* Document Type Selector */}
                                <div className="space-y-1.5 col-span-2">
                                    <Label htmlFor="doc-type" className="text-xs font-semibold">Document Nature / Type</Label>
                                    <select
                                        id="doc-type"
                                        value={docType}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setDocType(val);
                                            if (val === 'affidavit_withdrawal') {
                                                setNatureOfCase('Affidavit of Withdrawal');
                                            } else {
                                                setNatureOfCase('Complaint');
                                            }
                                        }}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    >
                                        <option value="complaint">Complaint Form (KP Form 7)</option>
                                        <option value="affidavit_withdrawal">Affidavit of Withdrawal</option>
                                    </select>
                                </div>

                                {/* Case Number */}
                                <div className="space-y-1.5 col-span-2">
                                    <Label htmlFor="case-number" className="text-xs font-semibold">Case Number</Label>
                                    <Input
                                        id="case-number"
                                        value={caseNo}
                                        onChange={(e) => {
                                            setCaseNo(e.target.value);
                                            setCaseNoError(null);
                                        }}
                                        className={`h-9 text-xs ${caseNoError ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20' : ''}`}
                                        required
                                    />
                                    {caseNoError && (
                                        <p className="text-xs text-red-600 font-semibold mt-1">{caseNoError}</p>
                                    )}
                                </div>

                                {/* Complainant */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="complainant" className="text-xs font-semibold">Complainant Name</Label>
                                    <Input
                                        id="complainant"
                                        value={complainant}
                                        onChange={(e) => setComplainant(e.target.value)}
                                        className="h-9 text-xs"
                                        required
                                    />
                                </div>

                                {/* Respondent */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="respondent" className="text-xs font-semibold">Respondent Name</Label>
                                    <Input
                                        id="respondent"
                                        value={respondent}
                                        onChange={(e) => setRespondent(e.target.value)}
                                        className="h-9 text-xs"
                                        required
                                    />
                                </div>

                                {/* Nature of Case */}
                                <div className="space-y-1.5 col-span-2">
                                    <Label htmlFor="nature-of-case" className="text-xs font-semibold">Nature of Case</Label>
                                    <select
                                        id="nature-of-case"
                                        value={natureOfCase}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setNatureOfCase(val);
                                            if (val === 'Affidavit of Withdrawal') {
                                                setDocType('affidavit_withdrawal');
                                            } else {
                                                setDocType('complaint');
                                            }
                                        }}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                        required
                                    >
                                        <option value="Complaint">Complaint</option>
                                        <option value="Affidavit of Withdrawal">Affidavit of Withdrawal</option>
                                    </select>
                                </div>

                                {/* Summary */}
                                <div className="space-y-1.5 col-span-2">
                                    <Label htmlFor="summary" className="text-xs font-semibold">Document Summary / Narrative</Label>
                                    <Textarea
                                        id="summary"
                                        value={summary}
                                        onChange={(e) => setSummary(e.target.value)}
                                        rows={3}
                                        className="text-xs resize-none"
                                        placeholder="Brief statement extracted from the document..."
                                    />
                                </div>
                            </div>

                            <DialogFooter className="mt-4 flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={resetModal}
                                    disabled={isSaving}
                                    className="h-9 text-xs"
                                >
                                    Clear & Start Over
                                </Button>
                                <Button
                                    onClick={handleSaveScanned}
                                    disabled={isSaving}
                                    className="h-9 text-xs bg-[#dd8b11] hover:bg-[#c47c0f] text-white flex items-center"
                                >
                                    {isSaving && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                                    Confirm & Save to Database
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Create Case Folder Modal */}
            <Dialog open={isCreateFolderModalOpen} onOpenChange={setIsCreateFolderModalOpen}>
                <DialogContent className="sm:max-w-md p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                            <FolderPlus className="h-5 w-5 text-[#dd8b11]" />
                            Create Case Document Folder
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Define a dedicated folder repository (e.g. <strong className="text-foreground">case-026</strong>) to store all related KP forms and uploaded files.
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

            {/* Direct Upload File to Case Folder Modal */}
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
                                    Upload evidence files, PDFs, or scanned documents into case folder <strong className="text-foreground">{uploadFolderTarget.folder_name}</strong> ({uploadFolderTarget.case_number}).
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
                                    <Label className="text-xs font-semibold">Select File (PDF, DOCX, JPG, PNG)</Label>
                                    <Input
                                        type="file"
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        onChange={(e) => setFolderUploadFile(e.target.files?.[0] || null)}
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

            {/* Document Security Revision History Modal */}
            <DocumentVersionHistoryModal
                isOpen={!!historyDoc}
                onClose={() => setHistoryDoc(null)}
                documentId={historyDoc?.id ?? null}
                documentTitle={historyDoc?.title || 'Document'}
                canEdit={canEdit}
            />

            </div>
        </AppLayout>
    );
}
