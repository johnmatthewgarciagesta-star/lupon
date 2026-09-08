import { Head, router } from '@inertiajs/react';
import {
    FileText,
    Download,
    Calendar,
    Eye,
    Share2,
    Save,
    Play,
    PieChart,
    Clock,
    CheckCircle,
    Users,
    FileSpreadsheet,
    File as FileIcon,
    Search,
    Loader2,
    Edit3,
    AlertCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLiveSync } from '@/hooks/use-live-sync';
import { EditCaseStatusDialog } from '@/components/cases/edit-case-status-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';

const quickReports = [
    {
        title: 'Monthly Summary',
        description: 'Comprehensive monthly case statistics and trends',
        icon: FileText,
    },
    {
        title: 'Case Type Analysis',
        description: 'Breakdown of cases by type and category',
        icon: PieChart,
    },
    {
        title: 'Resolution Time',
        description: 'Average time to resolve cases by type',
        icon: Clock,
    },
    {
        title: 'Outcome Report',
        description: 'Analysis of case outcomes and settlements',
        icon: CheckCircle,
    },
    {
        title: 'Parties Report',
        description: 'List of parties involved in cases',
        icon: Users,
    },
    {
        title: 'Annual Report',
        description: 'Comprehensive yearly statistics and trends',
        icon: Calendar,
    },
];

const recentReports = [
    {
        id: 1,
        name: 'December 2024 Summary',
        type: 'Monthly Summary',
        generated: 'Jan 2, 2025',
        format: 'PDF',
        size: '2.4 MB',
        icon: FileText,
    },
    {
        id: 2,
        name: 'Q4 2024 Case Analysis',
        type: 'Case Type Analysis',
        generated: 'Dec 28, 2024',
        format: 'Excel',
        size: '1.8 MB',
        icon: Clock,
    },
    {
        id: 3,
        name: '2024 Annual Report',
        type: 'Annual Report',
        generated: 'Dec 20, 2024',
        format: 'PDF',
        size: '5.2 MB',
        icon: Calendar,
    },
    {
        id: 4,
        name: 'Resolution Time Analysis',
        type: 'Resolution Time',
        generated: 'Dec 15, 2024',
        format: 'PDF',
        size: '1.2 MB',
        icon: Clock,
    },
    {
        id: 5,
        name: 'November Outcomes',
        type: 'Outcome Report',
        generated: 'Dec 1, 2024',
        format: 'Excel',
        size: '980 KB',
        icon: CheckCircle,
    },
];

