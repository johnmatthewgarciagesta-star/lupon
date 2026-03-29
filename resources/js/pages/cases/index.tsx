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
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
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
import AppLayout from '@/layouts/app-layout';
// import { debounce } from 'lodash'; // Using helper or manual debounce

// Helper for debounce if not available
function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    return function (...args: any[]) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

interface Case {
    id: number;
    case_number: string;
    nature_of_case: string;
    description: string;
    status: string;
    date_filed: string;
    complainant?: string;
    respondent?: string;
    created_by?: number;
    creator?: { name: string };
    deleted_at?: string | null;
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
        sort_by?: string;
        sort_order?: string;
    };
}

export default function CaseManagement({ cases, filters }: Props) {
    const { auth } = usePage<{ auth: { user: { role: string } } }>().props;
    const isAdmin = auth?.user?.role === 'Administrator';

    const breadcrumbs = [
        {
            title: 'Case Management',
            href: '/cases',
        },
    ];

    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [nature, setNature] = useState(filters.nature || 'all');
    const [date, setDate] = useState(filters.date || '');
    const [sortField, setSortField] = useState(filters.sort_by || 'created_at');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'desc');

    // Debounced search
    const updateSearch = useCallback(
        debounce((value: string) => {
            router.get(
                '/cases',
                { search: value, status, nature, date, sort_by: sortField, sort_order: sortOrder },
                { preserveState: true, replace: true }
            );
        }, 300),
        [status, nature, date, sortField, sortOrder]
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        updateSearch(e.target.value);
    };

    const handleFilterChange = (key: string, value: string) => {
        if (key === 'status') setStatus(value);
        if (key === 'nature') setNature(value);
        if (key === 'date') setDate(value);

        router.get(
            '/cases',
            {
                search,
                status: key === 'status' ? value : status,
                nature: key === 'nature' ? value : nature,
                date: key === 'date' ? value : date,
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
        router.get('/cases', {}, { preserveState: true, replace: true });
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Resolved':
                return 'secondary';
            case 'Pending':
                return 'outline';
            case 'Mediation':
                return 'secondary';
            default:
                return 'default';
        }
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
                return 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
            case 'dismissed':
                return 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
            default:
                return 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
        }
    };

    const restoreCase = (caseItem: Case) => {
        if (confirm('Are you sure you want to restore this case?')) {
            alert("Restore functionality coming in Phase 2 (Audit Trail)");
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
                            View and manage all Lupon Tagapamayapa cases
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">

                    </div>
                </div>

                {/* Filters */}
                <Card className="rounded-lg border bg-card text-card-foreground shadow-sm">
                    <CardContent className="p-6 space-y-4">
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Search Cases
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by case number, name, or type..."
                                        className="pl-8"
                                        value={search}
                                        onChange={handleSearchChange}
                                    />
                                </div>
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
                                        <SelectItem value="Resolved">Resolved</SelectItem>
                                        <SelectItem value="Mediation">Mediation</SelectItem>
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
                            {/* <Button variant="outline" size="sm" className="h-8">
                                <Filter className="mr-2 h-3 w-3" />
                                More Filters
                            </Button> */}
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
                                    <th className="py-3 px-4 font-medium">Case Type</th>
                                    <th className="py-3 px-4 font-medium">Complainant</th>
                                    <th className="py-3 px-4 font-medium">Respondent</th>
                                    <th className="py-3 px-4 font-medium">Date Filed</th>
                                    <th className="py-3 px-4 font-medium">Status</th>
                                    <th className="py-3 px-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {cases.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="p-8 text-center text-muted-foreground">
                                            No cases found.
                                        </td>
                                    </tr>
                                ) : (
                                    cases.data.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 border-b">
                                            <td className="py-3 px-4 text-center text-muted-foreground font-medium">
                                                {cases.from + index}
                                            </td>
                                            <td className="py-3 px-4 font-medium text-[#1c2434] dark:text-white">
                                                <div className="flex items-center gap-2">
                                                    {item.case_number}
                                                </div>
                                            </td>
                                            {/* OWASP TOP 10 PROTECTION EXPLANATION: */}
                                            {/* 4. Cross-Site Scripting / XSS (OWASP #3) - Pinipigilan nito ang pag-inject ng malisyosong JavaScript code galing sa mga hacker. */}
                                            {/* Sa paggamit natin ng React (JSX), ang mga variables sa loob ng curly braces tulad ng {item.nature_of_case} at {item.complainant} */}
                                            {/* ay awtomatikong naco-convert bilang ordinaryong text kaya hindi ito tatakbo bilang mapanganib na code sa ating browser. */}
                                            <td className="py-3 px-4 text-muted-foreground truncate max-w-[200px]" title={item.nature_of_case}>
                                                {item.nature_of_case}
                                            </td>
                                            <td className="py-3 px-4 text-muted-foreground">{item.complainant}</td>
                                            <td className="py-3 px-4 text-muted-foreground">{item.respondent}</td>
                                            <td className="py-3 px-4 text-muted-foreground">
                                                {new Date(item.date_filed).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge variant="outline" className={`font-normal rounded-full ${getBadgeStyles(item.status)}`}>
                                                    {item.status}
                                                </Badge>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="icon" title="View Details" onClick={() => window.open(`/documents/view-case/${item.id}`, '_blank')}>
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
                                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800" title={`Encoded by: ${item.creator.name}`}>
                                                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                                                {item.creator.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
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
                                    onClick={() => link.url && router.visit(link.url, { data: { search, status, nature, date, sort_by: sortField, sort_order: sortOrder }, preserveState: true })}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
