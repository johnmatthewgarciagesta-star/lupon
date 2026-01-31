import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Settings,
    Bell,
    Shield,
    RotateCcw,
    Info,
    Server,
    Database,
    HardDrive,
    Save,
    RefreshCw
} from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
    const breadcrumbs = [
        {
            title: 'Settings',
            href: '/settings',
        },
    ];

    const [activeTab, setActiveTab] = useState('general');

    const scrollToSection = (id: string) => {
        setActiveTab(id);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const NavItem = ({ id, label, icon: Icon }: { id: string, label: string, icon: any }) => (
        <button
            onClick={() => scrollToSection(id)}
            className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === id
                    ? 'bg-slate-100 text-[#1c2434] dark:bg-slate-800 dark:text-white'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'
                }`}
        >
            <Icon className="h-4 w-4" />
            {label}
        </button>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Settings" />

            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 text-slate-900 dark:text-slate-100">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">System Settings</h2>
                        <p className="text-muted-foreground">
                            Configure system preferences and options
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" className="h-9">
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Reset to Default
                        </Button>
                        <Button className="h-9 bg-[#1c2434] hover:bg-[#2c3a4f] text-white">
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Settings Sidebar */}
                    <div className="md:w-64 flex-shrink-0">
                        <div className="sticky top-6 space-y-1">
                            <NavItem id="general" label="General" icon={Settings} />
                            <NavItem id="notifications" label="Notifications" icon={Bell} />
                            <NavItem id="security" label="Security" icon={Shield} />
                            <NavItem id="backup" label="Backup & Restore" icon={RotateCcw} />
                            <NavItem id="system" label="System Info" icon={Info} />
                        </div>
                    </div>

                    {/* Settings Content */}
                    <div className="flex-1 space-y-8">
                        {/* General Settings */}
                        <section id="general" className="scroll-mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>General Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="barangay-name">Barangay Name</Label>
                                        <Input id="barangay-name" defaultValue="Barangay 183, Villamor Air Base" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City/Municipality</Label>
                                        <Input id="city" defaultValue="Pasay City" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="contact">Contact Number</Label>
                                            <Input id="contact" defaultValue="+63 2 0123 4567" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input id="email" type="email" defaultValue="brgy183@pasay.gov.ph" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Time Zone</Label>
                                        <Select defaultValue="asia-manila">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Time Zone" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="asia-manila">Asia/Manila (GMT+8)</SelectItem>
                                                <SelectItem value="utc">UTC</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Date Format</Label>
                                        <Select defaultValue="mm-dd-yyyy">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Date Format" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                                                <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
                                                <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Enable Case Auto-Numbering</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Automatically generate case numbers
                                            </p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Notification Settings */}
                        <section id="notifications" className="scroll-mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notification Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between rounded-lg border p-4 bg-slate-50 dark:bg-slate-900/50">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Email Notifications</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Receive notifications via email
                                            </p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">SMS Notifications</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Receive notifications via SMS
                                            </p>
                                        </div>
                                        <Switch />
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border p-4 bg-slate-50 dark:bg-slate-900/50">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">New Case Alerts</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Get notified when new cases are filed
                                            </p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border p-4 bg-slate-50 dark:bg-slate-900/50">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Hearing Reminders</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Reminders for upcoming hearings
                                            </p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border p-4 bg-slate-50 dark:bg-slate-900/50">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Document Generation Alerts</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Notify when documents are generated
                                            </p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Security Settings */}
                        <section id="security" className="scroll-mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Security Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Two-Factor Authentication</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Add extra security to your account
                                            </p>
                                        </div>
                                        <Switch />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                                        <Input id="session-timeout" type="number" defaultValue="30" />
                                        <p className="text-xs text-muted-foreground">Auto logout after inactivity</p>
                                    </div>
                                    <div className="space-y-3">
                                        <Label>Password Requirements</Label>
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="min-chars" defaultChecked />
                                                <Label htmlFor="min-chars" className="font-normal text-sm">Minimum 8 characters</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="uppercase" defaultChecked />
                                                <Label htmlFor="uppercase" className="font-normal text-sm">Require uppercase lette</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="numbers" defaultChecked />
                                                <Label htmlFor="numbers" className="font-normal text-sm">Require numbers</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="special" />
                                                <Label htmlFor="special" className="font-normal text-sm">Require special characters</Label>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="w-full">
                                        Change Password
                                    </Button>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Backup & Restore */}
                        <section id="backup" className="scroll-mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Backup & Restore</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Automatic Backups</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Schedule automatic database backups
                                            </p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Backup Frequency</Label>
                                        <Select defaultValue="daily">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Frequency" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="daily">Daily</SelectItem>
                                                <SelectItem value="weekly">Weekly</SelectItem>
                                                <SelectItem value="monthly">Monthly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-4 flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Last Backup</span>
                                        <span className="font-medium">January 10, 2025 - 2:00 AM</span>
                                    </div>
                                    <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-4 flex items-center justify-between text-sm -mt-4">
                                        <span className="text-muted-foreground">Backup Size</span>
                                        <span className="font-medium">215 MB</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Button className="bg-[#1c2434] hover:bg-[#2c3a4f] text-white">
                                            <Database className="mr-2 h-4 w-4" />
                                            Create Backup Now
                                        </Button>
                                        <Button variant="outline">
                                            <RotateCcw className="mr-2 h-4 w-4" />
                                            Restore from Backup
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* System Information */}
                        <section id="system" className="scroll-mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>System Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between py-2 border-b">
                                        <span className="text-sm font-medium text-muted-foreground">System Version</span>
                                        <span className="text-sm font-bold">v2.5.1</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b">
                                        <span className="text-sm font-medium text-muted-foreground">Database Version</span>
                                        <span className="text-sm font-bold">PostgreSQL 14.2</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b">
                                        <span className="text-sm font-medium text-muted-foreground">Server Status</span>
                                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">Online</Badge>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b">
                                        <span className="text-sm font-medium text-muted-foreground">Last Update</span>
                                        <span className="text-sm font-bold">January 10, 2025</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b">
                                        <span className="text-sm font-medium text-muted-foreground">Storage Used</span>
                                        <span className="text-sm font-bold">2.4 GB / 10 GB</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-sm font-medium text-muted-foreground">Active Users</span>
                                        <span className="text-sm font-bold">24 / 24</span>
                                    </div>
                                    <Button variant="outline" className="w-full">
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Check for Updates
                                    </Button>
                                </CardContent>
                            </Card>
                        </section>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
