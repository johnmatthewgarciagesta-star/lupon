import { Head, Link, router, usePage } from '@inertiajs/react';
import { SharedData } from '@/types';
import {
    Folder,
    Clock,
    CheckCircle,
    TrendingUp,
    Plus,
    FileText,
    Printer,
    PieChart as PieChartIcon,
    Search,
    Trophy
} from 'lucide-react';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
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

interface DashboardProps {
    stats: {
        total: number;
        pending: number;
        resolved: number;
        new_this_month: number;
    };
    recentCases: Array<{
        id: number;
        case_number: string;
        type: string;
        complainant: string;
        date_filed: string;
        status: string;
    }>;
    outcomeStats: Array<{
        name: string;
        value: number;
        percentage: number;
    }>;
    statusDistribution: {
        pending: number;
        resolved: number;
        mediation: number;
        dismissed: number;
        certified: number;
    };
    typeStats: Array<{
        nature_of_case: string;
        count: number;
    }>;
    documentStats: {
        total: number;
        by_type: Array<{ type: string; count: number }>;
        recent: Array<{
            id: number;
            type: string;
            case_number: string;
            created_at: string;
            status: string;
        }>;
    };
    monthlyStats: Array<{ name: string; total: number }>;
}

export default function Dashboard({ stats, recentCases, statusDistribution, outcomeStats, typeStats, documentStats, monthlyStats }: DashboardProps) {
    const { auth } = usePage<SharedData>().props;
    const canEdit = auth.user.role !== 'Administrator';

    const [year, setYear] = useState(new Date().getFullYear());
    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: '#'
        }
    ];

    const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#a855f7']; 

    const getStatusVariant = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'resolved':
            case 'settled':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'pending':
                return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400';
            case 'mediation':
                return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400';
            case 'certified':
                return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400';
            case 'dismissed':
                return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 text-secondary/80 dark:text-secondary">

                {/* Header */}
                <div className="flex items-center justify-between space-y-2 text-foreground">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
                        <p className="text-muted-foreground mt-1">
                            Lupon Tagapamayapa Case Management System
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="cursor-pointer hover:bg-secondary/50 dark:hover:bg-secondary/80 transition-colors"
                        onClick={() => router.visit('/cases')}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="p-2 bg-transparent rounded-lg">
                                <Folder className="h-4 w-4 text-black dark:text-white stroke-[2.5]" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-medium opacity-70">Total Cases</div>
                            <div className="text-2xl font-bold text-[#dd8b11] dark:text-white">{stats.total}</div>
                            <p className="text-xs opacity-50">All time records</p>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:bg-secondary/50 dark:hover:bg-secondary/80 transition-colors"
                        onClick={() => router.visit('/cases?status=Pending')}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="p-2 bg-transparent rounded-lg">
                                <Clock className="h-4 w-4 text-black dark:text-white stroke-[2.5]" />
                            </div>
                            <Badge variant="secondary" className="bg-[#dd8b11]/10 text-[#dd8b11] hover:bg-[#dd8b11]/20 dark:bg-[#dd8b11] dark:bg-opacity-20">
                                Active
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-medium opacity-70">Pending Cases</div>
                            <div className="text-2xl font-bold text-[#dd8b11] dark:text-white">{stats.pending}</div>
                            <p className="text-xs opacity-50">Awaiting resolution</p>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:bg-secondary/50 dark:hover:bg-secondary/80 transition-colors"
                        onClick={() => router.visit('/cases?status=Resolved')}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="p-2 bg-transparent rounded-lg">
                                <CheckCircle className="h-4 w-4 text-black dark:text-white stroke-[2.5]" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-medium opacity-70">Resolved Cases</div>
                            <div className="text-2xl font-bold text-[#dd8b11] dark:text-white">{stats.resolved}</div>
                            <p className="text-xs opacity-50">Successfully settled</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="p-2 bg-transparent rounded-lg">
                                <TrendingUp className="h-4 w-4 text-black dark:text-white stroke-[2.5]" />
                            </div>
                            <Badge variant="secondary" className="bg-[#dd8b11]/10 text-[#dd8b11] hover:bg-[#dd8b11]/20 dark:bg-[#dd8b11] dark:bg-opacity-20">
                                This Month
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-medium opacity-70">New Cases</div>
                            <div className="text-2xl font-bold text-[#dd8b11] dark:text-white">{stats.new_this_month}</div>
                            <p className="text-xs opacity-50">Filed in {new Date().toLocaleString('default', { month: 'long' })}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

                    {/* Recent Cases Table */}
                    <Card className="col-span-4">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Recent Cases</CardTitle>
                            <Button variant="link" asChild className="text-xs h-auto p-0 text-muted-foreground">
                                <Link href="/cases">View All &rarr;</Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-muted-foreground uppercase border-b">
                                        <tr>
                                            <th className="py-3 px-2 font-medium">Case No.</th>
                                            <th className="py-3 px-2 font-medium">Type</th>
                                            <th className="py-3 px-2 font-medium">Complainant</th>
                                            <th className="py-3 px-2 font-medium">Date</th>
                                            <th className="py-3 px-2 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {recentCases.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-4 text-center text-muted-foreground">No recent cases found.</td>
                                            </tr>
                                        ) : (
                                            recentCases.map((item) => (
                                                <tr key={item.id} className="hover:bg-secondary/50/50 dark:hover:bg-secondary/80/50 cursor-pointer"
                                                    onClick={() => window.open(`/documents/view-case/${item.id}`, '_blank')}>
                                                    <td className="py-3 px-2 font-medium">{item.case_number}</td>
                                                    <td className="py-3 px-2 text-muted-foreground">{item.type}</td>
                                                    <td className="py-3 px-2 text-muted-foreground">{item.complainant}</td>
                                                    <td className="py-3 px-2 text-muted-foreground">{item.date_filed}</td>
                                                    <td className="py-3 px-2">
                                                        <Badge variant="outline" className={`font-normal rounded-full border ${getStatusVariant(item.status)}`}>
                                                            {item.status}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Case Outcomes Pie Chart */}
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Case Outcomes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={outcomeStats}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {outcomeStats.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            formatter={(value, name, props) => [`${value} cases (${props.payload.percentage}%)`, name]}
                                        />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 space-y-2">
                                {outcomeStats.map((stat, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                            <span className="text-muted-foreground font-medium">{stat.name} ({stat.value})</span>
                                        </div>
                                        <span className="font-bold" style={{ color: COLORS[index % COLORS.length] }}>{stat.percentage}%</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Top Categories */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-7">
                        <CardHeader>
                            <CardTitle>Top Case Categories</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {typeStats.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No data available yet.</p>
                            ) : (
                                typeStats.map((stat, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium">{stat.nature_of_case}</span>
                                            <span className="text-muted-foreground text-xs"><strong className="text-[#dd8b11] dark:text-white">{stat.count} cases</strong></span>
                                        </div>
                                        <div className="h-2 w-full bg-secondary dark:bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[#dd8b11] rounded-full"
                                                style={{ width: `${Math.min((stat.count / stats.total) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Document Analytics Section */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Case Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthlyStats}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `${value}`}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                                            cursor={{ fill: 'transparent' }}
                                        />
                                        <Bar dataKey="total" fill="#dd8b11" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Status Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px] w-full flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Resolved', value: statusDistribution.resolved },
                                                { name: 'Pending', value: statusDistribution.pending },
                                                { name: 'Mediation', value: statusDistribution.mediation },
                                                { name: 'Dismissed', value: statusDistribution.dismissed },
                                                { name: 'Certified', value: statusDistribution.certified },
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {[0, 1, 2, 3, 4].map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value, name) => [`${value} cases`, name]}
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 space-y-2">
                                {[
                                    { name: 'Resolved', value: statusDistribution.resolved },
                                    { name: 'Pending', value: statusDistribution.pending },
                                    { name: 'Mediation', value: statusDistribution.mediation },
                                    { name: 'Dismissed', value: statusDistribution.dismissed },
                                    { name: 'Certified', value: statusDistribution.certified },
                                ].map((stat, index) => {
                                    const total = statusDistribution.resolved + statusDistribution.pending + statusDistribution.mediation + statusDistribution.dismissed + statusDistribution.certified;
                                    const percentage = total > 0 ? Math.round((stat.value / total) * 100) : 0;
                                    return (
                                        <div key={index} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                                <span className="text-muted-foreground font-medium">{stat.name} ({stat.value})</span>
                                            </div>
                                            <span className="font-bold" style={{ color: COLORS[index % COLORS.length] }}>{stat.value > 0 ? `${percentage}%` : '0%'}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Document Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Total Generated</p>
                                    <p className="text-2xl font-bold">{documentStats.total}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Most Common</p>
                                    <p className="text-2xl font-bold">
                                        {documentStats.by_type.length > 0 ? documentStats.by_type[0].type : 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6 space-y-4">
                                {documentStats.by_type.slice(0, 3).map((stat, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">{stat.type}</span>
                                        </div>
                                        <span className="text-sm text-muted-foreground">{stat.count}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="col-span-4">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Recent Documents</CardTitle>
                            <Button variant="link" asChild className="text-xs h-auto p-0 text-muted-foreground">
                                <Link href="/documents">View All &rarr;</Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {documentStats.recent.length === 0 ? (
                                    <p className="text-sm text-center text-muted-foreground py-4">No documents generated yet.</p>
                                ) : (
                                    documentStats.recent.map((doc) => (
                                        <div key={doc.id} 
                                            className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0 cursor-pointer hover:bg-secondary/50 p-1 rounded-sm transition-colors"
                                            onClick={() => window.open(`/documents/view/${doc.id}`, '_blank')}
                                        >
                                            <div>
                                                <p className="text-sm font-medium">{doc.type}</p>
                                                <p className="text-xs text-muted-foreground">Case: {doc.case_number}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-muted-foreground">{doc.created_at}</p>
                                                <Badge variant="outline" className="mt-1 text-[10px] h-5">
                                                    {doc.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {canEdit && (
                            <>
                                <Button variant="outline" asChild className="h-auto py-4 justify-start space-x-4 hover:border-[#dd8b11] hover:bg-secondary/50 dark:hover:bg-secondary/80 group">
                                    <Link href="/documents">
                                        <div className="p-2 bg-transparent rounded-lg transition-colors border border-transparent">
                                            <Plus className="h-5 w-5 text-black dark:text-white stroke-[2]" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-semibold text-[#dd8b11] dark:text-white">New Case</div>
                                            <div className="text-xs text-muted-foreground font-normal">File a new case</div>
                                        </div>
                                    </Link>
                                </Button>
                                <Button variant="outline" asChild className="h-auto py-4 justify-start space-x-4 hover:border-[#dd8b11] hover:bg-secondary/50 dark:hover:bg-secondary/80 group">
                                    <Link href="/system-reports">
                                        <div className="p-2 bg-transparent rounded-lg transition-colors border border-transparent">
                                            <FileText className="h-5 w-5 text-black dark:text-white stroke-[2]" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-semibold text-[#dd8b11] dark:text-white">Generate Report</div>
                                            <div className="text-xs text-muted-foreground font-normal">Create summary</div>
                                        </div>
                                    </Link>
                                </Button>
                            </>
                        )}
                        <Button variant="outline" asChild className="h-auto py-4 justify-start space-x-4 hover:border-[#dd8b11] hover:bg-secondary/50 dark:hover:bg-secondary/80 group">
                            <Link href="/ltia">
                                <div className="p-2 bg-transparent rounded-lg transition-colors border border-transparent">
                                    <Trophy className="h-5 w-5 text-black dark:text-white stroke-[2]" />
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold text-[#dd8b11] dark:text-white">LTIA</div>
                                    <div className="text-xs text-muted-foreground font-normal">View achievements</div>
                                </div>
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

            </div>
        </AppLayout>
    );
}
