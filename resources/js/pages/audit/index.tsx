import { Head, router } from '@inertiajs/react';
import debounce from 'lodash/debounce';
import {
    Activity,
    ShieldAlert,
    Database,
    Search,
    FileText,
    Users,
    Filter,
    Eye,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from '@/layouts/app-layout';

interface AuditLog {
    id: number;
    user?: { name: string; role: string };
    action: string;
    module: string;
    details: string;
    ip_address: string;
    created_at: string;
}

interface PageProps {
    logs: {
        data: AuditLog[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
    };
    stats: {
        total: number;
        today: number;
        active_users_24h: number;
        by_module: Record<string, number>;
    };
    filters: {
        search?: string;
        module?: string;
        action?: string;
        user?: string;
        date?: string;
    };
    users: Array<{ id: number; name: string }>;
}

export default function AuditTrailPage({ logs, stats, filters, users }: PageProps) {
    const breadcrumbs = [
        {
            title: 'Audit Trail',
            href: '/audit',
        },
    ];

    const [search, setSearch] = useState(filters.search || '');
    const [moduleFilter, setModuleFilter] = useState(filters.module || 'all');
    const [actionFilter, setActionFilter] = useState(filters.action || 'all');
    const [userFilter, setUserFilter] = useState(filters.user || 'all');
    const [dateFilter, setDateFilter] = useState(filters.date || '');

    const applyFilters = useCallback(
        debounce((newFilters) => {
            router.get('/audit', { ...filters, ...newFilters }, { preserveState: true, preserveScroll: true });
        }, 500),
        []
    );

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        applyFilters({ search: e.target.value });
    };

    const handleFilterChange = (key: string, value: string) => {
        const filterMap: Record<string, any> = { module: setModuleFilter, action: setActionFilter, user: setUserFilter };
        if (filterMap[key]) filterMap[key](value);
        applyFilters({ [key]: value });
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDateFilter(e.target.value);
        applyFilters({ date: e.target.value });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Audit Trail" />

            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 text-slate-900 dark:text-slate-100">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Audit Trail</h2>
                        <p className="text-muted-foreground">
                            System activity and security logs
                        </p>
                    </div>
                </div>

                {/* KPI Stats */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="p-2 bg-slate-100 rounded-lg dark:bg-slate-800">
                                <Activity className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </div>
                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300">
                                Today
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#1c2434] dark:text-white">{stats.today}</div>
                            <p className="text-xs text-muted-foreground">Activities Today</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="p-2 bg-slate-100 rounded-lg dark:bg-slate-800">
                                <Users className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </div>
                            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">
                                Active Users
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#1c2434] dark:text-white">{stats.active_users_24h}</div>
                            <p className="text-xs text-muted-foreground">Active in last 24h</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="p-2 bg-slate-100 rounded-lg dark:bg-slate-800">
                                <FileText className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </div>
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400">
                                Documents
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#1c2434] dark:text-white">{stats.by_module['Documents'] || 0}</div>
                            <p className="text-xs text-muted-foreground">Generated Documents</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="p-2 bg-slate-100 rounded-lg dark:bg-slate-800">
                                <Database className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </div>
                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300">
                                Total
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#1c2434] dark:text-white">{stats.total}</div>
                            <p className="text-xs text-muted-foreground">Log Entries</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="p-4">
                    <div className="grid gap-4 md:grid-cols-5 items-end">
                        <div className="space-y-2">
                            <span className="text-sm font-medium">Date Range</span>
                            <Input type="date" className="w-full" value={dateFilter} onChange={handleDateChange} />
                        </div>
                        <div className="space-y-2">
                            <span className="text-sm font-medium">User</span>
                            <Select value={userFilter} onValueChange={(val) => handleFilterChange('user', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Users" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Users</SelectItem>
                                    {users.map(u => (
                                        <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <span className="text-sm font-medium">Action Type</span>
                            <Select value={actionFilter} onValueChange={(val) => handleFilterChange('action', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Actions" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Actions</SelectItem>
                                    <SelectItem value="LOGIN">Login</SelectItem>
                                    <SelectItem value="CREATE">Create</SelectItem>
                                    <SelectItem value="UPDATE">Update</SelectItem>
                                    <SelectItem value="DELETE">Delete</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <span className="text-sm font-medium">Module</span>
                            <Select value={moduleFilter} onValueChange={(val) => handleFilterChange('module', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Modules" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Modules</SelectItem>
                                    <SelectItem value="Cases">Cases</SelectItem>
                                    <SelectItem value="Documents">Documents</SelectItem>
                                    <SelectItem value="Users">Users</SelectItem>
                                    <SelectItem value="Auth">Auth</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <span className="text-sm font-medium">Search</span>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search logs..."
                                    className="pl-8"
                                    value={search}
                                    onChange={handleSearch}
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Activity Log Table */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle>Activity Log</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Timestamp</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Module</TableHead>
                                        <TableHead>Details</TableHead>
                                        <TableHead>IP Address</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                No activity logs found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        logs.data.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="whitespace-nowrap">
                                                    <div className="font-medium">{new Date(log.created_at).toLocaleTimeString()}</div>
                                                    <div className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleDateString()}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                                            {log.user?.name ? log.user.name.charAt(0).toUpperCase() : '?'}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-sm">{log.user?.name || 'System / Unknown'}</div>
                                                            <div className="text-xs text-muted-foreground">{log.user?.role || ''}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={`
                                                        ${log.action === 'CREATE' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                                                        ${log.action === 'UPDATE' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                                                        ${log.action === 'DELETE' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                                                    `}>
                                                        {log.action}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{log.module}</TableCell>
                                                <TableCell className="text-sm max-w-[300px] truncate" title={log.details}>
                                                    {log.details}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground font-mono text-xs">{log.ip_address}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {logs.data.length > 0 && (
                            <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                                <div>
                                    Showing {logs.from} to {logs.to} of {logs.total} entries
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.visit(logs.links[0].url)}
                                        disabled={!logs.links[0].url}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.visit(logs.links[logs.links.length - 1].url)}
                                        disabled={!logs.links[logs.links.length - 1].url}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Bottom Section - Activity by Module */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Activity by Module</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {Object.entries(stats.by_module).map(([module, count]) => (
                                <div key={module} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">{module}</span>
                                        <span className="font-bold text-xs">{count} activities</span>
                                    </div>
                                    <Progress value={(count / stats.total) * 100} className="h-2 bg-slate-100 dark:bg-slate-800" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Placeholder for Security Events - can be real later */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Security Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center py-8 flex-col text-center text-muted-foreground">
                                <ShieldAlert className="h-12 w-12 mb-4 text-slate-300" />
                                <p>No critical security alerts detected in the last 24 hours.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
