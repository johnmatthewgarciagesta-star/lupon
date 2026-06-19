import { Head, Link, router, usePage } from '@inertiajs/react';
import { SharedData } from '@/types';
import {
    FileText, Bell, FileCheck, FileMinus, Search, Download, Eye, Plus,
    Scale, AlertTriangle, Gavel, Handshake, Calendar, BadgeCheck, X,
    FileSignature, ClipboardCheck, UserPlus, Send, History, Trash2,
    ClipboardList, Briefcase, ShieldAlert, BadgeInfo, Edit, Upload, Loader2
} from 'lucide-react';

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

    hiddenTemplates: string[];
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Documents({ documents, stats, customTemplates, hiddenTemplates }: DocumentsProps) {
    const { auth } = usePage<SharedData>().props;
    const canEdit = auth.user.role !== 'Administrator';

    // Search filters templates
    const [search, setSearch] = useState('');
    // Filter for recent docs table only
    const [docFilter, setDocFilter] = useState('all');

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
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            const res = await fetch('/documents/upload', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: formData
            });

            const result = await res.json();
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

    // Confirm and save final data to DB
    const handleSaveScanned = () => {
        if (!tempFilePath) return;

        setIsSaving(true);

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
            onError: (errors) => {
                setIsSaving(false);
                alert(Object.values(errors).join('\n') || 'Failed to save scanned document.');
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

            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">

                {/* ── Page Header ── */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

                {/* ── Stats ── */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[
                        { label: 'Total Documents', value: stats.total, sub: 'Total generated forms', icon: <FileText className="h-4 w-4 text-muted-foreground" /> },
                        { label: 'Summons Issued', value: stats.summons, sub: 'Official summons generated', icon: <Bell className="h-4 w-4 text-muted-foreground" /> },
                        { label: 'Settlements', value: stats.settlements, sub: 'Agreements & awards', icon: <FileCheck className="h-4 w-4 text-muted-foreground" /> },
                        { label: 'Recent Documents', value: stats.recent, sub: 'Latest system activity', icon: <History className="h-4 w-4 text-muted-foreground" /> },
                    ].map(s => (
                        <Card key={s.label}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
                                {s.icon}
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{s.value}</div>
                                <p className="text-xs text-muted-foreground">{s.sub}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* ── Document Templates ── */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                                <CardTitle>Document Templates</CardTitle>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    {search
                                        ? `${filteredTemplates.length} of ${allAvailableTemplates.length} templates matching "${search}"`
                                        : `Choose from all ${allAvailableTemplates.length} official Lupon forms`}
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
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
                                    return (
                                        <div
                                            key={template.isCustom ? `custom-${template.id}` : template.type}
                                            onClick={() => {
                                                if (!canEdit) {
                                                    // Administrator role: redirect to Case Management with the specific filter
                                                    const natureFilter = template.isCustom ? template.title : template.description;
                                                    router.visit(`/cases?nature=${encodeURIComponent(natureFilter)}`);
                                                } else {
                                                    // Encoder role: open fill-out form (or view if non-editable) in new tab
                                                    if (template.isEditable === false || (template.isCustom && (template as any).content?.is_view_only)) {
                                                        const pdfUrl = template.isCustom 
                                                            ? `/storage/${(template as any).file_path}`
                                                            : `/forms/${template.type}.pdf`;
                                                        window.open(pdfUrl, '_blank');
                                                    } else {
                                                        window.open(fillHref, '_blank');
                                                    }
                                                }
                                            }}
                                            className="flex items-start space-x-4 p-4 rounded-lg border bg-card hover:border-[#dd8b11]/30 hover:bg-[#dd8b11]/5 dark:hover:bg-[#dd8b11]/10 transition-all group cursor-pointer relative shadow-sm hover:shadow-md"
                                        >
                                            <div className="p-2 bg-[#dd8b11] rounded-lg mt-1 flex-shrink-0 group-hover:bg-[#cb7d0f] transition-colors">
                                                <template.icon className="h-4 w-4 text-white dark:text-black stroke-[2]" />
                                            </div>
                                            <div className="flex-1 space-y-1 pr-6">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-semibold leading-none group-hover:text-[#dd8b11] transition-colors">{template.title}</p>
                                                    {(template.isEditable === false || (template.isCustom && (template as any).content?.is_view_only)) && (
                                                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground whitespace-nowrap">View Only</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
                                            </div>

                                            {canEdit && (
                                                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (template.isEditable === false || (template.isCustom && (template as any).content?.is_view_only)) {
                                                                const pdfUrl = template.isCustom 
                                                                    ? `/storage/${(template as any).file_path}`
                                                                    : `/forms/${template.type}.pdf`;
                                                                window.open(pdfUrl, '_blank');
                                                            } else {
                                                                window.open(fillHref, '_blank');
                                                            }
                                                        }}
                                                        className="inline-flex items-center justify-center rounded bg-[#dd8b11] text-white px-2.5 py-1 text-[10px] font-semibold tracking-wide hover:bg-[#c47c0f] transition-colors uppercase mr-1"
                                                        title={template.isEditable === false || (template.isCustom && (template as any).content?.is_view_only) ? "View Template" : "Fill Out Form"}
                                                    >
                                                        {template.isEditable === false || (template.isCustom && (template as any).content?.is_view_only) ? "View" : "Fill Out"}
                                                    </button>
                                                    {!(template.isEditable === false || (template.isCustom && (template as any).content?.is_view_only)) && (
                                                        <a
                                                            href={editHref}
                                                            onClick={e => e.stopPropagation()}
                                                            className="inline-flex items-center justify-center rounded-full h-7 w-7 text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
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
                                                        className="inline-flex items-center justify-center rounded-full h-7 w-7 text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
                                                        title="Delete Template"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ── Recent Documents ── */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
                        <div>
                            <CardTitle>Recent Documents</CardTitle>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Documents generated or uploaded via this system
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <select
                                id="doc-filter-type"
                                value={docFilter}
                                onChange={e => setDocFilter(e.target.value)}
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring max-w-[200px]"
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
                                    className="h-9 text-xs"
                                    onClick={() => setDocFilter('all')}
                                >
                                    <X className="h-3 w-3 mr-1" /> Clear
                                </Button>
                            )}
                            {canEdit && (
                                <Link href="/documents/new">
                                    <Button className="h-9 bg-[#dd8b11] hover:bg-[#c47c0f] text-white">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Document
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
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
                                            <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
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
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-xs">{getTemplateTitle(doc.type)}</span>
                                                            <span className="text-[10px] text-muted-foreground uppercase opacity-70">
                                                                {doc.type.replace(/_/g, ' ')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                                                    {doc.case_number ?? '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {doc.creator ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#dd8b11] flex-shrink-0">
                                                                <span className="text-[10px] font-medium text-white dark:text-black">
                                                                    {doc.creator.name.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <span className="text-sm">{doc.creator.name}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge variant="outline">{doc.status}</Badge>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground text-sm">
                                                    {doc.date ? new Date(doc.date).toLocaleDateString() : '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-2">
                                                        <a
                                                            href={`/documents/view/${doc.id}`}
                                                            target="_blank"
                                                            title="View Document"
                                                            className="inline-flex items-center justify-center rounded-md h-9 w-9 hover:bg-[#dd8b11] transition-colors text-muted-foreground hover:text-white"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </a>
                                                        <button
                                                            disabled
                                                            title="Download (coming soon)"
                                                            className="inline-flex items-center justify-center rounded-md h-9 w-9 text-muted-foreground/30 cursor-not-allowed"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </button>
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

                    {/* Step 1: Upload File or Show Spinner */}
                    {!tempFilePath && !isScanning && (
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-lg p-8 hover:bg-muted/30 transition-colors cursor-pointer relative min-h-[200px]">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <Upload className="h-10 w-10 text-muted-foreground/60 mb-4" />
                            <p className="text-sm font-semibold mb-1">Click to upload scanned image</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG, or JPEG up to 15MB</p>
                            {scanError && (
                                <p className="text-xs text-red-500 mt-4 text-center bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-md border border-red-200 dark:border-red-900/30">
                                    {scanError}
                                </p>
                            )}
                        </div>
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

                            {/* Link to Existing Case (Optional) */}
                            <div className="space-y-1.5 relative">
                                <Label htmlFor="case-link" className="text-xs font-semibold">Link to Existing Case (Optional)</Label>
                                <Input
                                    id="case-link"
                                    placeholder="Search case no. or title..."
                                    value={caseSearch}
                                    onChange={(e) => handleCaseSearch(e.target.value)}
                                    className="h-9 text-xs"
                                />
                                {caseId && (
                                    <button 
                                        onClick={() => { setCaseId(null); setCaseSearch(''); }}
                                        className="absolute right-2 top-8 text-xs text-red-500 hover:underline"
                                    >
                                        Unlink
                                    </button>
                                )}
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
                                        onChange={(e) => setDocType(e.target.value)}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    >
                                        <option value="complaint">Complaint Form (KP Form 7)</option>
                                        <option value="summons">Summons (KP Form 9)</option>
                                        <option value="amicable_settlement">Amicable Settlement (KP Form 16)</option>
                                        <option value="affidavit_withdrawal">Affidavit of Withdrawal</option>
                                        <option value="other">Other Scanned Document</option>
                                    </select>
                                </div>

                                {/* Case Number */}
                                <div className="space-y-1.5 col-span-2">
                                    <Label htmlFor="case-number" className="text-xs font-semibold">Case Number</Label>
                                    <Input
                                        id="case-number"
                                        value={caseNo}
                                        onChange={(e) => setCaseNo(e.target.value)}
                                        className="h-9 text-xs"
                                        required
                                    />
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
                                    <Input
                                        id="nature-of-case"
                                        value={natureOfCase}
                                        onChange={(e) => setNatureOfCase(e.target.value)}
                                        className="h-9 text-xs"
                                        required
                                    />
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
                                    disabled={isSaving || !complainant || !respondent}
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

            </div>
        </AppLayout>
    );
}
