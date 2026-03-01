import { Head } from '@inertiajs/react';
import {
    Trophy,
    Medal,
    Calendar,
    Star,
    Users,
    CheckCircle,
    TrendingUp,
    Download,
    FileText,
    Heart,
    GraduationCap,
    ChevronLeft,
    ChevronRight,
    Eye
} from 'lucide-react';
import { SubmitApplicationDialog } from '@/components/ltia/submit-application-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';

export default function LTIAPage() {
    const breadcrumbs = [
        {
            title: 'LTIA',
            href: '/ltia',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="LTIA" />

            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 text-slate-900 dark:text-slate-100">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Lupong Tagapamayapa Incentives Awards (LTIA)</h2>
                        <p className="text-muted-foreground">
                            Recognition and incentives program for outstanding performance
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" className="h-9">
                            <Download className="mr-2 h-4 w-4" />
                            Download Guidelines
                        </Button>
                        <SubmitApplicationDialog />
                    </div>
                </div>

                {/* KPI Stats */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="p-2 bg-slate-100 rounded-lg dark:bg-slate-800">
                                <Trophy className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </div>
                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300">
                                2024
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#1c2434] dark:text-white">12</div>
                            <p className="text-xs text-muted-foreground">Total Awards</p>
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
                            <div className="text-2xl font-bold text-[#1c2434] dark:text-white">8</div>
                            <p className="text-xs text-muted-foreground">Nominees</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="p-2 bg-slate-100 rounded-lg dark:bg-slate-800">
                                <Calendar className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </div>
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400">
                                Deadline
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#1c2434] dark:text-white">45</div>
                            <p className="text-xs text-muted-foreground">Days Remaining</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="p-2 bg-slate-100 rounded-lg dark:bg-slate-800">
                                <Star className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </div>
                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300">
                                Status
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#1c2434] dark:text-white">92%</div>
                            <p className="text-xs text-muted-foreground">Completion Rate</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Award Categories */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Award Categories</h3>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {/* Card 1 */}
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="mb-2 p-2 w-fit bg-slate-100 rounded-lg dark:bg-slate-800">
                                    <Medal className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                </div>
                                <CardTitle className="text-base">Best Lupon</CardTitle>
                                <CardDescription>
                                    Awarded to the most outstanding Lupong Tagapamayapa with exceptional performance in case resolution.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-green-500" /> Minimum 50 resolved cases
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-green-500" /> 90% settlement rate
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-green-500" /> Zero pending complaints
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full">View Details</Button>
                            </CardContent>
                        </Card>

                        {/* Card 2 */}
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="mb-2 p-2 w-fit bg-slate-100 rounded-lg dark:bg-slate-800">
                                    <Users className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                </div>
                                <CardTitle className="text-base">Outstanding Chairman</CardTitle>
                                <CardDescription>
                                    Recognition for exceptional leadership, case management skills, and dedication to community peace.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-green-500" /> 3+ years of service
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-green-500" /> Exemplary leadership
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-green-500" /> Community recognition
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full">View Details</Button>
                            </CardContent>
                        </Card>

                        {/* Card 3 */}
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="mb-2 p-2 w-fit bg-slate-100 rounded-lg dark:bg-slate-800">
                                    <Users className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                </div>
                                <CardTitle className="text-base">Best Mediator</CardTitle>
                                <CardDescription>
                                    Awarded to mediators who demonstrate exceptional skills in conflict resolution and amicable settlements.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-green-500" /> 30+ mediated cases
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-green-500" /> 85% success rate
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-green-500" /> Positive feedback
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full">View Details</Button>
                            </CardContent>
                        </Card>

                        {/* Card 4 */}
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="mb-2 p-2 w-fit bg-slate-100 rounded-lg dark:bg-slate-800">
                                    <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                </div>
                                <CardTitle className="text-base">Most Efficient</CardTitle>
                                <CardDescription>
                                    Recognition for fastest case processing time while maintaining quality and fairness in resolutions.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-green-500" /> Average 15-day resolution
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-green-500" /> Quality maintained
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-green-500" /> No appeals filed
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full">View Details</Button>
                            </CardContent>
                        </Card>

                        {/* Card 5 */}
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="mb-2 p-2 w-fit bg-slate-100 rounded-lg dark:bg-slate-800">
                                    <Heart className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                </div>
                                <CardTitle className="text-base">Community Service</CardTitle>
                                <CardDescription>
                                    Honors members who go beyond their duties to serve the community and promote peace and harmony.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-green-500" /> Community programs
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-green-500" /> Volunteer activities
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-green-500" /> Outreach initiatives
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full">View Details</Button>
                            </CardContent>
                        </Card>

                        {/* Card 6 */}
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="mb-2 p-2 w-fit bg-slate-100 rounded-lg dark:bg-slate-800">
                                    <GraduationCap className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                </div>
                                <CardTitle className="text-base">Innovation Award</CardTitle>
                                <CardDescription>
                                    Recognizes creative approaches and innovative solutions in case management and dispute resolution.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-green-500" /> New methodologies
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-green-500" /> Process improvements
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-green-500" /> Measurable impact
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full">View Details</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Metrics & Timeline Grid */}
                <div className="grid gap-6 md:grid-cols-7">
                    {/* Performance Metrics */}
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Performance Metrics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">Case Resolution Rate</span>
                                    <span className="font-bold">87%</span>
                                </div>
                                <Progress value={87} className="h-3" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">Settlement Success</span>
                                    <span className="font-bold">92%</span>
                                </div>
                                <Progress value={92} className="h-3" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">Community Satisfaction</span>
                                    <span className="font-bold">95%</span>
                                </div>
                                <Progress value={95} className="h-3" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">Timely Resolution</span>
                                    <span className="font-bold">78%</span>
                                </div>
                                <Progress value={78} className="h-3" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">Documentation Quality</span>
                                    <span className="font-bold">89%</span>
                                </div>
                                <Progress value={89} className="h-3" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timeline */}
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Application Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1c2434] text-white text-xs font-bold">1</div>
                                        <div className="h-full w-px bg-slate-200 dark:bg-slate-800 my-1"></div>
                                    </div>
                                    <div className="space-y-1 pb-4">
                                        <h4 className="text-sm font-semibold">Nomination Period</h4>
                                        <p className="text-xs text-muted-foreground">January 1 - February 28, 2025</p>
                                        <Progress value={100} className="h-1.5 w-full mt-2" />
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-600 text-xs font-bold dark:bg-slate-800 dark:text-slate-400">2</div>
                                        <div className="h-full w-px bg-slate-200 dark:bg-slate-800 my-1"></div>
                                    </div>
                                    <div className="space-y-1 pb-4">
                                        <h4 className="text-sm font-semibold">Evaluation Period</h4>
                                        <p className="text-xs text-muted-foreground">March 1 - March 31, 2025</p>
                                        <Progress value={0} className="h-1.5 w-full mt-2" />
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-600 text-xs font-bold dark:bg-slate-800 dark:text-slate-400">3</div>
                                        <div className="h-full w-px bg-slate-200 dark:bg-slate-800 my-1"></div>
                                    </div>
                                    <div className="space-y-1 pb-4">
                                        <h4 className="text-sm font-semibold">Deliberation</h4>
                                        <p className="text-xs text-muted-foreground">April 1 - April 15, 2025</p>
                                        <Progress value={0} className="h-1.5 w-full mt-2" />
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-600 text-xs font-bold dark:bg-slate-800 dark:text-slate-400">4</div>
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-semibold">Awarding Ceremony</h4>
                                        <p className="text-xs text-muted-foreground">April 30, 2025</p>
                                        <Progress value={0} className="h-1.5 w-full mt-2" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Award History Table */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Award History</CardTitle>
                        <Button variant="outline" size="sm" className="h-8">
                            2024 <ChevronLeft className="ml-2 h-3 w-3" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground uppercase border-b">
                                    <tr>
                                        <th className="py-3 px-4 font-medium">Year</th>
                                        <th className="py-3 px-4 font-medium">Award Category</th>
                                        <th className="py-3 px-4 font-medium">Recipient</th>
                                        <th className="py-3 px-4 font-medium">Position</th>
                                        <th className="py-3 px-4 font-medium">Achievement</th>
                                        <th className="py-3 px-4 font-medium">Status</th>
                                        <th className="py-3 px-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {[
                                        { year: '2024', category: 'Best Lupon', recipient: 'Barangay 183', position: 'Collective', achievement: '95% settlement rate, 120 cases resolved', status: 'Awarded' },
                                        { year: '2024', category: 'Outstanding Chairman', recipient: 'Pedro Reyes', position: 'Chairman', achievement: '10 years service, exemplary leadership', status: 'Awarded' },
                                        { year: '2023', category: 'Best Mediator', recipient: 'Maria Santos', position: 'Secretary', achievement: '45 mediated cases, 90% success rate', status: 'Awarded' },
                                        { year: '2023', category: 'Most Efficient', recipient: 'Juan Dela Cruz', position: 'Lupon Member', achievement: '12 day average resolution time', status: 'Awarded' },
                                        { year: '2022', category: 'Community Service', recipient: 'Rosa Garcia', position: 'Lupon Member', achievement: '15 community programs organized', status: 'Awarded' },
                                    ].map((item, index) => (
                                        <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                            <td className="py-3 px-4 font-medium">{item.year}</td>
                                            <td className="py-3 px-4">{item.category}</td>
                                            <td className="py-3 px-4 flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-slate-200"></div>
                                                {item.recipient}
                                            </td>
                                            <td className="py-3 px-4 text-muted-foreground">{item.position}</td>
                                            <td className="py-3 px-4 text-muted-foreground truncate max-w-[200px]">{item.achievement}</td>
                                            <td className="py-3 px-4">
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300">
                                                    {item.status}
                                                </Badge>
                                            </td>
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
                            <div>Showing 1-5 of 28 awards</div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" className="h-8 w-8" disabled><ChevronLeft className="h-3 w-3" /></Button>
                                <Button variant="outline" size="icon" className="h-8 w-8 bg-[#1c2434] text-white hover:bg-[#2c3a4f] hover:text-white">1</Button>
                                <Button variant="outline" size="icon" className="h-8 w-8">2</Button>
                                <Button variant="outline" size="icon" className="h-8 w-8">3</Button>
                                <Button variant="outline" size="icon" className="h-8 w-8"><ChevronRight className="h-3 w-3" /></Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
