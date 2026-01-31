import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import {
    Folder,
    Clock,
    CheckCircle,
    TrendingUp,
    Plus,

    FileText,
    Download,
    Printer,
    PieChart,
    ChevronDown,
    MoreHorizontal,
    Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: '#'
        }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 text-slate-900 dark:text-slate-100">


                {/* Header */}
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
                        <p className="text-muted-foreground">
                            Lupon Tagapamayapa Case Management System
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">

                        <Button className="bg-[#1c2434] hover:bg-[#2c3a4f] text-white">
                            <Plus className="mr-2 h-4 w-4" /> New Case
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="p-2 bg-slate-100 rounded-lg dark:bg-slate-800">
                                <Folder className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </div>
                            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">
                                +12%
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-medium text-muted-foreground">Total Cases</div>
                            <div className="text-2xl font-bold text-[#1c2434] dark:text-white">248</div>
                            <p className="text-xs text-muted-foreground">Since January 2024</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="p-2 bg-slate-100 rounded-lg dark:bg-slate-800">
                                <Clock className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </div>
                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300">
                                Active
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-medium text-muted-foreground">Pending Cases</div>
                            <div className="text-2xl font-bold text-[#1c2434] dark:text-white">42</div>
                            <p className="text-xs text-muted-foreground">Awaiting resolution</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="p-2 bg-slate-100 rounded-lg dark:bg-slate-800">
                                <CheckCircle className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </div>
                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300">
                                83%
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-medium text-muted-foreground">Resolved Cases</div>
                            <div className="text-2xl font-bold text-[#1c2434] dark:text-white">206</div>
                            <p className="text-xs text-muted-foreground">Successfully settled</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="p-2 bg-slate-100 rounded-lg dark:bg-slate-800">
                                <TrendingUp className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </div>
                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300">
                                This Month
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-medium text-muted-foreground">New Cases</div>
                            <div className="text-2xl font-bold text-[#1c2434] dark:text-white">18</div>
                            <p className="text-xs text-muted-foreground">Filed in May 2024</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-3">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Case Types Distribution</CardTitle>
                            <Button variant="link" className="text-xs h-auto p-0 text-muted-foreground">View All</Button>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center min-h-[300px]">
                            {/* Doughnut Chart Placeholder */}
                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                <div className="rounded-full border-8 border-slate-100 h-32 w-32 flex items-center justify-center mb-4 dark:border-slate-800">
                                    <PieChart className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                                </div>
                                <span className="text-sm font-medium">Doughnut Chart</span>
                                <span className="text-xs">Case Types Distribution</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="col-span-4">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Monthly Case Trends</CardTitle>
                            <Button variant="outline" size="sm" className="h-8 text-xs">
                                2024 <ChevronDown className="ml-2 h-3 w-3" />
                            </Button>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center min-h-[300px]">
                            {/* Line Chart Placeholder */}
                            <div className="flex flex-col items-center justify-center text-muted-foreground w-full">
                                <div className="h-48 w-full bg-slate-50 rounded-lg flex items-center justify-center mb-4 border border-dashed border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                                    <TrendingUp className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                                </div>
                                <span className="text-sm font-medium">Line Chart</span>
                                <span className="text-xs">Monthly Trends (Jan-Jun)</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Cases & Outcomes */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-5">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Recent Cases</CardTitle>
                            <Button variant="link" className="text-xs h-auto p-0 text-muted-foreground">View All &rarr;</Button>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-muted-foreground uppercase border-b">
                                        <tr>
                                            <th className="py-3 px-2 font-medium">Case No.</th>
                                            <th className="py-3 px-2 font-medium">Type</th>
                                            <th className="py-3 px-2 font-medium">Complainant</th>
                                            <th className="py-3 px-2 font-medium">Date Filed</th>
                                            <th className="py-3 px-2 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {[
                                            { id: 'LT-2024-0248', type: 'Property Dispute', complainant: 'Juan Dela Cruz', date: 'May 15, 2024', status: 'Pending', variant: 'secondary' },
                                            { id: 'LT-2024-0247', type: 'Noise Complaint', complainant: 'Maria Santos', date: 'May 14, 2024', status: 'Resolved', variant: 'outline' },
                                            { id: 'LT-2024-0246', type: 'Debt Collection', complainant: 'Pedro Reyes', date: 'May 13, 2024', status: 'Mediation', variant: 'secondary' },
                                            { id: 'LT-2024-0245', type: 'Family Dispute', complainant: 'Ana Garcia', date: 'May 12, 2024', status: 'Resolved', variant: 'outline' },
                                            { id: 'LT-2024-0244', type: 'Boundary Issue', complainant: 'Roberto Cruz', date: 'May 11, 2024', status: 'Pending', variant: 'secondary' },
                                        ].map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                                <td className="py-3 px-2 font-medium">{item.id}</td>
                                                <td className="py-3 px-2 text-muted-foreground">{item.type}</td>
                                                <td className="py-3 px-2 text-muted-foreground">{item.complainant}</td>
                                                <td className="py-3 px-2 text-muted-foreground">{item.date}</td>
                                                <td className="py-3 px-2">
                                                    <Badge variant={item.variant as any} className="font-normal">
                                                        {item.status}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="col-span-2">
                        <CardHeader>
                            <CardTitle>Case Outcomes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center min-h-[200px]">
                                <div className="rounded-full border-8 border-slate-100 h-32 w-32 flex items-center justify-center mb-6 dark:border-slate-800">
                                    <PieChart className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                                </div>
                                <div className="w-full space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-[#1c2434]"></span>
                                            <span className="text-muted-foreground">Settled</span>
                                        </div>
                                        <span className="font-medium">68%</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                                            <span className="text-muted-foreground">Mediated</span>
                                        </div>
                                        <span className="font-medium">22%</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-slate-200"></span>
                                            <span className="text-muted-foreground">Unresolved</span>
                                        </div>
                                        <span className="font-medium">10%</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Button variant="outline" className="h-auto py-4 justify-start space-x-4 hover:border-[#1c2434] hover:bg-slate-50 dark:hover:bg-slate-900 group">
                            <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-white border group-hover:border-[#1c2434]/20 transition-colors">
                                <Plus className="h-5 w-5 text-[#1c2434]" />
                            </div>
                            <div className="text-left">
                                <div className="font-semibold text-[#1c2434] dark:text-white">New Case</div>
                                <div className="text-xs text-muted-foreground font-normal">File a new case</div>
                            </div>
                        </Button>
                        <Button variant="outline" className="h-auto py-4 justify-start space-x-4 hover:border-[#1c2434] hover:bg-slate-50 dark:hover:bg-slate-900 group">
                            <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-white border group-hover:border-[#1c2434]/20 transition-colors">
                                <FileText className="h-5 w-5 text-[#1c2434]" />
                            </div>
                            <div className="text-left">
                                <div className="font-semibold text-[#1c2434] dark:text-white">Generate Report</div>
                                <div className="text-xs text-muted-foreground font-normal">Create summary</div>
                            </div>
                        </Button>

                        <Button variant="outline" className="h-auto py-4 justify-start space-x-4 hover:border-[#1c2434] hover:bg-slate-50 dark:hover:bg-slate-900 group">
                            <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-white border group-hover:border-[#1c2434]/20 transition-colors">
                                <Printer className="h-5 w-5 text-[#1c2434]" />
                            </div>
                            <div className="text-left">
                                <div className="font-semibold text-[#1c2434] dark:text-white">Print Documents</div>
                                <div className="text-xs text-muted-foreground font-normal">Official forms</div>
                            </div>
                        </Button>
                    </CardContent>
                </Card>

            </div>
        </AppLayout>
    );
}
