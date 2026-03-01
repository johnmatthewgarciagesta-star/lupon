import { Head, router } from '@inertiajs/react';
import {
    Eye,
    RefreshCcw,
    Search,
    X,
    FolderClock
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';

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
        date: string;
    };
}

export default function ArchiveManagement({ cases, filters }: Props) {
    const breadcrumbs = [
        {
            title: 'Case Management',
            href: '/cases',
        },
        {
            title: 'Archives',
            href: '/cases/archive',
        },
    ];

    const [search, setSearch] = useState(filters.search || '');
    const [date, setDate] = useState(filters.date || '');

    const updateSearch = useCallback(
        debounce((searchValue: string, dateValue: string) => {
            router.get(
                '/cases/archive',
                { search: searchValue, date: dateValue },
                { preserveState: true, replace: true }
            );
        }, 300),
        []
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        updateSearch(e.target.value, date);
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDate(e.target.value);
        router.get(
            '/cases/archive',
            { search, date: e.target.value },
            { preserveState: true, replace: true }
        );
    };

    const clearFilters = () => {
        setSearch('');
        setDate('');
        router.get('/cases/archive', {}, { preserveState: true, replace: true });
    };

    const getBadgeStyles = (status: string) => {
        return 'bg-slate-200 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 border-0';
    };

    const restoreCase = (caseItem: Case) => {
        if (confirm('Are you sure you want to restore this case?')) {
            alert("Restore functionality coming in Phase 2 (Audit Trail)");
            // Once backend is ready: router.post(`/cases/${caseItem.id}/restore`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Archived Cases" />

            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 text-slate-900 dark:text-slate-100">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Archived Cases</h2>
                        <p className="text-muted-foreground">
                            View all past or deleted records
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <Card className="rounded-lg border bg-card text-card-foreground shadow-sm">
                    <CardContent className="p-6 space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">
                                    Search Archives
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search cases..."
                                        className="pl-8"
                                        value={search}
                                        onChange={handleSearchChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">
                                    Filter by Document File Date
                                </label>
                                <div className="relative">
                                    <Input
                                        type="date"
                                        value={date}
                                        onChange={handleDateChange}
                                    />
                                </div>
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
                        <Button variant="outline" size="sm" onClick={() => router.visit('/cases')}>
                            Back to Cases
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase border-b bg-slate-50/50 dark:bg-slate-900/50">
                                <tr>
                                    <th className="py-3 px-4 font-medium">Archived Date</th>
                                    <th className="py-3 px-4 font-medium">Case Number</th>
                                    <th className="py-3 px-4 font-medium">Case Type</th>
                                    <th className="py-3 px-4 font-medium">Complainant</th>
                                    <th className="py-3 px-4 font-medium">Respondent</th>
                                    <th className="py-3 px-4 font-medium">Date Filed</th>
                                    <th className="py-3 px-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {cases.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                <FolderClock className="h-8 w-8 text-muted-foreground/50" />
                                                <span>No archived cases found.</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    cases.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                            <td className="py-3 px-4 text-muted-foreground">
                                                {item.deleted_at ? new Date(item.deleted_at).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="py-3 px-4 font-medium text-[#1c2434] dark:text-white">{item.case_number}</td>
                                            <td className="py-3 px-4 text-muted-foreground">{item.nature_of_case}</td>
                                            <td className="py-3 px-4 text-muted-foreground">{item.complainant}</td>
                                            <td className="py-3 px-4 text-muted-foreground">{item.respondent}</td>
                                            <td className="py-3 px-4 text-muted-foreground">
                                                {new Date(item.date_filed).toLocaleDateString()}
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2 justify-end">
                                                    <Button variant="ghost" size="icon" title="View Details" onClick={() => router.visit(`/documents/view-case/${item.id}`)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" title="Restore Case" onClick={() => restoreCase(item)} className="text-green-500 hover:text-green-700">
                                                        <RefreshCcw className="h-4 w-4" />
                                                    </Button>
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
                                    onClick={() => link.url && router.visit(link.url, { data: { search, date }, preserveState: true })}
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
