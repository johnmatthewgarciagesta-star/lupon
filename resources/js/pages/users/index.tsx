import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Users,
    UserCheck,
    Shield,
    UserX,
    Search,
    Filter,
    Edit,
    Key,
    MoreHorizontal,
    Download,
    Plus
} from 'lucide-react';

const stats = [
    {
        title: 'Total Users',
        value: '24',
        subtext: '+2 this month',
        icon: Users,
        iconBg: 'bg-slate-100 dark:bg-slate-800',
    },
    {
        title: 'Active Users',
        value: '21',
        subtext: '87.5% active rate',
        icon: UserCheck,
        iconBg: 'bg-slate-100 dark:bg-slate-800',
    },
    {
        title: 'Administrators',
        value: '3',
        subtext: 'Full access',
        icon: Shield,
        iconBg: 'bg-slate-100 dark:bg-slate-800',
    },
    {
        title: 'Inactive Users',
        value: '3',
        subtext: 'Suspended accounts',
        icon: UserX,
        iconBg: 'bg-slate-100 dark:bg-slate-800',
    },
];

const usersData = [
    {
        id: 1,
        name: 'Juan Dela Cruz',
        email: 'juan.delacruz@brgy183.gov.ph',
        role: 'Administrator',
        status: 'Active',
        lastLogin: '2 hours ago',
        cases: 156,
        initials: 'JD',
        color: 'bg-slate-200'
    },
    {
        id: 2,
        name: 'Maria Santos',
        email: 'maria.santos@brgy183.gov.ph',
        role: 'Secretary',
        status: 'Active',
        lastLogin: '5 hours ago',
        cases: 203,
        initials: 'MS',
        color: 'bg-slate-200'
    },
    {
        id: 3,
        name: 'Pedro Reyes',
        email: 'pedro.reyes@brgy183.gov.ph',
        role: 'Lupon Member',
        status: 'Active',
        lastLogin: '1 day ago',
        cases: 89,
        initials: 'PR',
        color: 'bg-slate-200'
    },
    {
        id: 4,
        name: 'Ana Garcia',
        email: 'ana.garcia@brgy183.gov.ph',
        role: 'Staff',
        status: 'Active',
        lastLogin: '3 hours ago',
        cases: 124,
        initials: 'AG',
        color: 'bg-slate-200'
    },
    {
        id: 5,
        name: 'Roberto Torres',
        email: 'roberto.torres@brgy183.gov.ph',
        role: 'Lupon Member',
        status: 'Inactive',
        lastLogin: '2 weeks ago',
        cases: 67,
        initials: 'RT',
        color: 'bg-slate-200'
    },
    {
        id: 6,
        name: 'Linda Cruz',
        email: 'linda.cruz@brgy183.gov.ph',
        role: 'Staff',
        status: 'Active',
        lastLogin: '6 hours ago',
        cases: 98,
        initials: 'LC',
        color: 'bg-slate-200'
    },
    {
        id: 7,
        name: 'Miguel Villanueva',
        email: 'miguel.v@brgy183.gov.ph',
        role: 'Lupon Member',
        status: 'Active',
        lastLogin: '4 hours ago',
        cases: 112,
        initials: 'MV',
        color: 'bg-slate-200'
    }
];

const activities = [
    {
        user: 'Ana Garcia',
        action: 'was added to the system',
        time: '2 hours ago',
        icon: Users, // Using generic user icon as placeholder for 'added'
        initials: 'AG'
    },
    {
        user: 'Maria Santos',
        action: 'changed password',
        time: '5 hours ago',
        icon: Key,
        initials: 'MS'
    },
    {
        user: 'Roberto Torres',
        action: 'account deactivated',
        time: '2 days ago',
        icon: UserX,
        initials: 'RT'
    },
    {
        user: 'Pedro Reyes',
        action: 'role changed to Lupon Member',
        time: '3 days ago',
        icon: Shield,
        initials: 'PR'
    }
];

