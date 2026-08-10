import { Head, router, usePage } from '@inertiajs/react';
import {
    Download,
    Plus,
    Filter,
    X,
    MoreVertical,
    Eye,
    Edit,
    Archive,
    Printer,
    Search,
    MoreHorizontal,
    RefreshCcw,
    ChevronUp,
    ChevronDown,
    ArrowUpDown,
    Sparkles,
    Calendar,
    Folder,
    FileText,
    Paperclip,
    Upload,
    FilePlus,
    Edit3
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { EditCaseStatusDialog } from '@/components/cases/edit-case-status-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';

// Helper for debounce if not available
function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    return function (...args: any[]) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

interface DocumentItem {
    id: number;
    type: string;
    file_path?: string;
    status?: string;
    created_at?: string;
    creator?: { name: string };
}

interface Case {
    id: number;
    case_number: string;
    folder_name?: string;
    nature_of_case: string;
    description: string;
    status: string;
    date_filed: string;
    complainant?: string;
    respondent?: string;
    created_by?: number;
    creator?: { name: string };
    deleted_at?: string | null;
    documents_count?: number;
    documents?: DocumentItem[];
}

interface PaginationProps {
    data: Case[];
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
}

interface Props {
    cases: PaginationProps;
    filters: {
        search: string;
        status: string;
        nature: string;
        date?: string;
        month?: string;
        filter?: string;
        sort_by?: string;
        sort_order?: string;
    };
}

export default function CaseManagement({ cases, filters }: Props) {
    const { auth } = usePage<{ auth: { user: { role: string } } }>().props;
    const isAdmin = auth?.user?.role === 'Administrator' || auth?.user?.role === 'Admin';
    const canEdit = !isAdmin;

    const breadcrumbs = [
        {
            title: 'Case Management',
            href: '/cases',
        },
    ];

    const currentMonthNum = String(new Date().getMonth() + 1);
    const initialMonth = filters.month || (filters.filter === 'new_cases' ? 'latest' : 'all');

    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [nature, setNature] = useState(filters.nature || 'all');
    const [date, setDate] = useState(filters.date || '');
    const [month, setMonth] = useState(initialMonth);
    const [sortField, setSortField] = useState(filters.sort_by || (initialMonth !== 'all' ? 'date_filed' : 'created_at'));
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'desc');

    // Case Drawer & Edit Status state
    const [selectedCaseForDrawer, setSelectedCaseForDrawer] = useState<Case | null>(null);
    const [editingCaseForStatus, setEditingCaseForStatus] = useState<any>(null);

    // Debounced search
    const updateSearch = useCallback(
        debounce((value: string) => {
            router.get(
                '/cases',
                { search: value, status, nature, date, month, sort_by: sortField, sort_order: sortOrder },
                { preserveState: true, replace: true }
            );
        }, 300),
        [status, nature, date, month, sortField, sortOrder]
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        updateSearch(e.target.value);
    };

    const handleFilterChange = (key: string, value: string) => {
        if (key === 'status') setStatus(value);
        if (key === 'nature') setNature(value);
        if (key === 'date') setDate(value);
        if (key === 'month') setMonth(value);

        router.get(
            '/cases',
            {
                search,
                status: key === 'status' ? value : status,
                nature: key === 'nature' ? value : nature,
                date: key === 'date' ? value : date,
                month: key === 'month' ? value : month,
                sort_by: sortField,
                sort_order: sortOrder,
            },
            { preserveState: true, replace: true }
        );
    };

    const toggleSort = (field: string) => {
        const newOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(newOrder);

        router.get(
            '/cases',
            {
                search,
                status,
                nature,
                date,
                month,
                sort_by: field,
                sort_order: newOrder,
            },
            { preserveState: true, replace: true }
        );
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('all');
        setNature('all');
        setDate('');
        setMonth('all');
        router.get('/cases', {}, { preserveState: true, replace: true });
    };

    const getBadgeStyles = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'resolved':
            case 'settled':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
            case 'pending':
                return 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
            case 'mediation':
                return 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
            case 'certified':
            case 'escalated':
                return 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
            case 'dismissed':
                return 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
            default:
                return 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Case Management" />

            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 text-slate-900 dark:text-slate-100">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Case Management</h2>
                        <p className="text-muted-foreground">
                            View and manage all Lupon Tagapamayapa cases and document folders
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <Card className="rounded-lg border bg-card text-card-foreground shadow-sm">
                    <CardContent className="p-6 space-y-4">
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Search Cases / Folders
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search Case No., folder name (case-026)..."
                                        className="pl-8"
                                        value={search}
                                        onChange={handleSearchChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Filter by Month
                                </label>
                                <Select value={month} onValueChange={(val) => handleFilterChange('month', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Month" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Months (All Time)</SelectItem>
                                        <SelectItem value="latest">Latest Month ({new Date().toLocaleString('default', { month: 'long', year: 'numeric' })})</SelectItem>
                                        <SelectItem value="1">January 2026</SelectItem>
                                        <SelectItem value="2">February 2026</SelectItem>
                                        <SelectItem value="3">March 2026</SelectItem>
                                        <SelectItem value="4">April 2026</SelectItem>
                                        <SelectItem value="5">May 2026</SelectItem>
                                        <SelectItem value="6">June 2026</SelectItem>
                                        <SelectItem value="7">July 2026</SelectItem>
                                        <SelectItem value="8">August 2026</SelectItem>
                                        <SelectItem value="9">September 2026</SelectItem>
                                        <SelectItem value="10">October 2026</SelectItem>
                                        <SelectItem value="11">November 2026</SelectItem>
                                        <SelectItem value="12">December 2026</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Status
                                </label>
                                <Select value={status} onValueChange={(val) => handleFilterChange('status', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="Mediation">Mediation</SelectItem>
                                        <SelectItem value="Conciliation">Conciliation</SelectItem>
                                        <SelectItem value="Arbitration">Arbitration</SelectItem>
                                        <SelectItem value="Resolved">Resolved / Settled</SelectItem>
                                        <SelectItem value="Escalated">Escalated (Referred to Court)</SelectItem>
                                        <SelectItem value="Dismissed">Dismissed</SelectItem>
                                        <SelectItem value="Certified">Certified</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Case Type
                                </label>
                                <Select value={nature} onValueChange={(val) => handleFilterChange('nature', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="Complaint">Complaint Form (KP Form 7)</SelectItem>
                                        <SelectItem value="Summons">Summons (KP Form 9)</SelectItem>
                                        <SelectItem value="Amicable Settlement">Amicable Settlement (KP Form 16)</SelectItem>
                                        <SelectItem value="Withdrawal">Affidavit of Withdrawal</SelectItem>
                                        <SelectItem value="Conciliation">Notice of Hearing (Conciliation)</SelectItem>
                                        <SelectItem value="Mediation">Notice of Hearing (Mediation)</SelectItem>
                                        <SelectItem value="Failure">Notice of Hearing (Failure to Appear)</SelectItem>
                                        <SelectItem value="Counterclaim">Notice of Hearing (Counterclaim)</SelectItem>
                                        <SelectItem value="Court">Certificate to File Action (Court)</SelectItem>
                                        <SelectItem value="Bar Action">Certificate to Bar Action</SelectItem>
                                        <SelectItem value="Bar Counterclaim">Certificate to Bar Counterclaim</SelectItem>
                                        <SelectItem value="Execution">Motion for Execution</SelectItem>
                                        <SelectItem value="Return">Officers Return</SelectItem>
                                        <SelectItem value="Demand">Letter of Demand</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Date Filed
                                </label>
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => handleFilterChange('date', e.target.value)}
                                    className={date ? "w-full" : "w-full text-muted-foreground"}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="h-8 text-muted-foreground" onClick={clearFilters}>
                                <X className="mr-2 h-3 w-3" />
                                Clear Filters
                            </Button>
                            <div className="ml-auto text-sm text-muted-foreground">
                                Showing <span className="font-medium">{cases.from || 0}-{cases.to || 0}</span> of {cases.total} cases
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <div className="rounded-md border bg-card shadow-sm">
                    <div className="p-4 flex items-center justify-end border-b">
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" onClick={() => router.visit('/cases/archive')}>
                                <Archive className="mr-2 h-4 w-4" />
                                View Archives
                            </Button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase border-b bg-slate-50/50 dark:bg-slate-900/50">
                                <tr>
                                    <th className="py-3 px-4 font-medium w-12 text-center">No.</th>
                                    <th 
                                        className="py-3 px-4 font-medium cursor-pointer hover:text-foreground"
                                        onClick={() => toggleSort('case_number')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Case Number
                                            {sortField === 'case_number' ? (
                                                sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                                            ) : (
                                                <ArrowUpDown className="h-3 w-3 opacity-30" />
                                            )}
                                        </div>
                                    </th>
                                    <th className="py-3 px-4 font-medium">Folder ID</th>
                                    <th className="py-3 px-4 font-medium">Complainant vs. Respondent</th>
                                    <th className="py-3 px-4 font-medium">Case Type</th>
                                    <th className="py-3 px-4 font-medium">Date Filed</th>
                                    <th className="py-3 px-4 font-medium text-center">Documents</th>
                                    <th className="py-3 px-4 font-medium">Status</th>
                                    <th className="py-3 px-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {cases.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="p-8 text-center text-muted-foreground">
                                            No cases found.
                                        </td>
                                    </tr>
                                ) : (
                                    cases.data.map((item, index) => {
                                        const folderName = item.folder_name || `case-${String(item.id).padStart(3, '0')}`;
                                        const docCount = item.documents_count || (item.documents ? item.documents.length : 0);
                                        return (
                                            <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 border-b">
                                                <td className="py-3 px-4 text-center text-muted-foreground font-medium">
                                                    {cases.from + index}
                                                </td>
                                                <td className="py-3 px-4 font-medium text-[#1c2434] dark:text-white whitespace-nowrap">
                                                    {item.case_number}
                                                </td>
                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="h-7 text-xs font-semibold bg-amber-50 text-[#dd8b11] border-amber-300 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400 gap-1.5"
                                                        onClick={() => setSelectedCaseForDrawer(item)}
                                                    >
                                                        <Folder className="h-3.5 w-3.5" />
                                                        📁 {folderName}
                                                    </Button>
                                                </td>
                                                <td className="py-3 px-4 text-muted-foreground max-w-[220px]">
                                                    <div className="font-semibold text-foreground truncate">{item.complainant}</div>
                                                    <div className="text-xs text-muted-foreground/70">vs. {item.respondent}</div>
                                                </td>
                                                <td className="py-3 px-4 text-muted-foreground truncate max-w-[180px]" title={item.nature_of_case}>
                                                    {item.nature_of_case}
                                                </td>
                                                <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                                                    {new Date(item.date_filed).toLocaleDateString()}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="h-7 text-xs font-semibold text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 gap-1"
                                                        onClick={() => setSelectedCaseForDrawer(item)}
                                                    >
                                                        <FileText className="h-3.5 w-3.5 text-[#dd8b11]" />
                                                        {docCount} File{docCount !== 1 ? 's' : ''}
                                                    </Button>
                                                </td>
                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    <Badge variant="outline" className={`font-normal rounded-full ${getBadgeStyles(item.status)}`}>
                                                        {item.status}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            title="Update Case Status" 
                                                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                                                            onClick={() => setEditingCaseForStatus(item)}
                                                        >
                                                            <Edit3 className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" title="View Case Details" onClick={() => window.open(`/documents/view-case/${item.id}`, '_blank')}>
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        {!isAdmin && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                title="Archive Case"
                                                                className="text-amber-500 hover:text-amber-700 hover:bg-amber-50"
                                                                onClick={() => {
                                                                    if (confirm(`Archive case ${item.case_number}? It will be moved to the archive.`)) {
                                                                        router.post(`/cases/${item.id}/archive`, {}, { preserveState: false });
                                                                    }
                                                                }}
                                                            >
                                                                <Archive className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        {item.creator && (
                                                            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800" title={`Encoded by: ${item.creator.name}`}>
                                                                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                                                    {item.creator.name.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Links */}
                    <div className="flex items-center justify-between px-4 py-4 border-t">
                        <div className="text-sm text-muted-foreground">
                            Showing {cases.from || 0} to {cases.to || 0} of {cases.total} results
                        </div>
                        <div className="flex items-center space-x-2">
                            {cases.links.map((link, i) => (
                                <Button
                                    key={i}
                                    variant={link.active ? "default" : "outline"}
                                    size="sm"
                                    className={`h-8 min-w-[32px] px-2 ${link.active ? 'bg-[#1c2434] text-white' : ''}`}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.visit(link.url, { data: { search, status, nature, date, month, sort_by: sortField, sort_order: sortOrder }, preserveState: true })}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Case Document Folder Drawer / Modal */}
                <Dialog open={Boolean(selectedCaseForDrawer)} onOpenChange={(open) => !open && setSelectedCaseForDrawer(null)}>
                    <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-6">
                        {selectedCaseForDrawer && (
                            <>
                                <DialogHeader className="border-b pb-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
                                                <Folder className="h-6 w-6 text-[#dd8b11]" />
                                                📁 {selectedCaseForDrawer.folder_name || `case-${String(selectedCaseForDrawer.id).padStart(3, '0')}`}
                                            </DialogTitle>
                                            <DialogDescription className="text-xs mt-1">
                                                Case Document Folder for <strong className="text-foreground">{selectedCaseForDrawer.complainant} vs. {selectedCaseForDrawer.respondent}</strong> ({selectedCaseForDrawer.case_number})
                                            </DialogDescription>
                                        </div>
                                        <Badge variant="outline" className="bg-amber-500/10 text-[#dd8b11] border-amber-300 font-bold text-xs px-3 py-1">
                                            {selectedCaseForDrawer.documents?.length || 0} Documents
                                        </Badge>
                                    </div>
                                </DialogHeader>

                                {/* Action Buttons Toolbar */}
                                {canEdit && (
                                    <div className="flex items-center justify-between gap-3 bg-muted/40 p-3 rounded-lg border mt-3">
                                        <div className="text-xs font-semibold text-muted-foreground">
                                            Folder Actions:
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-8 text-xs font-semibold border-amber-400 text-[#dd8b11] hover:bg-amber-50"
                                                onClick={() => window.open(`/documents/new?case_id=${selectedCaseForDrawer.id}`, '_blank')}
                                            >
                                                <FilePlus className="mr-1.5 h-3.5 w-3.5" />
                                                Generate KP Form
                                            </Button>
                                            <Button 
                                                variant="default" 
                                                size="sm" 
                                                className="h-8 text-xs font-semibold bg-[#1c2434] text-white hover:bg-[#1c2434]/90"
                                                onClick={() => router.visit('/documents')}
                                            >
                                                <Upload className="mr-1.5 h-3.5 w-3.5" />
                                                Upload File
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Documents List Tree */}
                                <div className="mt-4 space-y-2">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Folder Contents:</h4>
                                    
                                    {!selectedCaseForDrawer.documents || selectedCaseForDrawer.documents.length === 0 ? (
                                        <div className="p-8 text-center border-2 border-dashed rounded-lg bg-muted/20 text-muted-foreground">
                                            <Folder className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                                            <p className="text-sm font-medium">No documents inside this case folder yet.</p>
                                            <p className="text-xs text-muted-foreground/70 mt-0.5">Click "Generate KP Form" or "Upload File" to add documents.</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y border rounded-lg overflow-hidden bg-card">
                                            {selectedCaseForDrawer.documents.map((doc) => (
                                                <div key={doc.id} className="p-3 flex items-center justify-between hover:bg-muted/40 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-lg bg-amber-500/10 text-[#dd8b11]">
                                                            <FileText className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-foreground capitalize">
                                                                📄 {doc.type.replace(/_/g, ' ')}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                                                                <span>Added: {doc.created_at || 'Recently'}</span>
                                                                {doc.creator && <span>• By: {doc.creator.name}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className="h-8 text-xs font-semibold"
                                                            onClick={() => window.open(doc.file_path || `/documents/view/${doc.id}`, '_blank')}
                                                        >
                                                            <Eye className="mr-1.5 h-3.5 w-3.5" />
                                                            Open File
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Edit Case Status Modal */}
                <EditCaseStatusDialog
                    caseItem={editingCaseForStatus}
                    open={Boolean(editingCaseForStatus)}
                    onOpenChange={(open) => !open && setEditingCaseForStatus(null)}
                />
            </div>
        </AppLayout>
    );
}
