import { Head } from '@inertiajs/react';
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
    File as FileIcon
} from 'lucide-react';
import { useState } from 'react';
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
    const breadcrumbs = [
        {
            title: 'Reports',
            href: '/system-reports',
        },
    ];

    const [reportType, setReportType] = useState('summary');
    const [isGenerating, setIsGenerating] = useState(false);
    const [searchCaseNo, setSearchCaseNo] = useState('');

    const handleGenerate = () => {
        setIsGenerating(true);
        // Use window.location for file download
        window.location.href = `/reports/generate?type=${reportType}`;
        // Reset loading state after a short delay (since download doesn't trigger page load)
        setTimeout(() => setIsGenerating(false), 3000);
    };

    const handleSearch = () => {
        if (!searchCaseNo) return;
        window.open(`/documents/view/${encodeURIComponent(searchCaseNo)}`, '_blank');
    };

    const quickReports = [
        {
            title: 'Monthly Summary',
            value: stats.cases_this_month,
            label: 'Cases This Month',
            description: 'New cases filed this month',
            icon: FileText,
        },
        {
            title: 'Pending Cases',
            value: stats.pending_cases,
            label: 'Pending',
            description: 'Cases currently active',
            icon: Clock,
        },
        {
            title: 'Resolved Cases',
            value: stats.resolved_cases,
            label: 'Resolved',
            description: 'Cases settled or dismissed',
            icon: CheckCircle,
        },
        {
            title: 'Total Cases',
            value: stats.total_cases,
            label: 'Total',
            description: 'All cases in the system',
            icon: Users,
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
                        <Card key={report.title}>
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
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <Select value={reportType} onValueChange={setReportType}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="summary">Case Summary</SelectItem>
                                            <SelectItem value="nature">Nature of Cases</SelectItem>
                                            <SelectItem value="status">Status Report</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    className="bg-[#1c2434] hover:bg-[#2c3a4f] text-white">
                                    {isGenerating ? (
                                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    ) : (
                                        <FileText className="mr-2 h-4 w-4" />
                                    )}
                                    Generate PDF
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Case Lookup */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Look Up Case Document</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Enter Case No. (e.g. 2024-001)"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={searchCaseNo}
                                        onChange={(e) => setSearchCaseNo(e.target.value)}
                                    />
                                </div>
                                <Button
                                    onClick={handleSearch}
                                    disabled={!searchCaseNo}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                    <CheckCircle className="mr-2 h-4 w-4" /> {/* Using CheckCircle as generic icon or Search if available */}
                                    View
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Cases List */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Cases</CardTitle>
                        <Button variant="link" className="text-xs h-auto p-0 text-muted-foreground">View All &gt;</Button>
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
                                                    <Badge variant={item.status === 'Pending' ? 'secondary' : 'outline'}
                                                        className={item.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}>
                                                        {item.status}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 text-muted-foreground">{item.date_filed}</td>
                                                <td className="py-4 text-right">
                                                    <a href={`/documents/view/${item.id}`} target="_blank" className="inline-flex items-center justify-center p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="View Document">
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
            </div >
        </AppLayout >
    );
}
