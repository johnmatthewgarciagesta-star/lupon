import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Download,
    Plus,
    Filter,
    X,
    MoreVertical,
    Eye,
    Edit,
    Archive,
    Printer,
    Search
} from 'lucide-react';

const cases = [
    {
        id: 'LT-2024-0248',
        type: 'Property Dispute',
        complainant: 'Juan Dela Cruz',
        respondent: 'Pedro Santos',
        date: 'May 15, 2024',
        status: 'Pending',
    },
    {
        id: 'LT-2024-0247',
        type: 'Noise Complaint',
        complainant: 'Maria Santos',
        respondent: 'Ana Garcia',
        date: 'May 14, 2024',
        status: 'Resolved',
    },
    {
        id: 'LT-2024-0246',
        type: 'Debt Collection',
        complainant: 'Pedro Reyes',
        respondent: 'Carlos Lopez',
        date: 'May 13, 2024',
        status: 'Mediation',
    },
    {
        id: 'LT-2024-0245',
        type: 'Family Dispute',
        complainant: 'Ana Garcia',
        respondent: 'Roberto Garcia',
        date: 'May 12, 2024',
        status: 'Resolved',
    },
    {
        id: 'LT-2024-0244',
        type: 'Boundary Issue',
        complainant: 'Roberto Cruz',
        respondent: 'Miguel Torres',
        date: 'May 11, 2024',
        status: 'Pending',
    },
    {
        id: 'LT-2024-0243',
        type: 'Property Dispute',
        complainant: 'Sofia Mendoza',
        respondent: 'Luis Ramos',
        date: 'May 10, 2024',
        status: 'Mediation',
    },
    {
        id: 'LT-2024-0242',
        type: 'Noise Complaint',
        complainant: 'Diego Fernandez',
        respondent: 'Carmen Silva',
        date: 'May 09, 2024',
        status: 'Resolved',
    },
    {
        id: 'LT-2024-0241',
        type: 'Debt Collection',
        complainant: 'Elena Morales',
        respondent: 'Jose Castillo',
        date: 'May 08, 2024',
        status: 'Pending',
    },
    {
        id: 'LT-2024-0240',
        type: 'Family Dispute',
        complainant: 'Ricardo Navarro',
        respondent: 'Isabel Navarro',
        date: 'May 07, 2024',
        status: 'Mediation',
    },
    {
        id: 'LT-2024-0239',
        type: 'Boundary Issue',
        complainant: 'Lucia Herrera',
        respondent: 'Antonio Diaz',
        date: 'May 06, 2024',
        status: 'Resolved',
    },
];

export default function CaseManagement() {
    const breadcrumbs = [
        {
            title: 'Case Management',
            href: '/cases',
        },
    ];

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Resolved':
                return 'secondary'; // Using secondary for resolved based on image (greyish)
            case 'Pending':
                return 'outline'; // Using outline for pending
            case 'Mediation':
                return 'secondary';
            default:
                return 'default';
        }
    };

    // Custom badge styles to match the image precisely
    const getBadgeStyles = (status: string) => {
        switch (status) {
            case 'Resolved':
                return 'bg-slate-200 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 border-0';
            case 'Pending':
                return 'bg-slate-100 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
            case 'Mediation':
                return 'bg-slate-200 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 border-0';
            default:
                return '';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Case Management" />

            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 text-slate-900 dark:text-slate-100">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Case Management</h2>
                        <p className="text-muted-foreground">
                            View and manage all Lupon Tagapamayapa cases
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">

                        <Button className="h-9 bg-[#1c2434] hover:bg-[#2c3a4f] text-white">
                            <Plus className="mr-2 h-4 w-4" />
                            New Case
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card className="rounded-lg border bg-card text-card-foreground shadow-sm">
                    <CardContent className="p-6 space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Search Cases
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by case number, name, or type..."
                                        className="pl-8"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Status
                                </label>
                                <Select defaultValue="all">
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                        <SelectItem value="mediation">Mediation</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Case Type
                                </label>
                                <Select defaultValue="all">
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="property">Property Dispute</SelectItem>
                                        <SelectItem value="noise">Noise Complaint</SelectItem>
                                        <SelectItem value="money">Debt Collection</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-8">
                                <Filter className="mr-2 h-3 w-3" />
                                More Filters
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 text-muted-foreground">
                                <X className="mr-2 h-3 w-3" />
                                Clear Filters
                            </Button>
                            <div className="ml-auto text-sm text-muted-foreground">
                                Showing <span className="font-medium">248</span> cases
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <div className="rounded-md border bg-card shadow-sm">
                    <div className="p-4 flex items-center justify-between border-b">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="select-all" />
                            <label
                                htmlFor="select-all"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Select All
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                                <Archive className="mr-2 h-4 w-4" />
                                Archive
                            </Button>
                            <Button variant="outline" size="sm">
                                <Printer className="mr-2 h-4 w-4" />
                                Print
                            </Button>
                        </div>
                    </div>

                    {/* Note: In a real app we'd use the shadcn/ui Table component. 
                        For now, since I don't see table.tsx in the file list, I'll assume standard HTML table or if it exists I'd use it.
                        The plan mentioned table.tsx might be missing. I'll use standard tailwind table structure if I can't find it,
                        but I'll try to use the imported components if they work, otherwise standard HTML.
                        Wait, I imported Table components, let me use them.
                    */}

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase border-b bg-slate-50/50 dark:bg-slate-900/50">
                                <tr>
                                    <th className="p-4 w-[50px]">
                                        <Checkbox />
                                    </th>
                                    <th className="py-3 px-4 font-medium">Case Number</th>
                                    <th className="py-3 px-4 font-medium">Case Type</th>
                                    <th className="py-3 px-4 font-medium">Complainant</th>
                                    <th className="py-3 px-4 font-medium">Respondent</th>
                                    <th className="py-3 px-4 font-medium">Date Filed</th>
                                    <th className="py-3 px-4 font-medium">Status</th>
                                    <th className="py-3 px-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {cases.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                        <td className="p-4">
                                            <Checkbox />
                                        </td>
                                        <td className="py-3 px-4 font-medium text-[#1c2434] dark:text-white">{item.id}</td>
                                        <td className="py-3 px-4 text-muted-foreground">{item.type}</td>
                                        <td className="py-3 px-4 text-muted-foreground">{item.complainant}</td>
                                        <td className="py-3 px-4 text-muted-foreground">{item.respondent}</td>
                                        <td className="py-3 px-4 text-muted-foreground">{item.date}</td>
                                        <td className="py-3 px-4">
                                            <Badge variant="outline" className={`font-normal rounded-full ${getBadgeStyles(item.status)}`}>
                                                {item.status}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-[#1c2434]">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-[#1c2434]">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-[#1c2434]">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between px-4 py-4 border-t">
                        <div className="text-sm text-muted-foreground">
                            Showing 1-10 of 248 cases
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled>
                                &lt;
                            </Button>
                            <Button variant="default" size="sm" className="h-8 w-8 p-0 bg-[#1c2434] text-white">
                                1
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                2
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                3
                            </Button>
                            <span className="text-muted-foreground">...</span>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                25
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                &gt;
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
