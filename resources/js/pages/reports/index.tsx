import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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

export default function Reports() {
    const breadcrumbs = [
        {
            title: 'Reports',
            href: '/system-reports',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports" />

            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 text-slate-900 dark:text-slate-100">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
                        <p className="text-muted-foreground">
                            Generate and manage system reports
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" className="h-9">
                            <Calendar className="mr-2 h-4 w-4" />
                            Schedule Report
                        </Button>
                        <Button className="h-9 bg-[#1c2434] hover:bg-[#2c3a4f] text-white">
                            <Download className="mr-2 h-4 w-4" />
                            Generate Report
                        </Button>
                    </div>
                </div>

                {/* Report Generator */}
                <Card>
                    <CardHeader>
                        <CardTitle>Report Generator</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Report Type
                                </label>
                                <Select defaultValue="summary">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="summary">Case Summary Report</SelectItem>
                                        <SelectItem value="analysis">Detailed Analysis</SelectItem>
                                        <SelectItem value="outcomes">Outcomes Report</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Date Range
                                </label>
                                <Select defaultValue="30">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Range" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="30">Last 30 Days</SelectItem>
                                        <SelectItem value="90">Last 3 Months</SelectItem>
                                        <SelectItem value="year">Last Year</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Case Status
                                </label>
                                <Select defaultValue="all">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Export Format
                                </label>
                                <Select defaultValue="pdf">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Format" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pdf">PDF Document</SelectItem>
                                        <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                                        <SelectItem value="csv">CSV File</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                            <Button className="bg-[#1c2434] hover:bg-[#2c3a4f] text-white">
                                <Play className="mr-2 h-4 w-4" />
                                Generate Report
                            </Button>
                            <Button variant="outline">
                                <Eye className="mr-2 h-4 w-4" />
                                Preview
                            </Button>
                            <Button variant="outline">
                                <Save className="mr-2 h-4 w-4" />
                                Save Template
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Reports Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {quickReports.map((report) => (
                        <div key={report.title} className="flex flex-col justify-between p-6 rounded-lg border bg-card text-card-foreground shadow-sm relative overflow-hidden">
                            <div className="absolute top-4 right-4">
                                <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-normal text-[10px] hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400">
                                    Quick
                                </Badge>
                            </div>
                            <div className="space-y-4">
                                <div className="p-2 bg-slate-100 rounded-lg dark:bg-slate-800 w-fit">
                                    <report.icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold leading-none tracking-tight">{report.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                                </div>
                                <Button variant="outline" className="w-full">
                                    Generate
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Reports List */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Reports</CardTitle>
                        <Button variant="link" className="text-xs h-auto p-0 text-muted-foreground">View All &gt;</Button>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground uppercase border-b bg-transparent">
                                    <tr>
                                        <th className="py-3 font-medium">Report Name</th>
                                        <th className="py-3 font-medium">Type</th>
                                        <th className="py-3 font-medium">Generated</th>
                                        <th className="py-3 font-medium">Format</th>
                                        <th className="py-3 font-medium">Size</th>
                                        <th className="py-3 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {recentReports.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                            <td className="py-4 font-medium text-[#1c2434] dark:text-white flex items-center gap-3">
                                                <div className="p-1.5 bg-slate-100 rounded dark:bg-slate-800">
                                                    <item.icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                                </div>
                                                {item.name}
                                            </td>
                                            <td className="py-4 text-muted-foreground">{item.type}</td>
                                            <td className="py-4 text-muted-foreground">{item.generated}</td>
                                            <td className="py-4">
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 font-normal">
                                                    {item.format}
                                                </Badge>
                                            </td>
                                            <td className="py-4 text-muted-foreground">{item.size}</td>
                                            <td className="py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-[#1c2434]">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-[#1c2434]">
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-[#1c2434]">
                                                        <Share2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