export default function UsersPage() {
    const breadcrumbs = [
        {
            title: 'Users',
            href: '/users',
        },
    ];

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'Administrator':
                return 'bg-[#1c2434] text-white hover:bg-[#1c2434]/90';
            case 'Secretary':
                return 'bg-[#1c2434] text-white hover:bg-[#1c2434]/90';
            case 'Lupon Member':
                return 'bg-slate-500 text-white hover:bg-slate-600';
            case 'Staff':
                return 'bg-slate-400 text-white hover:bg-slate-500';
            default:
                return 'bg-slate-100 text-slate-800';
        }
    };

    const getStatusBadgeColor = (status: string) => {
        return status === 'Active'
            ? 'bg-slate-100 text-slate-600 hover:bg-slate-100 border-0'
            : 'bg-slate-100 text-slate-500 hover:bg-slate-100 border-0';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users Management" />

            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 text-slate-900 dark:text-slate-100">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Users Management</h2>
                        <p className="text-muted-foreground">
                            Manage system users and permissions
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" className="h-9">
                            <Download className="mr-2 h-4 w-4" />
                            Export Users
                        </Button>
                        <Button className="h-9 bg-[#1c2434] hover:bg-[#2c3a4f] text-white">
                            <Plus className="mr-2 h-4 w-4" />
                            Add User
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <Card key={stat.title}>
                            <CardContent className="p-6 flex flex-row items-center justify-between space-y-0">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">
                                        {stat.title}
                                    </p>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {stat.subtext}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-full ${stat.iconBg}`}>
                                    <stat.icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* User Management Table */}
                <Card>
                    <CardContent className="p-6">
                        {/* Filters */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search users by name, email, or role..."
                                    className="pl-8"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Select defaultValue="all">
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="All Roles" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        <SelectItem value="admin">Administrator</SelectItem>
                                        <SelectItem value="secretary">Secretary</SelectItem>
                                        <SelectItem value="lupon">Lupon Member</SelectItem>
                                        <SelectItem value="staff">Staff</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select defaultValue="all">
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button variant="outline" size="icon">
                                    <Filter className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground border-b bg-transparent">
                                    <tr>
                                        <th className="py-3 px-4 w-10">
                                            <input type="checkbox" className="rounded border-slate-300" />
                                        </th>
                                        <th className="py-3 font-medium">User</th>
                                        <th className="py-3 font-medium">Role</th>
                                        <th className="py-3 font-medium">Status</th>
                                        <th className="py-3 font-medium">Last Login</th>
                                        <th className="py-3 font-medium">Cases Handled</th>
                                        <th className="py-3 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {usersData.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                            <td className="py-4 px-4">
                                                <input type="checkbox" className="rounded border-slate-300" />
                                            </td>
                                            <td className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 bg-slate-200">
                                                        <AvatarFallback className="bg-slate-200 text-slate-700">{user.initials}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium text-slate-900 dark:text-slate-100">{user.name}</div>
                                                        <div className="text-xs text-muted-foreground">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <Badge className={`${getRoleBadgeColor(user.role)} font-normal rounded-full px-3`}>
                                                    {user.role}
                                                </Badge>
                                            </td>
                                            <td className="py-4">
                                                <Badge variant="secondary" className={`${getStatusBadgeColor(user.status)} font-normal rounded-xl px-3`}>
                                                    {user.status}
                                                </Badge>
                                            </td>
                                            <td className="py-4 text-muted-foreground">{user.lastLogin}</td>
                                            <td className="py-4 text-muted-foreground">{user.cases}</td>
                                            <td className="py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-[#1c2434]">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-[#1c2434]">
                                                        <Key className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-[#1c2434]">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-muted-foreground">
                                Showing 1 to 7 of 24 users
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="outline" size="sm" className="h-8">Previous</Button>
                                <Button variant="default" size="sm" className="h-8 bg-[#1c2434] hover:bg-[#2c3a4f] text-white w-8 p-0">1</Button>
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0">2</Button>
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0">3</Button>
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0">4</Button>
                                <Button variant="outline" size="sm" className="h-8">Next</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bottom Section */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* User Roles Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle>User Roles Distribution</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">Administrator</span>
                                    <span className="font-bold">3 (12.5%)</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full dark:bg-slate-800">
                                    <div className="h-full bg-slate-900 rounded-full w-[12.5%]"></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">Secretary</span>
                                    <span className="font-bold">2 (8.3%)</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full dark:bg-slate-800">
                                    <div className="h-full bg-slate-900 rounded-full w-[8.3%]"></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">Lupon Member</span>
                                    <span className="font-bold">12 (50%)</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full dark:bg-slate-800">
                                    <div className="h-full bg-slate-600 rounded-full w-[50%]"></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">Staff</span>
                                    <span className="font-bold">7 (29.2%)</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full dark:bg-slate-800">
                                    <div className="h-full bg-slate-400 rounded-full w-[29.2%]"></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                {activities.map((activity, index) => (
                                    <div key={index} className="flex">
                                        <div className="mr-4 relative">
                                            {/* Line connector */}
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
            </div>
        </AppLayout>
    );
}
