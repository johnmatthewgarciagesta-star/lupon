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
import { useMemo, useState } from 'react';
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

interface DocumentsProps {
    documents: Document[];
    stats: {
        total: number;
        summons: number;
        settlements: number;
        recent: number;
    };
    customTemplates: any[];
    hiddenTemplates?: string[];
}

export default function DocumentsTemplates({ documents, stats, customTemplates, hiddenTemplates }: DocumentsProps) {
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth?.user?.role === 'Administrator' || auth?.user?.role === 'Admin' || auth?.roles?.includes('Administrator') || auth?.roles?.includes('Admin');
    const canEdit = true;

    // Search filters templates
    const [search, setSearch] = useState('');
    const [historyDoc, setHistoryDoc] = useState<{ id: number; title: string } | null>(null);
    // Filter for recent docs table only
    const [docFilter, setDocFilter] = useState('all');
    // Collapsible Recent Documents section state (defaults to collapsed for single-page view)
    const [showRecentDocs, setShowRecentDocs] = useState(false);

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
            const getXsrfToken = (): string => {
                const name = 'XSRF-TOKEN';
                const cookies = document.cookie.split(';');
                for (let cookie of cookies) {
                    cookie = cookie.trim();
                    if (cookie.startsWith(name + '=')) {
                        return decodeURIComponent(cookie.substring(name.length + 1));
                    }
                }
                return '';
            };

            const token = getXsrfToken();
            const res = await fetch('/documents/upload', {
                method: 'POST',
                headers: {
                    'X-XSRF-TOKEN': token,
                    'Accept': 'application/json',
                },
                body: formData,
            });

            const result = await res.json();

            if (!res.ok || !result.success) {
                const rawMsg = result.message || 'Failed to analyze document.';
                if (rawMsg.includes('Could not resolve host') || rawMsg.includes('cURL error') || rawMsg.includes('Internet connection required') || rawMsg.includes('Failed to fetch')) {
                    throw new Error('Internet connection required for Gemini AI metadata extraction. Please check your network or enter data manually.');
                }
                throw new Error(rawMsg);
            }

            setTempFilePath(result.temp_file);
            const ext = result.data || {};
            setDocType(ext.document_type || 'complaint');
            setComplainant(ext.complainant || '');
            setRespondent(ext.respondent || '');
            setCaseNo(ext.case_no || '');
            setNatureOfCase(ext.nature_of_case || '');
            setSummary(ext.summary || '');

        } catch (err: any) {
            console.error(err);
            const msg = err.message || '';
            if (msg.includes('Could not resolve host') || msg.includes('cURL error') || msg.includes('Internet connection required') || msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
                setScanError('Internet connection required for Gemini AI metadata extraction. Please check your network or enter data manually.');
            } else {
                setScanError(msg || 'An unexpected error occurred during processing.');
            }
        } finally {
            setIsScanning(false);
        }
    };

    const [caseNoError, setCaseNoError] = useState<string | null>(null);

    // Handle saving the reviewed scanned form data
    const handleSaveScanned = () => {
        if (!tempFilePath) return;

        if (!complainant.trim() || !respondent.trim()) {
            alert('Please fill in both the Complainant Name and Respondent Name before saving.');
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

    const breadcrumbs = [{ title: 'Documents', href: '/documents/templates' }];

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
            (t.title ?? '').toLowerCase().includes(q) ||
            (t.description ?? '').toLowerCase().includes(q) ||
            (t.type ?? '').toLowerCase().includes(q)
        );
    }, [search, allAvailableTemplates]);

    // ── Filter recent documents by type dropdown and search ──────────────────────
    const filteredDocs = useMemo(() => {
        const q = search.trim().toLowerCase();
        return (documents ?? []).filter(doc => {
            const matchesType = docFilter === 'all' || doc.type === docFilter;
            const title = (getTemplateTitle(doc.type ?? '') ?? '').toLowerCase();
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
                        {/* Upload Scan (AI) & Add Document buttons */}
                        {canEdit && (
                            <div className="flex items-center gap-2">
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
                                    const canFill = !isAdmin && !isViewOnly;

                                    return (
                                        <div
                                            key={template.isCustom ? `custom-${template.id}` : template.type}
                                            onClick={() => {
                                                if (canFill) {
                                                    window.location.href = fillHref;
                                                } else {
                                                    router.visit(`/cases?doc_type=${encodeURIComponent(template.type)}&doc_title=${encodeURIComponent(template.title)}`);
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
                                                    </div>
                                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{template.description}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/50">
                                                <span className="text-[11px] text-muted-foreground group-hover:text-[#dd8b11] transition-colors font-medium">
                                                    {canFill ? 'Click to fill form' : 'Click to view cases'}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                        {!(template.isEditable === false || (template.isCustom && (template as any).content?.is_view_only)) && (
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
                                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                    <span className="text-xs text-muted-foreground font-medium">Filter by:</span>
                                    <select
                                        value={docFilter}
                                        onChange={e => setDocFilter(e.target.value)}
                                        className="h-8 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                    >
                                        <option value="all">All Document Types</option>
                                        <option value="summons">Summons</option>
                                        <option value="amicable_settlement">Amicable Settlement</option>
                                        <option value="hearing_conciliation">Conciliation Hearing</option>
                                        <option value="hearing_mediation">Mediation Hearing</option>
                                        <option value="cert_file_action_court">Certificate to File Action</option>
                                        <option value="letter_of_demand">Demand Letters</option>
                                    </select>
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
                            {filteredDocs.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    {docFilter !== 'all' || search ? (
                                        <span>No documents match the current filter or search criteria.</span>
                                    ) : (
                                        <span>No generated documents found. Select a template above to generate one.</span>
                                    )}
                                </div>
                            ) : (
                                <div className="overflow-x-auto pt-2">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-muted-foreground uppercase border-b bg-muted/30">
                                            <tr>
                                                <th className="py-3 px-4 font-medium">Document Type</th>
                                                <th className="py-3 px-4 font-medium">Linked Case</th>
                                                <th className="py-3 px-4 font-medium">Encoded By</th>
                                                <th className="py-3 px-4 font-medium">Date Created</th>
                                                <th className="py-3 px-4 font-medium text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {filteredDocs.map(doc => (
                                                <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                                                    <td className="py-3 px-4 font-medium text-foreground">
                                                        <div className="flex items-center gap-2">
                                                            <FileText className="h-4 w-4 text-[#dd8b11]" />
                                                            <span>{getTemplateTitle(doc.type)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-muted-foreground font-mono text-xs">
                                                        {doc.case_number ? (
                                                            <span className="bg-amber-50 dark:bg-amber-950/40 text-[#dd8b11] border border-amber-300 dark:border-amber-800 px-2 py-0.5 rounded font-semibold">
                                                                {doc.case_number}
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted-foreground/50">Unlinked</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4 text-muted-foreground">
                                                        {doc.creator?.name || 'System User'}
                                                    </td>
                                                    <td className="py-3 px-4 text-muted-foreground">
                                                        {doc.date ? new Date(doc.date).toLocaleDateString() : 'N/A'}
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 px-2 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                                                title="Security Revision History & Recovery"
                                                                onClick={() => setHistoryDoc({ id: doc.id, title: getTemplateTitle(doc.type) })}
                                                            >
                                                                <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                                                                History
                                                            </Button>
                                                            {canEdit && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-7 px-2 text-xs text-[#dd8b11] hover:bg-amber-50 dark:hover:bg-amber-950/40"
                                                                    title="Edit Document Fields"
                                                                    onClick={() => window.open(`/documents/view/${doc.id}?mode=edit`, '_blank')}
                                                                >
                                                                    <Edit className="mr-1 h-3.5 w-3.5" />
                                                                    Edit
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 px-2 text-xs text-foreground hover:bg-accent"
                                                                onClick={() => window.open(`/documents/view/${doc.id}`, '_blank')}
                                                            >
                                                                <Eye className="mr-1 h-3.5 w-3.5" />
                                                                View
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    )}
                </Card>

            </div>

            {/* ── Scanned Ingestion Modal ── */}
            <Dialog open={isUploadModalOpen} onOpenChange={(open) => {
                setIsUploadModalOpen(open);
                if (!open) resetModal();
            }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Upload className="h-5 w-5 text-[#dd8b11]" />
                            Upload & Scan Document (AI Ingestion)
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Upload a physical scan or PDF of a Katarungang Pambarangay form. Gemini AI will analyze and extract the metadata for your review.
                        </DialogDescription>
                    </DialogHeader>

                    {!tempFilePath ? (
                        <div className="space-y-4 py-4">
                            <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted/20 hover:bg-muted/40 transition-colors">
                                {isScanning ? (
                                    <div className="flex flex-col items-center justify-center space-y-3 py-4">
                                        <Loader2 className="h-8 w-8 animate-spin text-[#dd8b11]" />
                                        <p className="text-sm font-semibold text-foreground">Analyzing document with Gemini AI…</p>
                                        <p className="text-xs text-muted-foreground">Extracting complainant, respondent, case number, and form type…</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center space-y-3">
                                        <div className="p-3 bg-amber-500/10 rounded-full text-[#dd8b11]">
                                            <Upload className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">Click to upload or drag & drop scan file</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">Supports PDF, PNG, JPG, JPEG up to 10MB</p>
                                        </div>
                                        <Input
                                            type="file"
                                            accept=".pdf,.png,.jpg,.jpeg"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            id="scan-file-input"
                                        />
                                        <Button
                                            onClick={() => document.getElementById('scan-file-input')?.click()}
                                            className="bg-[#dd8b11] hover:bg-[#c47c0f] text-white h-9 text-xs font-semibold"
                                        >
                                            Select File from Device
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {scanError && (
                                <div className="p-3 bg-red-500/10 border border-red-200 text-red-700 dark:text-red-400 rounded-md text-xs font-medium">
                                    {scanError}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4 py-2">
                            <div className="p-3 bg-emerald-500/10 border border-emerald-200 text-emerald-800 dark:text-emerald-300 rounded-md text-xs font-semibold flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <BadgeCheck className="h-4 w-4 text-emerald-600" />
                                    <span>AI Analysis Complete! Please review extracted fields below:</span>
                                </div>
                                <Button variant="ghost" size="sm" onClick={resetModal} className="h-6 text-[10px] text-muted-foreground hover:text-foreground">
                                    Upload Different File
                                </Button>
                            </div>

                            {/* Optional Case Search/Linker */}
                            <div className="space-y-1.5 relative">
                                <Label htmlFor="case-search-input" className="text-xs font-semibold">Link to Existing Case (Optional)</Label>
                                <Input
                                    id="case-search-input"
                                    value={caseSearch}
                                    onChange={(e) => handleCaseSearch(e.target.value)}
                                    placeholder="Search by case number or party name..."
                                    className="h-9 text-xs"
                                />
                                {caseSuggestions.length > 0 && (
                                    <div className="absolute left-0 right-0 z-50 mt-1 max-h-40 overflow-y-auto bg-popover border rounded-md shadow-lg text-xs">
                                        {caseSuggestions.map((c) => (
                                            <div
                                                key={c.id}
                                                onClick={() => selectCase(c)}
                                                className="px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground border-b last:border-0"
                                            >
                                                <span className="font-semibold">{c.case_number}</span> - {c.title} ({c.nature_of_case})
                                            </div>
                                        ))}
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
            {/* Document Security Revision History Modal */}
            <DocumentVersionHistoryModal
                isOpen={!!historyDoc}
                onClose={() => setHistoryDoc(null)}
                documentId={historyDoc?.id ?? null}
                documentTitle={historyDoc?.title ?? ''}
                canEdit={canEdit}
            />
        </AppLayout>
    );
}