export default function Reports({ stats }: { stats: any }) {
    // Real-time background sync for reports statistics
    useLiveSync(5000, ['stats']);

    const breadcrumbs = [
        {
            title: 'Reports',
            href: '/system-reports',
        },
    ];

    const [reportType, setReportType] = useState('summary');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [matchingCount, setMatchingCount] = useState<number | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [searchCaseNo, setSearchCaseNo] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [editingCaseForStatus, setEditingCaseForStatus] = useState<any>(null);

    useEffect(() => {
        const checkMatching = async () => {
            try {
                let url = `/api/reports/check-count?`;
                if (startDate) url += `start_date=${encodeURIComponent(startDate)}&`;
                if (endDate) url += `end_date=${encodeURIComponent(endDate)}`;
                const res = await fetch(url);
                const data = await res.json();
                setMatchingCount(data.count);
            } catch (e) {
                console.error('Failed to check matching cases:', e);
            }
        };
        checkMatching();
    }, [startDate, endDate]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchCaseNo.trim()) {
                performSearch();
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchCaseNo]);

    const performSearch = async () => {
        setIsSearching(true);
        try {
            const response = await fetch(`/api/cases/lookup?search=${encodeURIComponent(searchCaseNo)}`);
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleGenerate = () => {
        setIsGenerating(true);
        // Use window.location for file download
        let url = `/reports/generate?type=${reportType}`;
        if (startDate) url += `&start_date=${startDate}`;
        if (endDate) url += `&end_date=${endDate}`;
        window.location.href = url;
        // Reset loading state after a short delay
        setTimeout(() => setIsGenerating(false), 3000);
    };


    const quickReports = [
        {
            title: 'Monthly Summary',
            value: stats.cases_this_month,
            label: 'Cases This Month',
            description: 'New cases filed this month',
            icon: FileText,
            url: '/cases',
        },
        {
            title: 'Pending Cases',
            value: stats.pending_cases,
            label: 'Pending',
            description: 'Cases currently active',
            icon: Clock,
            url: '/cases?status=Pending',
        },
        {
            title: 'Resolved Cases',
            value: stats.resolved_cases,
            label: 'Resolved',
            description: 'Cases settled or dismissed',
            icon: CheckCircle,
            url: '/cases?status=Resolved',
        },
        {
            title: 'Total Cases',
            value: stats.total_cases,
            label: 'Total',
            description: 'All cases in the system',
            icon: Users,
            url: '/cases',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports" />

            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 text-slate-900 dark:text-slate-100">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">System Reports</h2>
                        <p className="text-muted-foreground">
                            Overview of case statistics and activity
                        </p>
                    </div>
                </div>

                {/* Quick Info Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {quickReports.map((report) => (
                        <Card 
                            key={report.title}
                            className="cursor-pointer hover:bg-secondary/50 dark:hover:bg-secondary/80 transition-colors"
                            onClick={() => router.visit(report.url)}
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {report.title}
                                </CardTitle>
                                <report.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{report.value}</div>
                                <p className="text-xs text-muted-foreground">
                                    {report.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Report Generator */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Generate Report</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase text-muted-foreground">Report Type</label>
                                <Select value={reportType} onValueChange={setReportType}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="summary">Case Summary</SelectItem>
                                        <SelectItem value="nature">Nature of Cases</SelectItem>
                                        <SelectItem value="status">Status Report</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Start Date (Optional)</label>
                                    <input 
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">End Date (Optional)</label>
                                    <input 
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs"
                                    />
                                </div>
                            </div>

                            {matchingCount === 0 && (
                                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-amber-500/10 border border-amber-300 dark:border-amber-700/60 text-amber-800 dark:text-amber-300 text-xs font-semibold">
                                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                                    <span>No matching cases found for the selected period.</span>
                                </div>
                            )}

                            <Button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="w-full bg-[#1c2434] hover:bg-[#2c3a4f] text-white h-9 text-xs">
                                {isGenerating ? (
                                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                ) : (
                                    <FileText className="mr-2 h-4 w-4" />
                                )}
                                Generate PDF Report
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Case Lookup */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Search className="w-5 h-5 text-indigo-500" />
                                Look Up Case Document
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Enter Case No. or Title (e.g. 26-001)"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10"
                                    value={searchCaseNo}
                                    onChange={(e) => setSearchCaseNo(e.target.value)}
                                />
                                {isSearching && (
                                    <div className="absolute right-3 top-2.5">
                                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                    </div>
                                )}
                            </div>

                            {/* Search Results Display */}
                            <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar">
                                {searchResults.length > 0 ? (
                                    searchResults.map((item) => (
                                        <div 
                                            key={item.id} 
                                            className="flex items-center justify-between p-3 rounded-lg border bg-secondary/30 hover:bg-secondary/50 transition-colors group cursor-pointer"
                                            onClick={() => window.open(`/documents/view-case/${item.id}`, '_blank')}
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{item.case_number}</span>
                                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{item.title}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className="text-[10px] py-0 h-5 font-normal">
                                                    {item.status}
                                                </Badge>
                                                <div className="p-1.5 bg-white dark:bg-slate-800 rounded-full shadow-sm border group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
                                                    <Eye className="w-4 h-4 text-indigo-600" />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : searchCaseNo && !isSearching ? (
                                    <p className="text-xs text-center text-muted-foreground py-4 bg-secondary/10 rounded-lg border border-dashed">
                                        No matching cases found for "{searchCaseNo}"
                                    </p>
                                ) : !searchCaseNo ? (
                                    <p className="text-xs text-center text-muted-foreground py-4">
                                        Type a case number or title to see results
                                    </p>
                                ) : null}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Cases List */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Cases (Filed This Month)</CardTitle>
                        <Button variant="link" className="text-xs h-auto p-0 text-muted-foreground" onClick={() => router.visit('/cases')}>View All &gt;</Button>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground uppercase border-b bg-transparent">
                                    <tr>
                                        <th className="py-3 font-medium">Case No.</th>
                                        <th className="py-3 font-medium">Title</th>
                                        <th className="py-3 font-medium">Nature</th>
                                        <th className="py-3 font-medium">Status</th>
                                        <th className="py-3 font-medium">Date Filed</th>
                                        <th className="py-3 font-medium text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {stats.recent_cases.length > 0 ? (
                                        stats.recent_cases.map((item: any) => (
                                            <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                                <td className="py-4 font-medium">{item.case_number}</td>
                                                <td className="py-4 text-[#1c2434] dark:text-blue-400 font-medium">
                                                    {item.title}
                                                </td>
                                                <td className="py-4 text-muted-foreground">{item.nature}</td>
                                                <td className="py-4">
                                                    <Badge variant={item.is_archived ? 'outline' : (item.status === 'Pending' ? 'secondary' : 'outline')}
                                                        className={item.is_archived ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300' : (item.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700')}>
                                                        {item.status}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 text-muted-foreground">{item.date_filed}</td>
                                                <td className="py-4 text-right flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Update Case Status"
                                                        className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-full"
                                                        onClick={() => setEditingCaseForStatus(item)}
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </Button>
                                                    <a href={`/documents/view-case/${item.id}`} target="_blank" className="inline-flex items-center justify-center p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="View Document">
                                                        <Eye className="w-4 h-4" />
                                                    </a>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                                No cases found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Edit Case Status Modal */}
                <EditCaseStatusDialog
                    caseItem={editingCaseForStatus}
                    open={Boolean(editingCaseForStatus)}
                    onOpenChange={(open) => !open && setEditingCaseForStatus(null)}
                />
            </div >
        </AppLayout >
    );
}
