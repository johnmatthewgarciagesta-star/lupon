import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
    Bell,
    CheckCircle,
    FileCheck,
    Search,
    Download,
    Printer,
    Eye,
    Plus,
    File,
    Scale,
    Gavel,
    Scroll,
    AlertCircle
} from 'lucide-react';

const recentDocuments = [
    {
        id: '1',
        title: 'Summons - LT-2024-0248',
        description: 'Juan Dela Cruz vs Pedro Santos • Generated May 15, 2024',
        icon: Bell,
    },
    {
        id: '2',
        title: 'Settlement Agreement - LT-2024-0247',
        description: 'Maria Santos vs Ana Garcia • Generated May 14, 2024',
        icon: FileCheck,
    },
    {
        id: '3',
        title: 'Notice of Hearing - LT-2024-0246',
        description: 'Pedro Reyes vs Carlos Lopez • Generated May 13, 2024',
        icon: FileText,
    },
    {
        id: '4',
        title: 'Certificate to File Action - LT-2024-0245',
        description: 'Ana Garcia vs Roberto Garcia • Generated May 12, 2024',
        icon: Scale,
    },
    {
        id: '5',
        title: 'Minutes of Hearing - LT-2024-0244',
        description: 'Roberto Cruz vs Miguel Torres • Generated May 11, 2024',
        icon: File,
    },
];

const templates = [
    {
        title: 'Summons',
        description: 'Official notice to appear before the Lupon',
        icon: Bell,
    },
    {
        title: 'Notice of Hearing',
        description: 'Formal hearing notification document',
        icon: FileText,
    },
    {
        title: 'Settlement Agreement',
        description: 'Amicable settlement between parties',
        icon: FileCheck,
    },
    {
        title: 'Certificate to File Action',
        description: 'Authorization to proceed to court',
        icon: Scale,
    },
    {
        title: 'Minutes of Hearing',
        description: 'Official record of proceedings',
        icon: File,
    },
    {
        title: 'Reprimand Notice',
        description: 'Official warning or reprimand',
        icon: AlertCircle,
    },
];

export default function Documents() {
    const breadcrumbs = [
        {
            title: 'Documents',
            href: '/documents',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Documents" />

            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 text-slate-900 dark:text-slate-100">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Document Management</h2>
                        <p className="text-muted-foreground">
                            Generate and manage official Lupon documents
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" className="h-9">
                            <FileText className="mr-2 h-4 w-4" />
                            Templates
                        </Button>
                        <Button className="h-9 bg-[#1c2434] hover:bg-[#2c3a4f] text-white">
                            <Plus className="mr-2 h-4 w-4" />
                            Generate Document
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="p-2 bg-slate-100 rounded-lg dark:bg-slate-800">
                                <FileText className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </div>
                            <div className="text-2xl font-bold text-[#1c2434] dark:text-white">1,247</div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-medium text-[#1c2434] dark:text-white">Total Documents</div>
                            <p className="text-xs text-muted-foreground">All generated documents</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="p-2 bg-slate-100 rounded-lg dark:bg-slate-800">
                                <FileText className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </div>
                            <div className="text-2xl font-bold text-[#1c2434] dark:text-white">892</div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-medium text-[#1c2434] dark:text-white">Summons Issued</div>
                            <p className="text-xs text-muted-foreground">Official summons sent</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="p-2 bg-slate-100 rounded-lg dark:bg-slate-800">
                                <FileCheck className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </div>
                            <div className="text-2xl font-bold text-[#1c2434] dark:text-white">234</div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-medium text-[#1c2434] dark:text-white">Agreements</div>
                            <p className="text-xs text-muted-foreground">Settlement agreements</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="p-2 bg-slate-100 rounded-lg dark:bg-slate-800">
                                <Scale className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </div>
                            <div className="text-2xl font-bold text-[#1c2434] dark:text-white">121</div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-medium text-[#1c2434] dark:text-white">Certificates</div>
                            <p className="text-xs text-muted-foreground">Issued certificates</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Document Templates */}
                <Card>
                    <CardHeader>
                        <CardTitle>Document Templates</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {templates.map((template) => (
                                <div key={template.title} className="flex items-start space-x-4 p-4 rounded-lg border bg-card text-card-foreground shadow-sm hover:border-[#1c2434]/20 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                                    <div className="p-2 bg-slate-100 rounded-lg dark:bg-slate-800 mt-1">
                                        <template.icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">{template.title}</p>
                                        <p className="text-xs text-muted-foreground">{template.description}</p>
                                        <Button size="sm" className="h-7 text-xs bg-[#1c2434] text-white hover:bg-[#2c3a4f] mt-2">
                                            Generate
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Documents */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Documents</CardTitle>
                        <div className="flex items-center space-x-2">
                            <Select defaultValue="all">
                                <SelectTrigger className="w-[120px] h-9">
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="summons">Summons</SelectItem>
                                    <SelectItem value="agreement">Agreement</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search documents..."
                                    className="h-9 w-[250px] pl-8"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentDocuments.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-2 bg-slate-100 rounded-lg dark:bg-slate-800">
                                            <doc.icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium leading-none">{doc.title}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{doc.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-[#1c2434]">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-[#1c2434]">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-[#1c2434]">
                                            <Printer className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex justify-center">
                            <Button variant="outline" className="text-xs">
                                View All Documents
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
