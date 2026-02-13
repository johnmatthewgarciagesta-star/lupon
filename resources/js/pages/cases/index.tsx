import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
    Search
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
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
    title: string;
    nature_of_case: string;
    complainant: string;
    respondent: string;
    status: string;
    date_filed: string;
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
    };
}

export default function CaseManagement({ cases, filters }: Props) {
    const breadcrumbs = [
        {
            title: 'Case Management',
            href: '/cases',
        },
    ];

    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [nature, setNature] = useState(filters.nature || 'all');

    // Debounced search
    const updateSearch = useCallback(
        debounce((value: string) => {
            router.get(
                '/cases',
                { search: value, status, nature },
                { preserveState: true, replace: true }
            );
        }, 300),
        [status, nature]
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        updateSearch(e.target.value);
    };

    const handleFilterChange = (key: string, value: string) => {
        if (key === 'status') setStatus(value);
        if (key === 'nature') setNature(value);

        router.get(
            '/cases',
            {
                search,
                status: key === 'status' ? value : status,
                nature: key === 'nature' ? value : nature,
            },
            { preserveState: true, replace: true }
        );
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('all');
        setNature('all');
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
        switch (status) {
            case 'Resolved':
                return 'bg-slate-200 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 border-0';
            case 'Pending':
                return 'bg-slate-100 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
            case 'Mediation':
                return 'bg-slate-200 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 border-0';
            default:
                // Fallback for custom statuses
                return 'bg-slate-100 text-slate-600 hover:bg-slate-100 border border-slate-200';
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
                        <div className="grid gap-4 md:grid-cols-3">
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
                                        <SelectItem value="property">Property Dispute</SelectItem>
                                        <SelectItem value="noise">Noise Complaint</SelectItem>
                                        <SelectItem value="money">Debt Collection</SelectItem>
                                        <SelectItem value="family">Family Dispute</SelectItem>
                                    </SelectContent>
                                </Select>
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
                    <div className="p-4 flex items-center justify-between border-b">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="select-all" />
                            <label
                                htmlFor="select-all"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Select All
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                                <Archive className="mr-2 h-4 w-4" />
                                Archive
                            </Button>
                            <Button variant="outline" size="sm">
                                <Printer className="mr-2 h-4 w-4" />
                                Print
                            </Button>
                        </div>
                    </div>

                    {/* Note: In a real app we'd use the shadcn/ui Table component. 
                        For now, since I don't see table.tsx in the file list, I'll assume standard HTML table or if it exists I'd use it.
                        The plan mentioned table.tsx might be missing. I'll use standard tailwind table structure if I can't find it,
                        but I'll try to use the imported components if they work, otherwise standard HTML.
                        Wait, I imported Table components, let me use them.
                    */}

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase border-b bg-slate-50/50 dark:bg-slate-900/50">
                                <tr>
                                    <th className="p-4 w-[50px]">
                                        <Checkbox />
                                    </th>
                                    <th className="py-3 px-4 font-medium">Case Number</th>
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
                                    cases.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                            <td className="p-4">
                                                <Checkbox />
                                            </td>
                                            <td className="py-3 px-4 font-medium text-[#1c2434] dark:text-white">{item.case_number}</td>
                                            <td className="py-3 px-4 text-muted-foreground">{item.nature_of_case}</td>
                                            <td className="py-3 px-4 text-muted-foreground">{item.complainant}</td>
                                            <td className="py-3 px-4 text-muted-foreground">{item.respondent}</td>
                                            <td className="py-3 px-4 text-muted-foreground">
                                                {new Date(item.date_filed).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge variant="outline" className={`font - normal rounded - full ${getBadgeStyles(item.status)} `}>
                                                    {item.status}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-[#1c2434]"
                                                        onClick={() => router.visit(`/ documents / view / ${item.id} `)} title="View/Edit Case">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-[#1c2434]">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-[#1c2434]">
                                                        <MoreVertical className="h-4 w-4" />
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
                                    onClick={() => link.url && router.visit(link.url, { data: { search, status, nature }, preserveState: true })}
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
