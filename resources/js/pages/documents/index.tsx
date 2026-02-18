import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
    FileCheck,
    FileMinus,
    Search,
    Download,
    Printer,
    Eye,
    Plus,
    File,
    Scale,
    AlertTriangle,
    Gavel,
    Scroll,
    Calendar,
    Handshake,
    CheckCircle2,
    Mail,
    Reply,
    UserX,
    BadgeCheck,
    ClipboardList,
    BarChart,
    Users,
    UserCheck,
} from 'lucide-react';
import { GenerateDocumentDialog } from '@/components/documents/generate-document-dialog';

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
    // KP Form 7: Complaint Form
    {
        title: 'Complaint Form',
        description: 'KP Form No. 7 - Formal complaint filing',
        icon: FileText,
        type: 'complaint'
    },
    {
        title: 'Summons',
        description: 'KP Form No. 9 - Official notice to appear',
        icon: Bell,
        type: 'summons'
    },
    {
        title: 'Amicable Settlement',
        description: 'KP Form No. 16 - Agreement between parties',
        icon: Handshake,
        type: 'amicable_settlement'
    },
    {
        title: 'Arbitration Award',
        description: 'KP Form No. 15 - Decision by Pangkat/Chairman',
        icon: Gavel,
        type: 'arbitration_award'
    },
    {
        title: 'Repudiation',
        description: 'KP Form No. 17 - Rejection of settlement',
        icon: AlertTriangle,
        type: 'repudiation'
    },
    {
        title: 'Affidavit of Desistance',
        description: 'Statement to desist from complaint',
        icon: FileMinus,
        type: 'affidavit_desistance'
    },
    {
        title: 'Affidavit of Withdrawal',
        description: 'Statement to withdraw complaint',
        icon: FileMinus,
        type: 'affidavit_withdrawal'
    },
    {
        title: 'Notice of Hearing (Conciliation)',
        description: 'Notice for Conciliation Proceedings',
        icon: Calendar,
        type: 'hearing_conciliation'
    },
    {
        title: 'Notice of Hearing (Mediation)',
        description: 'Notice for Mediation Proceedings',
        icon: Calendar,
        type: 'hearing_mediation'
    },
    {
        title: 'Notice of Hearing (Fail. to Appear)',
        description: 'Failure to appear at hearing',
        icon: Calendar,
        type: 'hearing_failure_appear'
    },
    {
        title: 'Notice of Hearing (Counterclaim)',
        description: 'Failure to appear - Counterclaim',
        icon: Calendar,
        type: 'hearing_failure_appear_counterclaim'
    },
    {
        title: 'Certificate to File Action',
        description: 'Authorization to file action',
        icon: Scale,
        type: 'cert_file_action'
    },
    {
        title: 'Certificate to File Action (Court)',
        description: 'Authorization for court filing',
        icon: Scale,
        type: 'cert_file_action_court'
    },
    {
        title: 'Certificate to Bar Action',
        description: 'Barring future action',
        icon: Gavel,
        type: 'cert_bar_action'
    },
    {
        title: 'Certificate to Bar Counterclaim',
        description: 'Barring future counterclaim',
        icon: Gavel,
        type: 'cert_bar_counterclaim'
    },
    {
        title: 'Motion for Execution',
        description: 'Request to enforce agreement',
        icon: Scroll,
        type: 'motion_execution'
    },
    {
        title: 'Notice of Hearing (Execution)',
        description: 'Hearing for motion of execution',
        icon: Scroll,
        type: 'notice_execution'
    },
    {
        title: 'Notice for Constitution of Pangkat',
        description: 'Notice to constitute Pangkat',
        icon: Users,
        type: 'notice_constitution'
    },
    {
        title: 'Notice to Chosen Pangkat Member',
        description: 'Notification of selection',
        icon: UserCheck,
        type: 'notice_chosen_member'
    },
    {
        title: 'Officers Return',
        description: 'Return of service',
        icon: Reply,
        type: 'officers_return'
    },
    {
        title: 'Letter of Demand',
        description: 'Formal demand letter',
        icon: Mail,
        type: 'letter_of_demand'
    },
    {
        title: 'Katunayan ng Pagkakasundo',
        description: 'Certificate of Agreement (Tagalog)',
        icon: BadgeCheck,
        type: 'katunayan_pagkakasundo'
    }
];

interface Document {
    id: number;
    title: string;
    type: string;
    case_number: string;
    status: string;
    date: string; // issued_at
    created_by?: number;
    creator?: { name: string };
}

interface DocumentsProps {
    documents: {
        data: Array<Document>;
        links: any[];
        total?: number;
    };
}

export default function Documents({ documents }: DocumentsProps) {
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
                            <div className="text-2xl font-bold text-[#1c2434] dark:text-white">{documents?.total ?? 0}</div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-medium text-[#1c2434] dark:text-white">Total Documents</div>
                            <p className="text-xs text-muted-foreground">All generated documents</p>
                        </CardContent>
                    </Card>
                    {/* ... other stats kept static for now or can be passed as props later ... */}
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
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                                <BadgeCheck className="h-6 w-6 text-orange-600 dark:text-orange-400" />
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

                                        {/* Link all forms to Visual Editor (using type) */}
                                        <a
                                            href={`/documents/create/${template.type}`}
                                            target="_blank"
                                            className="inline-flex items-center justify-center rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#1c2434] text-white hover:bg-[#2c3a4f] h-7 px-3 mt-2"
                                        >
                                            Open Visual Editor
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Documents - Dynamic */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Documents</CardTitle>
                        <div className="flex items-center space-x-2">
                            {/* Filters ... */}
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
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Document Type</TableHead>
                                        <TableHead>Case Number</TableHead>
                                        <TableHead>Encoded By</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date Issued</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {documents.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                No documents found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        documents.data.map((doc) => (
                                            <TableRow key={doc.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-slate-100 rounded-lg dark:bg-slate-800">
                                                            <FileText className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                                        </div>
                                                        {doc.type.replace(/_/g, ' ').toUpperCase()}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{doc.case_number}</TableCell>
                                                <TableCell>
                                                    {doc.creator ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800">
                                                                <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400">
                                                                    {doc.creator.name.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <span className="text-sm text-muted-foreground">{doc.creator.name}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{doc.status}</Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {new Date(doc.date).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" title="View">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" title="Download">
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
