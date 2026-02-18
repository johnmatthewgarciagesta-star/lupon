
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Label } from '@/components/ui/label';
import {
    Users,
    UserCheck,
    Shield,
    UserX,
    Search,
    Filter,
    Edit,
    Trash2,
    Plus,
    X,
    MoreHorizontal
} from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    duty_group?: string;
    created_at: string;
}

interface Stats {
    total: number;
    active: number;
    inactive: number;
    byRole: Record<string, number>;
}

interface Props {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
        from: number;
        to: number;
        links: any[];
    };
    filters: {
        search?: string;
        role?: string;
        status?: string;
    };
    stats: Stats;
}

export default function PersonnelPage({ users, filters, stats }: Props) {
    const breadcrumbs = [
        {
            title: 'Personnel Management',
            href: '/users',
        },
    ];

    // Filters state
    const [search, setSearch] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get('/users', { search, role: roleFilter, status: statusFilter }, { preserveState: true, replace: true });
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const handleFilterChange = (key: string, value: string) => {
        if (key === 'role') setRoleFilter(value);
        if (key === 'status') setStatusFilter(value);

        router.get('/users', {
            search,
            role: key === 'role' ? value : roleFilter,
            status: key === 'status' ? value : statusFilter
        }, { preserveState: true, replace: true });
    };

    // Form handling
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const form = useForm({
        name: '',
        email: '',
        role: 'Staff',
        status: 'Active',
        duty_group: '',
        password: '',
    });

    const editForm = useForm({
        name: '',
        email: '',
        role: '',
        status: '',
        duty_group: '',
        password: '',
    });

    const openEdit = (user: User) => {
        setSelectedUser(user);
        editForm.setData({
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            duty_group: user.duty_group || '',
            password: '',
        });
        setIsEditOpen(true);
    };

    const submitAdd = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/users', {
            onSuccess: () => {
                setIsAddOpen(false);
                form.reset();
            }
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        editForm.put(`/users/${selectedUser.id}`, {
            onSuccess: () => {
                setIsEditOpen(false);
                editForm.reset();
            }
        });
    };

    const deleteUser = (user: User) => {
        if (confirm(`Are you sure you want to delete ${user.name}?`)) {
            router.delete(`/users/${user.id}`);
        }
    };

    const getRoleBadgeColor = (role: string) => {
        if (role.includes('Admin') || role.includes('Head') || role.includes('Chairman')) return 'bg-[#1c2434] text-white';
        if (role.includes('Secretary')) return 'bg-slate-700 text-white';
        if (role.includes('Pangkat')) return 'bg-blue-600 text-white';
        return 'bg-slate-100 text-slate-800';
    };

    const rolesList = [
        "Data Encoder",
        "Summoner",
        "Lupon Custodian",
        "Pangkat Member",
        "Pangkat Secretary",
        "Pangkat Chairman",
        "Asst. Lupon Head",
        "Lupon Head",
        "Lupon Secretary",
        "Lupon Chairman"
    ];

    const dutyGroups = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    // Stats Cards Data
    const statCards = [
        {
            title: 'Total Personnel',
            value: stats.total,
            icon: Users,
            iconBg: 'bg-slate-100 dark:bg-slate-800',
        },
        {
            title: 'Active Accounts',
            value: stats.active,
            icon: UserCheck,
            iconBg: 'bg-green-100 dark:bg-green-900/30 text-green-600',
        },
        {
            title: 'Inactive Accounts',
            value: stats.inactive,
            icon: UserX,
            iconBg: 'bg-red-100 dark:bg-red-900/30 text-red-600',
        },
        {
            title: 'Lupon Members',
            value: (stats.byRole['Pangkat Member'] || 0) + (stats.byRole['Pangkat Chairman'] || 0) + (stats.byRole['Pangkat Secretary'] || 0),
            icon: Shield,
            iconBg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
        },
    ];

    // Placeholder Activity (Until Phase 2)
    const activities = [
        { user: 'System', action: 'Audit Trail not initialized', time: 'N/A', icon: Shield },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Personnel Management" />

            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 text-slate-900 dark:text-slate-100">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Personnel Management</h2>
                        <p className="text-muted-foreground">
                            Manage Lupon staff, members, and system access
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                            <DialogTrigger asChild>
                                <Button className="h-9 bg-[#1c2434] hover:bg-[#2c3a4f] text-white">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Personnel
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Add New Personnel</DialogTitle>
                                    <DialogDescription>
                                        Create a new account for a staff member or Lupon official.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={submitAdd} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input id="name" value={form.data.name} onChange={e => form.setData('name', e.target.value)} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input id="email" type="email" value={form.data.email} onChange={e => form.setData('email', e.target.value)} required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="role">Role</Label>
                                            <Select value={form.data.role} onValueChange={(val) => form.setData('role', val)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {rolesList.map(role => (
                                                        <SelectItem key={role} value={role}>{role}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="status">Status</Label>
                                            <Select value={form.data.status} onValueChange={(val) => form.setData('status', val)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Active">Active</SelectItem>
                                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {form.data.role.includes('Pangkat') && (
                                        <div className="space-y-2">
                                            <Label htmlFor="duty_group">Duty Group</Label>
                                            <Select value={form.data.duty_group} onValueChange={(val) => form.setData('duty_group', val)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select day" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {dutyGroups.map(day => (
                                                        <SelectItem key={day} value={day}>{day}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input id="password" type="password" value={form.data.password} onChange={e => form.setData('password', e.target.value)} required />
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" disabled={form.processing}>Create Personnel</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((stat) => (
                        <Card key={stat.title}>
                            <CardContent className="p-6 flex flex-row items-center justify-between space-y-0">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">
                                        {stat.title}
                                    </p>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                </div>
                                <div className={`p-3 rounded-full ${stat.iconBg}`}>
                                    <stat.icon className="h-5 w-5" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or email..."
                                    className="pl-8"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-2">
                                <Select value={roleFilter} onValueChange={(val) => handleFilterChange('role', val)}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="All Roles" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        {rolesList.map(role => (
                                            <SelectItem key={role} value={role}>{role}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button variant="ghost" onClick={() => { setSearch(''); setRoleFilter('all'); setStatusFilter('all'); router.get('/users'); }}>
                                    <X className="mr-2 h-4 w-4" /> Clear
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Personnel</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Duty Group</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.data.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">{user.name}</div>
                                                        <div className="text-xs text-muted-foreground">{user.email}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${getRoleBadgeColor(user.role)} font-normal`}>
                                                    {user.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {user.duty_group ? (
                                                    <Badge variant="outline">{user.duty_group}</Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={user.status === 'Active' ? 'default' : 'secondary'} className={user.status === 'Active' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}>
                                                    {user.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => openEdit(user)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => deleteUser(user)} className="text-red-500 hover:text-red-700">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="mt-4">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Showing {users.from} to {users.to} of {users.total} entries
                                </div>
                                <div className="flex gap-1">
                                    {users.links.map((link, i) => (
                                        <Button
                                            key={i}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => link.url && router.visit(link.url)}
                                            disabled={!link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bottom Section: Distribution & Activity */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* User Roles Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Role Distribution</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {Object.entries(stats.byRole).map(([role, count]) => {
                                const percentage = Math.round((count / stats.total) * 100);
                                return (
                                    <div key={role} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium text-slate-700 dark:text-slate-300">{role}</span>
                                            <span className="font-bold">{count} ({percentage}%)</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full dark:bg-slate-800">
                                            <div
                                                className={`h-full rounded-full ${role.includes('Head') ? 'bg-[#1c2434]' : 'bg-slate-500'}`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                            {Object.keys(stats.byRole).length === 0 && (
                                <div className="text-sm text-muted-foreground text-center py-4">No personnel data available.</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Activity (Placeholder) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                {activities.map((activity, index) => (
                                    <div key={index} className="flex">
                                        <div className="mr-4 relative">
                                            {index !== activities.length - 1 && (
                                                <div className="absolute left-[15px] top-8 bottom-[-32px] w-[1px] bg-slate-200 dark:bg-slate-800"></div>
                                            )}
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800">
                                                <activity.icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                <span className="font-bold">{activity.user}</span> {activity.action}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {activity.time}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Edit Dialog */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Edit Personnel</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submitEdit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Full Name</Label>
                                <Input id="edit-name" value={editForm.data.name} onChange={e => editForm.setData('name', e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-email">Email Address</Label>
                                <Input id="edit-email" type="email" value={editForm.data.email} onChange={e => editForm.setData('email', e.target.value)} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-role">Role</Label>
                                    <Select value={editForm.data.role} onValueChange={(val) => editForm.setData('role', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {rolesList.map(role => (
                                                <SelectItem key={role} value={role}>{role}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-status">Status</Label>
                                    <Select value={editForm.data.status} onValueChange={(val) => editForm.setData('status', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="Inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {editForm.data.role.includes('Pangkat') && (
                                <div className="space-y-2">
                                    <Label htmlFor="edit-duty_group">Duty Group</Label>
                                    <Select value={editForm.data.duty_group} onValueChange={(val) => editForm.setData('duty_group', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select day" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {dutyGroups.map(day => (
                                                <SelectItem key={day} value={day}>{day}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="edit-password">New Password (Optional)</Label>
                                <Input id="edit-password" type="password" value={editForm.data.password} onChange={e => editForm.setData('password', e.target.value)} placeholder="Leave blank to keep current" />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={editForm.processing}>Save Changes</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
