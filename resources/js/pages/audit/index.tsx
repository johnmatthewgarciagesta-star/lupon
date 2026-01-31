import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Activity,
    ShieldAlert,
    Database,
    Search,
    FileText,
    Users,
    Settings,
    Filter,
    Eye,
    Lock,
    UserX,
    Key,
    ChevronLeft,
    ChevronRight,
    ClipboardList
} from 'lucide-react';

export default function AuditTrailPage() {
    const breadcrumbs = [
        {
            title: 'Audit Trail',
            href: '/audit',
        },
    ];

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
                    <div className="flex items-center space-x-2">
                        <Button className="h-9 bg-[#1c2434] hover:bg-[#2c3a4f] text-white">
                            <Filter className="mr-2 h-4 w-4" />
                            Advanced Filters
                        </Button>
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
                            <div className="text-2xl font-bold text-[#1c2434] dark:text-white">1,247</div>
                            <p className="text-xs text-muted-foreground">Total Activities</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="p-2 bg-slate-100 rounded-lg dark:bg-slate-800">
                                <Users className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </div>
                            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">
                                Active
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#1c2434] dark:text-white">23</div>
                            <p className="text-xs text-muted-foreground">Active Users</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="p-2 bg-slate-100 rounded-lg dark:bg-slate-800">
                                <ShieldAlert className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </div>
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400">
                                24h
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#1c2434] dark:text-white">3</div>
                            <p className="text-xs text-muted-foreground">Security Alerts</p>
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
                            <div className="text-2xl font-bold text-[#1c2434] dark:text-white">45.2K</div>
                            <p className="text-xs text-muted-foreground">Log Entries</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="p-4">
                    <div className="grid gap-4 md:grid-cols-5 items-end">
                        <div className="space-y-2">
                            <span className="text-sm font-medium">Date Range</span>
                            <Input type="date" className="w-full" />
                        </div>
                        <div className="space-y-2">
                            <span className="text-sm font-medium">User</span>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Users" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Users</SelectItem>
                                    <SelectItem value="admin">Admin User</SelectItem>
                                    <SelectItem value="juan">Juan Dela Cruz</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <span className="text-sm font-medium">Action Type</span>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Actions" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Actions</SelectItem>
                                    <SelectItem value="login">Login</SelectItem>
                                    <SelectItem value="create">Create</SelectItem>
                                    <SelectItem value="update">Update</SelectItem>
                                    <SelectItem value="delete">Delete</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <span className="text-sm font-medium">Module</span>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Modules" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Modules</SelectItem>
                                    <SelectItem value="cases">Cases</SelectItem>
                                    <SelectItem value="documents">Documents</SelectItem>
                                    <SelectItem value="users">Users</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button className="bg-[#1c2434] hover:bg-[#2c3a4f] text-white">
                            <Search className="mr-2 h-4 w-4" />
                            Search
                        </Button>
                    </div>
                </Card>

                {/* Activity Log Table */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle>Activity Log</CardTitle>
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search logs..." className="pl-8" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground uppercase border-b">
                                    <tr>
                                        <th className="py-3 px-4 font-medium">Timestamp</th>
                                        <th className="py-3 px-4 font-medium">User</th>
                                        <th className="py-3 px-4 font-medium">Action</th>
                                        <th className="py-3 px-4 font-medium">Module</th>
                                        <th className="py-3 px-4 font-medium">Details</th>
                                        <th className="py-3 px-4 font-medium">IP Address</th>
                                        <th className="py-3 px-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {[
                                        { time: '2025-01-15 14:32:15', rel: '2 minutes ago', user: 'Juan Dela Cruz', role: 'Lupon Member', action: 'UPDATE', module: 'Cases', details: 'Updated case status to "Mediation Scheduled" Case #2025-001', ip: '192.168.1.45' },
                                        { time: '2025-01-15 14:28:42', rel: '6 minutes ago', user: 'Maria Santos', role: 'Secretary', action: 'CREATE', module: 'Documents', details: 'Generated Summons document Case #2025-015', ip: '192.168.1.23' },
                                        { time: '2025-01-15 14:15:33', rel: '19 minutes ago', user: 'Admin User', role: 'Administrator', action: 'LOGIN', module: 'System', details: 'User logged in successfully Session ID: 7f8a9b2c', ip: '192.168.1.10' },
                                        { time: '2025-01-15 14:05:18', rel: '29 minutes ago', user: 'Pedro Reyes', role: 'Lupon Chairman', action: 'UPDATE', module: 'Cases', details: 'Assigned mediators to case Case #2025-012', ip: '192.168.1.67' },
                                        { time: '2025-01-15 13:58:45', rel: '36 minutes ago', user: 'Maria Santos', role: 'Secretary', action: 'CREATE', module: 'Cases', details: 'Created new case record Case #2025-015', ip: '192.168.1.23' },
                                        { time: '2025-01-15 13:42:12', rel: '52 minutes ago', user: 'Admin User', role: 'Administrator', action: 'UPDATE', module: 'Settings', details: 'Modified system notification settings Email notifications enabled', ip: '192.168.1.10' },
                                        { time: '2025-01-15 13:35:28', rel: '59 minutes ago', user: 'Juan Dela Cruz', role: 'Lupon Member', action: 'DELETE', module: 'Documents', details: 'Deleted draft document Document ID: DOC-2025-089', ip: '192.168.1.45' },
                                        { time: '2025-01-15 13:22:55', rel: '1 hour ago', user: 'Pedro Reyes', role: 'Lupon Chairman', action: 'LOGOUT', module: 'System', details: 'User logged out Session duration: 2h 15m', ip: '192.168.1.67' },
                                    ].map((item, index) => (
                                        <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                            <td className="py-3 px-4">
                                                <div className="font-medium">{item.time}</div>
                                                <div className="text-xs text-muted-foreground">{item.rel}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-full bg-slate-200"></div>
                                                    <div>
                                                        <div className="font-medium text-sm">{item.user}</div>
                                                        <div className="text-xs text-muted-foreground">{item.role}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge variant="outline" className="bg-slate-50 dark:bg-slate-900">
                                                    {item.action}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-muted-foreground">{item.module}</td>
                                            <td className="py-3 px-4 text-sm max-w-[300px]">
                                                {item.details}
                                            </td>
                                            <td className="py-3 px-4 text-muted-foreground font-mono text-xs">{item.ip}</td>
                                            <td className="py-3 px-4 text-right">
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                            <div>Showing 1-8 of 1,247 entries</div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" className="h-8 w-8" disabled><ChevronLeft className="h-3 w-3" /></Button>
                                <Button variant="outline" size="icon" className="h-8 w-8 bg-[#1c2434] text-white hover:bg-[#2c3a4f] hover:text-white">1</Button>
                                <Button variant="outline" size="icon" className="h-8 w-8">2</Button>
                                <Button variant="outline" size="icon" className="h-8 w-8">3</Button>
                                <div className="flex items-center justify-center w-8">...</div>
                                <Button variant="outline" size="icon" className="h-8 w-8">156</Button>
                                <Button variant="outline" size="icon" className="h-8 w-8"><ChevronRight className="h-3 w-3" /></Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bottom Section */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Activity by Module */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Activity by Module</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">Cases</span>
                                    <span className="font-bold text-xs">542 activities</span>
                                </div>
                                <Progress value={75} className="h-2 bg-slate-100 dark:bg-slate-800" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">Documents</span>
                                    <span className="font-bold text-xs">389 activities</span>
                                </div>
                                <Progress value={55} className="h-2 bg-slate-100 dark:bg-slate-800" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">Users</span>
                                    <span className="font-bold text-xs">156 activities</span>
                                </div>
                                <Progress value={20} className="h-2 bg-slate-100 dark:bg-slate-800" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">Settings</span>
                                    <span className="font-bold text-xs">98 activities</span>
                                </div>
                                <Progress value={12} className="h-2 bg-slate-100 dark:bg-slate-800" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">Reports</span>
                                    <span className="font-bold text-xs">62 activities</span>
                                </div>
                                <Progress value={8} className="h-2 bg-slate-100 dark:bg-slate-800" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Security Events */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Security Events</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex gap-4">
                                <div className="mt-1 bg-slate-100 p-2 rounded-lg dark:bg-slate-800 h-fit">
                                    <ShieldAlert className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-semibold">Failed Login Attempt</h4>
                                        <span className="text-xs text-muted-foreground">5 min ago</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Multiple failed login attempts from IP 203.45.67.89</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="mt-1 bg-slate-100 p-2 rounded-lg dark:bg-slate-800 h-fit">
                                    <UserX className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-semibold">Account Locked</h4>
                                        <span className="text-xs text-muted-foreground">2 hours ago</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">User account locked due to suspicious activity</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="mt-1 bg-slate-100 p-2 rounded-lg dark:bg-slate-800 h-fit">
                                    <Key className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-semibold">Password Changed</h4>
                                        <span className="text-xs text-muted-foreground">5 hours ago</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Admin user changed password successfully</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </AppLayout>
    );
}
