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
    Trophy,
    Eye,
    Archive,
    X,
    Filter,
    Calendar,
    Sparkles,
    ArrowLeft,
    Edit3,
    Bell,
    Handshake,
    FileCheck,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { useState } from 'react';
import { useLiveSync } from '@/hooks/use-live-sync';
import { EditCaseStatusDialog } from '@/components/cases/edit-case-status-dialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface DashboardProps {
    stats: {
        total: number;
        pending: number;
        resolved: number;
        new_this_month: number;
    };
    latestMonthCases?: Array<{
        id: number;
        case_number: string;
        complainant: string;
        respondent: string;
        type: string;
        date_filed: string;
        raw_date_filed?: string;
        created_at?: string;
        status: string;
        creator?: { name: string } | null;
    }>;
    caseOverview?: {
        total_all_time: number;
        total_current_year: number;
        total_current_month: number;
        by_category: {
            criminal: number;
            civil: number;
            others: number;
        };
    };
    statusDistributionByMonth?: Record<string, {
        mediation: number;
        conciliation: number;
        arbitration: number;
        settled: number;
        dismissed: number;
        certified: number;
    }>;
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
    documentStats?: {
        total: number;
        summons?: number;
        settlements?: number;
        recent_count?: number;
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

export default function Dashboard({ 
    stats = { total: 0, pending: 0, resolved: 0, new_this_month: 0 }, 
    latestMonthCases = [], 
    caseOverview, 
    statusDistributionByMonth = {}, 
    recentCases = [], 
    statusDistribution = { pending: 0, resolved: 0, mediation: 0, dismissed: 0, certified: 0 }, 
    outcomeStats = [], 
    typeStats = [], 
    documentStats, 
    monthlyStats = [] 
}: DashboardProps) {
    const { auth } = usePage<SharedData>().props;
    const userRole = auth?.user?.role || (auth?.roles && auth.roles[0]) || '';
    const canEdit = true;
    const isAdmin = userRole === 'Administrator' || userRole === 'Admin';

    // Auto-refresh metrics, recent cases, and recent documents in real-time
    useLiveSync(5000, [
        'stats',
        'latestMonthCases',
        'caseOverview',
        'recentCases',
        'documentStats',
        'monthlyStats',
        'statusDistribution',
        'outcomeStats',
        'typeStats',
        'statusDistributionByMonth',
    ]);

    const currentMonthNum = String(new Date().getMonth() + 1);

    const [isNewCasesModalOpen, setIsNewCasesModalOpen] = useState(false);
    const [selectedStatusMonth, setSelectedStatusMonth] = useState('all');
    const [showQuickActions, setShowQuickActions] = useState(false);

    // New Cases Modal local filters & month state (defaults to current month)
    const [modalSearch, setModalSearch] = useState('');
    const [modalMonth, setModalMonth] = useState(currentMonthNum);
    const [modalStatus, setModalStatus] = useState('all');

    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: '#'
        }
    ];

    const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#a855f7']; 

    const getBadgeStyles = (statusStr: string) => {
        switch (statusStr?.toLowerCase()) {
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

    const getTimeElapsedLabel = (dateFiledStr?: string, createdAtIso?: string) => {
        if (!dateFiledStr && !createdAtIso) return null;
        const targetDate = new Date(createdAtIso || dateFiledStr || '');
        if (isNaN(targetDate.getTime())) return null;

        const now = new Date();
        const diffMs = now.getTime() - targetDate.getTime();
        if (diffMs < 0) return null;

        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays > 7) return null; // Show tag only for cases filed in the last 7 days

        if (diffHours < 1) return 'Added just now';
        if (diffHours < 24) return `Added ${diffHours}h ago`;
        if (diffDays === 1) return 'Filed Yesterday';
        return `Filed ${diffDays}d ago`;
    };

    // Filter & sort modal cases chronologically (most recent first)
    const filteredModalCases = latestMonthCases
        .filter((c) => {
            // Month filter
            if (modalMonth !== 'all') {
                const d = new Date(c.raw_date_filed || c.date_filed);
                if (isNaN(d.getTime()) || String(d.getMonth() + 1) !== modalMonth) {
                    return false;
                }
            }
            // Status filter
            if (modalStatus !== 'all' && c.status?.toLowerCase() !== modalStatus.toLowerCase()) {
                return false;
            }
            // Search query
            if (modalSearch.trim() !== '') {
                const q = modalSearch.toLowerCase();
                const matchNo = c.case_number?.toLowerCase().includes(q);
                const matchComp = c.complainant?.toLowerCase().includes(q);
                const matchResp = c.respondent?.toLowerCase().includes(q);
                const matchType = c.type?.toLowerCase().includes(q);
                return matchNo || matchComp || matchResp || matchType;
            }
            return true;
        })
        .sort((a, b) => {
            const timeA = new Date(a.raw_date_filed || a.date_filed).getTime();
            const timeB = new Date(b.raw_date_filed || b.date_filed).getTime();
            return timeB - timeA;
        });

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

                    {/* Direct Navigation "New Cases" Card */}
                    <Card 
                        className="cursor-pointer hover:bg-secondary/50 dark:hover:bg-secondary/80 transition-all border-2 border-transparent hover:border-[#dd8b11]/40 shadow-sm hover:shadow-md"
                        onClick={() => router.visit('/cases?filter=new_cases&month=latest')}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="p-2 bg-transparent rounded-lg">
                                <TrendingUp className="h-4 w-4 text-black dark:text-white stroke-[2.5]" />
                            </div>
                            <Badge variant="secondary" className="bg-[#dd8b11]/10 text-[#dd8b11] hover:bg-[#dd8b11]/20 dark:bg-[#dd8b11] dark:bg-opacity-20 cursor-pointer">
                                View Cases &rarr;
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-medium opacity-70">New Cases</div>
                            <div className="text-2xl font-bold text-[#dd8b11] dark:text-white">{stats.new_this_month}</div>
                            <p className="text-xs opacity-50">Filed in {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} (Click to expand)</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Maximized Full-Width "New Cases" View */}
                <Dialog open={isNewCasesModalOpen} onOpenChange={setIsNewCasesModalOpen}>
                    <DialogContent className="max-w-none w-screen h-screen m-0 rounded-none border-none p-6 md:p-8 overflow-y-auto bg-background z-50 flex flex-col justify-start gap-6">
                        <DialogHeader className="border-b pb-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <DialogTitle className="text-2xl font-bold flex items-center gap-2.5 text-foreground">
                                        <TrendingUp className="h-6 w-6 text-[#dd8b11]" />
                                        New Cases - Most Recent Filings
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-muted-foreground mt-1">
                                        Full-width interactive management view showing recent case filings sorted chronologically.
                                    </DialogDescription>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline" className="bg-amber-500/10 text-[#dd8b11] border-amber-300 font-bold text-xs px-3 py-1.5">
                                        {filteredModalCases.length} Cases Listed
                                    </Badge>
                                    <Button 
                                        variant="default" 
                                        className="bg-[#1c2434] text-white hover:bg-[#1c2434]/90 text-xs font-semibold px-4 py-2"
                                        onClick={() => setIsNewCasesModalOpen(false)}
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to Dashboard
                                    </Button>
                                </div>
                            </div>
                        </DialogHeader>

                        {/* Prominent Full-Width Search & Filter Toolbar */}
                        <div className="grid gap-4 md:grid-cols-12 bg-muted/40 p-4 rounded-xl border">
                            {/* Full-Width Search Bar */}
                            <div className="md:col-span-5 space-y-1.5">
                                <label className="text-xs font-bold text-foreground uppercase tracking-wider">Search Cases</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by Case No., Complainant, or Respondent name..."
                                        className="pl-9 h-10 text-sm bg-background font-medium"
                                        value={modalSearch}
                                        onChange={(e) => setModalSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Month Selector Dropdown */}
                            <div className="md:col-span-3 space-y-1.5">
                                <label className="text-xs font-bold text-foreground uppercase tracking-wider">Month Selector</label>
                                <Select value={modalMonth} onValueChange={setModalMonth}>
                                    <SelectTrigger className="h-10 text-sm bg-background font-medium">
                                        <SelectValue placeholder="Select Month" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={currentMonthNum}>Current Month ({new Date().toLocaleString('default', { month: 'long', year: 'numeric' })})</SelectItem>
                                        <SelectItem value="all">All Months (YTD)</SelectItem>
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

                            {/* Status Filter */}
                            <div className="md:col-span-2 space-y-1.5">
                                <label className="text-xs font-bold text-foreground uppercase tracking-wider">Status</label>
                                <Select value={modalStatus} onValueChange={setModalStatus}>
                                    <SelectTrigger className="h-10 text-sm bg-background font-medium">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="Mediation">Mediation</SelectItem>
                                        <SelectItem value="Conciliation">Conciliation</SelectItem>
                                        <SelectItem value="Arbitration">Arbitration</SelectItem>
                                        <SelectItem value="Resolved">Resolved / Settled</SelectItem>
                                        <SelectItem value="Dismissed">Dismissed / Repudiated</SelectItem>
                                        <SelectItem value="Certified">Certified</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Clear Filters */}
                            <div className="md:col-span-2 flex items-end">
                                <Button 
                                    variant="outline" 
                                    className="h-10 w-full text-xs font-semibold text-muted-foreground hover:text-foreground"
                                    onClick={() => {
                                        setModalSearch('');
                                        setModalMonth(currentMonthNum);
                                        setModalStatus('all');
                                    }}
                                >
                                    <X className="mr-1.5 h-4 w-4" />
                                    Clear Filters
                                </Button>
                            </div>
                        </div>

                        {/* Unclipped Full-Width Total Cases Table Layout */}
                        <div className="w-full flex-1 overflow-x-auto rounded-xl border bg-card shadow-sm">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground uppercase border-b bg-slate-100/80 dark:bg-slate-900/80">
                                    <tr>
                                        <th className="py-4 px-4 font-bold w-12 text-center">No.</th>
                                        <th className="py-4 px-4 font-bold">Case No.</th>
                                        <th className="py-4 px-4 font-bold">Complainant vs. Respondent</th>
                                        <th className="py-4 px-4 font-bold">Nature of Dispute</th>
                                        <th className="py-4 px-4 font-bold">Date & Time Filed</th>
                                        <th className="py-4 px-4 font-bold">Assigned Officer / Lupon</th>
                                        <th className="py-4 px-4 font-bold">Status Badge</th>
                                        <th className="py-4 px-4 font-bold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredModalCases.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="py-12 text-center text-muted-foreground font-medium">
                                                No matching cases found for the selected filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredModalCases.map((item, idx) => {
                                            const timeAgoTag = getTimeElapsedLabel(item.raw_date_filed, item.created_at);
                                            return (
                                                <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/80 transition-colors border-b">
                                                    <td className="py-4 px-4 text-center text-muted-foreground font-semibold text-xs">
                                                        {idx + 1}
                                                    </td>
                                                    <td className="py-4 px-4 font-bold text-foreground whitespace-nowrap text-base">
                                                        {item.case_number}
                                                    </td>
                                                    <td className="py-4 px-4 text-muted-foreground font-medium">
                                                        <div className="font-bold text-foreground text-sm">{item.complainant}</div>
                                                        <div className="text-xs text-muted-foreground">vs. <span className="font-medium text-foreground">{item.respondent}</span></div>
                                                    </td>
                                                    <td className="py-4 px-4 text-muted-foreground font-medium" title={item.type}>
                                                        {item.type}
                                                    </td>
                                                    <td className="py-4 px-4 text-muted-foreground whitespace-nowrap">
                                                        <div className="font-semibold text-foreground text-xs">{item.date_filed}</div>
                                                        {timeAgoTag && (
                                                            <Badge variant="outline" className="mt-1 bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 font-semibold text-[10px] px-2 py-0.5 flex items-center gap-1 w-fit">
                                                                <Sparkles className="h-3 w-3" />
                                                                {timeAgoTag}
                                                            </Badge>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-4 text-muted-foreground text-xs">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
                                                                {(item.creator?.name || 'Encoder').charAt(0).toUpperCase()}
                                                            </div>
                                                            <span className="font-semibold">{item.creator?.name || 'Lupon Officer'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4 whitespace-nowrap">
                                                        <Badge variant="outline" className={`font-semibold rounded-full px-3 py-1 text-xs ${getBadgeStyles(item.status)}`}>
                                                            {item.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-4 px-4 text-right whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm" 
                                                                className="h-8 border-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold" 
                                                                onClick={() => window.open(`/documents/view-case/${item.id}`, '_blank')}
                                                            >
                                                                <Eye className="mr-1.5 h-3.5 w-3.5 text-foreground" />
                                                                View Case
                                                            </Button>
                                                            {!isAdmin && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    title="Archive Case"
                                                                    className="h-8 w-8 text-amber-500 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                                                                    onClick={() => {
                                                                        if (confirm(`Archive case ${item.case_number}? It will be moved to the archive.`)) {
                                                                            router.post(`/cases/${item.id}/archive`, {}, { preserveState: false });
                                                                        }
                                                                    }}
                                                                >
                                                                    <Archive className="h-4 w-4" />
                                                                </Button>
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
                    </DialogContent>
                </Dialog>

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
                                        {(recentCases || []).length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-4 text-center text-muted-foreground">No recent cases found.</td>
                                            </tr>
                                        ) : (
                                            (recentCases || []).map((item) => (
                                                <tr key={item.id} className="hover:bg-secondary/50/50 dark:hover:bg-secondary/80/50 cursor-pointer"
                                                    onClick={() => window.open(`/documents/view-case/${item.id}`, '_blank')}>
                                                    <td className="py-3 px-2 font-medium">{item.case_number}</td>
                                                    <td className="py-3 px-2 text-muted-foreground">{item.type}</td>
                                                    <td className="py-3 px-2 text-muted-foreground">{item.complainant}</td>
                                                    <td className="py-3 px-2 text-muted-foreground">{item.date_filed}</td>
                                                    <td className="py-3 px-2">
                                                         <Badge variant="outline" className={`font-normal rounded-full border ${getBadgeStyles(item.status)}`}>
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
                                            data={outcomeStats || []}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {(outcomeStats || []).map((entry, index) => {
                                                const colorMap: Record<string, string> = {
                                                    'Pending': '#f59e0b',
                                                    'Settled': '#10b981',
                                                    'Escalated': '#8b5cf6',
                                                };
                                                const color = colorMap[entry.name] || COLORS[index % COLORS.length];
                                                return <Cell key={`cell-${index}`} fill={color} />;
                                            })}
                                        </Pie>
                                        <Tooltip 
                                            formatter={(value, name, props) => {
                                                const percentage = props?.payload?.percentage ?? 0;
                                                const sub = name === 'Escalated' ? ' (Certificate to File Action / Referred to Court)' : '';
                                                return [`${value} cases (${percentage}%)${sub}`, name];
                                            }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 space-y-2">
                                {(outcomeStats || []).map((stat, index) => {
                                    const colorMap: Record<string, string> = {
                                        'Pending': '#f59e0b',
                                        'Settled': '#10b981',
                                        'Escalated': '#8b5cf6',
                                    };
                                    const color = colorMap[stat.name] || COLORS[index % COLORS.length];
                                    return (
                                        <div key={index} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
                                                <span className="text-muted-foreground font-medium">{stat.name} ({stat.value})</span>
                                                {stat.name === 'Escalated' && (
                                                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-normal opacity-80">(Referred to Court)</span>
                                                )}
                                            </div>
                                            <span className="font-bold" style={{ color }}>{stat.percentage}%</span>
                                        </div>
                                    );
                                })}
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
                            {(typeStats || []).length === 0 ? (
                                <p className="text-sm text-muted-foreground">No data available yet.</p>
                            ) : (
                                (typeStats || []).map((stat, index) => (
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

                {/* Document Analytics & Case Overview Section */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* Explicit Case Overview */}
                    <Card className="col-span-4">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle>Case Overview</CardTitle>
                                <p className="text-xs text-muted-foreground mt-0.5">Explicit totals and category distribution across the system</p>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Explicit Overview Stat Counters */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-3 bg-muted/40 rounded-xl border border-border/50 text-center">
                                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">All-Time Total</p>
                                    <p className="text-2xl font-black text-foreground mt-1">{caseOverview?.total_all_time ?? stats.total}</p>
                                    <p className="text-[10px] text-muted-foreground">Aggregate filings</p>
                                </div>
                                <div className="p-3 bg-amber-500/10 dark:bg-amber-500/20 rounded-xl border border-amber-500/20 text-center">
                                    <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Current Year</p>
                                    <p className="text-2xl font-black text-[#dd8b11] dark:text-amber-400 mt-1">{caseOverview?.total_current_year ?? stats.total}</p>
                                    <p className="text-[10px] text-muted-foreground">Year {new Date().getFullYear()}</p>
                                </div>
                                <div className="p-3 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl border border-blue-500/20 text-center">
                                    <p className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Current Month</p>
                                    <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{caseOverview?.total_current_month ?? stats.new_this_month}</p>
                                    <p className="text-[10px] text-muted-foreground">{new Date().toLocaleString('default', { month: 'short' })} filings</p>
                                </div>
                            </div>

                            {/* Breakdown by Dispute Category */}
                            <div className="space-y-3 pt-2">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Breakdown by Dispute Category</h4>
                                {(() => {
                                    const criminal = caseOverview?.by_category?.criminal ?? 0;
                                    const civil = caseOverview?.by_category?.civil ?? 0;
                                    const others = caseOverview?.by_category?.others ?? 0;
                                    const totalCat = (criminal + civil + others) || 1;

                                    const categories = [
                                        { name: 'Criminal Cases', count: criminal, color: 'bg-red-500', barColor: '#ef4444', pct: Math.round((criminal / totalCat) * 100) },
                                        { name: 'Civil Cases', count: civil, color: 'bg-blue-500', barColor: '#3b82f6', pct: Math.round((civil / totalCat) * 100) },
                                        { name: 'Others / Administrative Matters', count: others, color: 'bg-emerald-500', barColor: '#10b981', pct: Math.round((others / totalCat) * 100) },
                                    ];

                                    return categories.map((cat, idx) => (
                                        <div key={idx} className="space-y-1.5 p-2.5 rounded-lg bg-muted/20 border border-border/30">
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                                                    <span className="font-semibold text-foreground">{cat.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-foreground">{cat.count} cases</span>
                                                    <span className="text-muted-foreground font-semibold">({cat.pct}%)</span>
                                                </div>
                                            </div>
                                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${cat.pct}%`, backgroundColor: cat.barColor }} />
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </div>

                            {/* Monthly Trend Chart */}
                            <div className="pt-2">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Monthly Filing Trend ({new Date().getFullYear()})</h4>
                                <div className="h-[180px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={monthlyStats}>
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                                            <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }} itemStyle={{ color: 'hsl(var(--foreground))' }} cursor={{ fill: 'transparent' }} />
                                            <Bar dataKey="total" fill="#dd8b11" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dynamic Month Status Distribution */}
                    <Card className="col-span-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-bold">Status Distribution</CardTitle>
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">Select Month:</span>
                                <Select value={selectedStatusMonth} onValueChange={setSelectedStatusMonth}>
                                    <SelectTrigger className="w-[140px] h-8 text-xs bg-background">
                                        <SelectValue placeholder="Select Month" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Months (YTD)</SelectItem>
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
                        </CardHeader>
                        <CardContent>
                            {(() => {
                                const currentDist = statusDistributionByMonth?.[selectedStatusMonth] || {
                                    mediation: statusDistribution?.mediation || 0,
                                    conciliation: statusDistribution?.pending || 0,
                                    arbitration: 0,
                                    settled: statusDistribution?.resolved || 0,
                                    dismissed: statusDistribution?.dismissed || 0,
                                    certified: statusDistribution?.certified || 0,
                                };

                                const stageItems = [
                                    { name: 'Mediation Stage', value: currentDist.mediation, color: '#3b82f6' },
                                    { name: 'Conciliation Stage', value: currentDist.conciliation, color: '#f59e0b' },
                                    { name: 'Arbitration Stage', value: currentDist.arbitration, color: '#8b5cf6' },
                                    { name: 'Amicably Settled', value: currentDist.settled, color: '#10b981' },
                                    { name: 'Repudiated / Dismissed', value: currentDist.dismissed, color: '#ef4444' },
                                    { name: 'Issued Certificate to File Action', value: currentDist.certified, color: '#64748b' },
                                ];

                                const totalStage = stageItems.reduce((acc, curr) => acc + curr.value, 0);

                                return (
                                    <>
                                        <div className="h-[220px] w-full flex items-center justify-center">
                                            {totalStage === 0 ? (
                                                <div className="text-center text-xs text-muted-foreground py-12">
                                                    No cases found for the selected month filter.
                                                </div>
                                            ) : (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={stageItems.filter(item => item.value > 0)}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={55}
                                                            outerRadius={85}
                                                            paddingAngle={4}
                                                            dataKey="value"
                                                        >
                                                            {stageItems.filter(item => item.value > 0).map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip
                                                            formatter={(val: any, name: any) => [`${val} cases`, name]}
                                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                                                        />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            )}
                                        </div>

                                        <div className="mt-4 space-y-2">
                                            {stageItems.map((stat, idx) => {
                                                const pct = totalStage > 0 ? Math.round((stat.value / totalStage) * 100) : 0;
                                                return (
                                                    <div key={idx} className="flex items-center justify-between text-xs">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: stat.color }}></span>
                                                            <span className="text-muted-foreground font-medium">{stat.name} ({stat.value})</span>
                                                        </div>
                                                        <span className="font-bold" style={{ color: stat.color }}>{pct}%</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                );
                            })()}
                        </CardContent>
                    </Card>
                </div>

                {/* ── Document Overview Section ── */}
                {documentStats && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold tracking-tight text-foreground">Document Overview</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Summary of generated forms, notices, settlements, and document records
                                </p>
                            </div>
                            <Button variant="outline" size="sm" asChild className="text-xs">
                                <Link href="/documents/templates">
                                    View All Documents &rarr;
                                </Link>
                            </Button>
                        </div>

                        {/* 4 Document Overview Stat Cards */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card 
                                className="cursor-pointer hover:bg-secondary/50 dark:hover:bg-secondary/80 transition-colors"
                                onClick={() => router.visit('/documents/templates')}
                            >
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-[#dd8b11] dark:text-white">{documentStats.total}</div>
                                    <p className="text-xs text-muted-foreground">Total generated forms</p>
                                </CardContent>
                            </Card>

                            <Card 
                                className="cursor-pointer hover:bg-secondary/50 dark:hover:bg-secondary/80 transition-colors"
                                onClick={() => router.visit('/documents/templates')}
                            >
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Summons & Notices</CardTitle>
                                    <Bell className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-[#dd8b11] dark:text-white">{documentStats.summons ?? 0}</div>
                                    <p className="text-xs text-muted-foreground">Issued to parties</p>
                                </CardContent>
                            </Card>

                            <Card 
                                className="cursor-pointer hover:bg-secondary/50 dark:hover:bg-secondary/80 transition-colors"
                                onClick={() => router.visit('/documents/templates')}
                            >
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Amicable Settlements</CardTitle>
                                    <Handshake className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-[#dd8b11] dark:text-white">{documentStats.settlements ?? 0}</div>
                                    <p className="text-xs text-muted-foreground">Resolved disputes</p>
                                </CardContent>
                            </Card>

                            <Card 
                                className="cursor-pointer hover:bg-secondary/50 dark:hover:bg-secondary/80 transition-colors"
                                onClick={() => router.visit('/documents/templates')}
                            >
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Recent Documents</CardTitle>
                                    <FileCheck className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-[#dd8b11] dark:text-white">{documentStats.recent_count ?? (documentStats.recent?.length ?? 0)}</div>
                                    <p className="text-xs text-muted-foreground">Generated in database</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Document Breakdown & Recent Documents Table */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 pt-2">
                            <Card className="col-span-3 flex flex-col justify-between">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-base font-bold">Document Types Breakdown</CardTitle>
                                            <p className="text-xs text-muted-foreground mt-0.5">Distribution of generated forms by type</p>
                                        </div>
                                        <Badge variant="outline" className="bg-amber-500/10 text-[#dd8b11] border-amber-300 dark:bg-amber-950/40 dark:border-amber-800 font-bold text-xs px-2 py-0.5">
                                            {documentStats.recent_count ?? documentStats.total} Total
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-between">
                                    {(() => {
                                        const rawData = documentStats.by_type || [];
                                        const chartData = rawData.map(item => ({
                                            name: item.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                                            value: item.count
                                        }));
                                        const total = chartData.reduce((sum, item) => sum + item.value, 0);
                                        const DOC_COLORS = ['#dd8b11', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];

                                        if (chartData.length === 0 || total === 0) {
                                            return (
                                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-xs">
                                                    <PieChartIcon className="h-8 w-8 mb-2 opacity-50 text-[#dd8b11]" />
                                                    <span>No document statistics available yet.</span>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div className="space-y-3">
                                                <div className="h-[190px] w-full flex items-center justify-center">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie
                                                                data={chartData}
                                                                cx="50%"
                                                                cy="50%"
                                                                innerRadius={50}
                                                                outerRadius={75}
                                                                paddingAngle={4}
                                                                dataKey="value"
                                                            >
                                                                {chartData.map((_, index) => (
                                                                    <Cell key={`cell-${index}`} fill={DOC_COLORS[index % DOC_COLORS.length]} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip
                                                                formatter={(val: any, name: any) => {
                                                                    const pct = total > 0 ? Math.round(((val as number) / total) * 100) : 0;
                                                                    return [`${val} documents (${pct}%)`, name];
                                                                }}
                                                                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                                                itemStyle={{ color: 'hsl(var(--foreground))' }}
                                                            />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>

                                                <div className="space-y-1.5 border-t pt-3">
                                                    {chartData.slice(0, 5).map((stat, i) => {
                                                        const pct = total > 0 ? Math.round((stat.value / total) * 100) : 0;
                                                        const color = DOC_COLORS[i % DOC_COLORS.length];
                                                        return (
                                                            <div key={i} className="flex items-center justify-between text-xs">
                                                                <div className="flex items-center gap-2 truncate pr-2">
                                                                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                                                                    <span className="font-medium text-foreground truncate">{stat.name}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 whitespace-nowrap">
                                                                    <span className="font-bold text-foreground">{stat.value}</span>
                                                                    <span className="text-muted-foreground text-[11px] font-semibold">({pct}%)</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </CardContent>
                            </Card>

                            <Card className="col-span-4">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-base font-bold">Recent Generated Documents</CardTitle>
                                    <Button variant="link" asChild className="text-xs h-auto p-0 text-muted-foreground">
                                        <Link href="/documents/templates">View All &rarr;</Link>
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {!documentStats.recent || documentStats.recent.length === 0 ? (
                                            <p className="text-xs text-center text-muted-foreground py-4">No documents generated yet.</p>
                                        ) : (
                                            documentStats.recent.map((doc) => (
                                                <div key={doc.id} 
                                                    className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0 cursor-pointer hover:bg-secondary/50 p-1.5 rounded-md transition-colors"
                                                    onClick={() => window.open(`/documents/view/${doc.id}`, '_blank')}
                                                >
                                                    <div>
                                                        <p className="text-sm font-semibold text-foreground capitalize">{doc.type.replace(/_/g, ' ')}</p>
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
                    </div>
                )}

                {/* Quick Actions (Collapsible & Minimized by default) */}
                {canEdit && (
                    <Card className="border shadow-sm">
                        <CardHeader 
                            className="py-3 px-4 flex flex-row items-center justify-between cursor-pointer select-none hover:bg-muted/20 transition-colors"
                            onClick={() => setShowQuickActions(!showQuickActions)}
                        >
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-[#dd8b11]" />
                                Quick Actions
                            </CardTitle>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 text-xs font-semibold flex items-center gap-1.5 border-amber-500/40 text-[#dd8b11] hover:bg-amber-500/10 dark:hover:bg-amber-950/40"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowQuickActions(!showQuickActions);
                                }}
                            >
                                {showQuickActions ? (
                                    <>
                                        <ChevronUp className="h-4 w-4" />
                                        Hide Quick Actions
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="h-4 w-4" />
                                        Show Quick Actions
                                    </>
                                )}
                            </Button>
                        </CardHeader>
                        {showQuickActions && (
                            <CardContent className="pt-3 border-t grid gap-4 md:grid-cols-2 lg:grid-cols-2">
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
                            </CardContent>
                        )}
                    </Card>
                )}

            </div>
        </AppLayout>
    );
}
