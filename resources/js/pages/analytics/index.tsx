import { Head } from '@inertiajs/react';
import {
    TrendingUp,
    Clock,
    CheckCircle,
    Users,
    Download,
    Calendar
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';

export default function Analytics() {
    const breadcrumbs = [
        {
            title: 'Analytics',
            href: '/analytics',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Analytics" />

            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 text-slate-900 dark:text-slate-100">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Analytics & Insights</h2>
                        <p className="text-muted-foreground">
                            Data trends and case statistics
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Select defaultValue="30">
                            <SelectTrigger className="w-[140px] h-9">
                                <SelectValue placeholder="Period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="30">Last 30 Days</SelectItem>
                                <SelectItem value="90">Last 3 Months</SelectItem>
                                <SelectItem value="180">Last 6 Months</SelectItem>
                                <SelectItem value="365">Last Year</SelectItem>
                            </SelectContent>
                        </Select>

                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="p-2 bg-slate-100 rounded-lg dark:bg-slate-800">
                                <TrendingUp className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </div>
                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                +12%
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-medium text-muted-foreground">Case Growth Rate</div>
                            <div className="text-2xl font-bold text-[#1c2434] dark:text-white">12.5%</div>
                            <p className="text-xs text-muted-foreground">vs previous period</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="p-2 bg-slate-100 rounded-lg dark:bg-slate-800">
                                <Clock className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </div>
                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                -8%
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-medium text-muted-foreground">Avg Resolution Time</div>
                            <div className="text-2xl font-bold text-[#1c2434] dark:text-white">18 days</div>
                            <p className="text-xs text-muted-foreground">vs previous period</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="p-2 bg-slate-100 rounded-lg dark:bg-slate-800">
                                <CheckCircle className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </div>
                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                +5%
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-medium text-muted-foreground">Settlement Rate</div>
                            <div className="text-2xl font-bold text-[#1c2434] dark:text-white">78.3%</div>
                            <p className="text-xs text-muted-foreground">vs previous period</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="p-2 bg-slate-100 rounded-lg dark:bg-slate-800">
                                <Users className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </div>
                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                +15%
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-medium text-muted-foreground">Active Cases</div>
                            <div className="text-2xl font-bold text-[#1c2434] dark:text-white">142</div>
                            <p className="text-xs text-muted-foreground">currently pending</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Area 1 */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Monthly Case Trends</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[250px] w-full flex items-end gap-2 p-4 relative">
                                {/* Simple SVG Line Chart */}
                                <svg className="w-full h-full absolute top-0 left-0" viewBox="0 0 100 50" preserveAspectRatio="none">
                                    {/* Grid Lines */}
                                    <line x1="0" y1="10" x2="100" y2="10" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2" />
                                    <line x1="0" y1="20" x2="100" y2="20" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2" />
                                    <line x1="0" y1="30" x2="100" y2="30" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2" />
                                    <line x1="0" y1="40" x2="100" y2="40" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2" />

                                    {/* Trend Line (Smooth) */}
                                    <path
                                        d="M0,45 C10,40 15,35 25,35 S35,25 45,28 S55,20 65,18 S75,20 85,15 S95,12 100,10"
                                        fill="none"
                                        stroke="#1c2434"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                    />
                                </svg>

                                {/* X-Axis Labels */}
                                <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-[10px] text-muted-foreground px-2">
                                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                                    <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                                </div>
                                {/* Y-Axis Labels overlay */}
                                <div className="absolute top-0 bottom-0 -left-6 flex flex-col justify-between text-[10px] text-muted-foreground h-full py-2">
                                    <span>90</span><span>80</span><span>70</span><span>60</span><span>50</span><span>40</span><span>30</span><span>20</span><span>10</span><span>0</span>
                                </div>
                            </div>
                            <div className="h-6"></div> {/* Spacer for X-Axis */}
                        </CardContent>
                    </Card>
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Case Type Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px] flex flex-col items-center justify-center">
                                {/* SVG Donut Chart */}
                                <div className="relative h-48 w-48">
                                    <svg viewBox="0 0 100 100" className="h-full w-full rotate-[-90deg]">
                                        {/* Property Disputes (Darkest) */}
                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1c2434" strokeWidth="20" strokeDasharray="90 251.2" strokeDashoffset="0" />

                                        {/* Noise Complaints (Medium Dark) */}
                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#334155" strokeWidth="20" strokeDasharray="70 251.2" strokeDashoffset="-90" />

                                        {/* Family Disputes (Medium) */}
                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#64748b" strokeWidth="20" strokeDasharray="50 251.2" strokeDashoffset="-160" />

                                        {/* Debt Collection (Light Grey) */}
                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#94a3b8" strokeWidth="20" strokeDasharray="41.2 251.2" strokeDashoffset="-210" />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="h-24 w-24 bg-white dark:bg-card rounded-full"></div>
                                    </div>
                                </div>

                                {/* Legend */}
                                <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-[10px] text-muted-foreground">
                                    <div className="flex items-center gap-1"><span className="h-2 w-4 bg-[#1c2434]"></span>Property Disputes</div>
                                    <div className="flex items-center gap-1"><span className="h-2 w-4 bg-[#334155]"></span>Noise Complaints</div>
                                    <div className="flex items-center gap-1"><span className="h-2 w-4 bg-[#64748b]"></span>Family Disputes</div>
                                    <div className="flex items-center gap-1"><span className="h-2 w-4 bg-[#94a3b8]"></span>Debt Collection</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Area 2 */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Case Outcomes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px] w-full flex items-end justify-between px-8 pb-6 pt-2 relative">
                                {/* Grid container overlay */}
                                <div className="absolute inset-x-0 bottom-6 top-0 flex flex-col justify-between py-2 pointer-events-none">
                                    <div className="border-t border-slate-100 dark:border-slate-800 w-full"></div>
                                    <div className="border-t border-slate-100 dark:border-slate-800 w-full"></div>
                                    <div className="border-t border-slate-100 dark:border-slate-800 w-full"></div>
                                    <div className="border-t border-slate-100 dark:border-slate-800 w-full"></div>
                                    <div className="border-t border-slate-100 dark:border-slate-800 w-full"></div>
                                </div>

                                {/* Bars */}
                                <div className="w-16 bg-[#1c2434] h-[85%] relative z-10 flex flex-col justify-end group">
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded">430</div>
                                </div>
                                <div className="w-16 bg-[#334155] h-[35%] relative z-10 flex flex-col justify-end group">
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded">140</div>
                                </div>
                                <div className="w-16 bg-[#475569] h-[15%] relative z-10 flex flex-col justify-end group">
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded">65</div>
                                </div>
                                <div className="w-16 bg-[#64748b] h-[10%] relative z-10 flex flex-col justify-end group">
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded">40</div>
                                </div>
                                <div className="w-16 bg-[#94a3b8] h-[8%] relative z-10 flex flex-col justify-end group">
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded">35</div>
                                </div>

                                {/* Y-Axis Labels overlay */}
                                <div className="absolute top-0 bottom-6 -left-6 flex flex-col justify-between text-[10px] text-muted-foreground h-full py-2">
                                    <span>450</span><span>350</span><span>250</span><span>150</span><span>50</span><span>0</span>
                                </div>
                            </div>
                            {/* X-Axis labels */}
                            <div className="flex justify-between px-6 text-[10px] text-muted-foreground">
                                <span className="w-16 text-center">Settled</span>
                                <span className="w-16 text-center">Pending</span>
                                <span className="w-16 text-center">Dismissed</span>
                                <span className="w-16 text-center">Referred</span>
                                <span className="w-16 text-center">Withdrawn</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Resolution Time Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[250px] w-full flex items-end gap-2 p-4 relative">
                                <svg className="w-full h-full absolute top-0 left-0" viewBox="0 0 100 50" preserveAspectRatio="none">
                                    {/* Grid Lines */}
                                    <line x1="0" y1="10" x2="100" y2="10" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2" />
                                    <line x1="0" y1="20" x2="100" y2="20" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2" />
                                    <line x1="0" y1="30" x2="100" y2="30" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2" />
                                    <line x1="0" y1="40" x2="100" y2="40" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2" />

                                    {/* Decreasing Trend Line */}
                                    <path
                                        d="M0,5 C10,10 20,12 30,15 S40,20 50,22 S60,28 70,25 S80,26 90,24 S95,22 100,20"
                                        fill="none"
                                        stroke="#334155"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                    />
                                    {/* Dots */}
                                    <circle cx="0" cy="5" r="1.5" fill="#334155" />
                                    <circle cx="20" cy="12" r="1.5" fill="#334155" />
                                    <circle cx="40" cy="18" r="1.5" fill="#334155" />
                                    <circle cx="60" cy="25" r="1.5" fill="#334155" />
                                    <circle cx="80" cy="24" r="1.5" fill="#334155" />
                                    <circle cx="100" cy="20" r="1.5" fill="#334155" />
                                </svg>

                                <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-[10px] text-muted-foreground px-2">
                                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                                    <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                                </div>
                                <div className="absolute top-0 bottom-0 -left-6 flex flex-col justify-between text-[10px] text-muted-foreground h-full py-2">
                                    <span>25</span><span>20</span><span>15</span><span>10</span><span>5</span><span>0</span>
                                </div>
                            </div>
                            <div className="h-6"></div>
                        </CardContent>
                    </Card>
                </div>

                {/* Top Case Categories Progress */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Case Categories</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">Property Disputes</span>
                                <span className="text-muted-foreground text-xs"><strong className="text-[#1c2434] dark:text-white">156 cases</strong> (28%)</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-[#1c2434] w-[28%] rounded-full"></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">Noise Complaints</span>
                                <span className="text-muted-foreground text-xs"><strong className="text-[#1c2434] dark:text-white">134 cases</strong> (24%)</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-[#334155] w-[24%] rounded-full"></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">Family Disputes</span>
                                <span className="text-muted-foreground text-xs"><strong className="text-[#1c2434] dark:text-white">98 cases</strong> (18%)</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-[#475569] w-[18%] rounded-full"></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">Debt Collection</span>
                                <span className="text-muted-foreground text-xs"><strong className="text-[#1c2434] dark:text-white">87 cases</strong> (16%)</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-[#64748b] w-[16%] rounded-full"></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">Others</span>
                                <span className="text-muted-foreground text-xs"><strong className="text-[#1c2434] dark:text-white">78 cases</strong> (14%)</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-[#94a3b8] w-[14%] rounded-full"></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
