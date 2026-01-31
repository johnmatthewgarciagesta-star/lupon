import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    LayoutGrid,
    Briefcase,
    FileText,
    BarChart3,
    ClipboardList,
    Users,
    Settings,
    Trophy,
    ShieldAlert
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'LTIA',
        href: '/ltia',
        icon: Trophy,
    },
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Case Management',
        href: '/cases',
        icon: Briefcase,
    },
    {
        title: 'Documents',
        href: '/documents',
        icon: FileText,
    },
    {
        title: 'Analytics',
        href: '/analytics', // Placeholder path
        icon: BarChart3,
    },
    {
        title: 'Reports',
        href: '/system-reports', // Placeholder path
        icon: ClipboardList,
    },
    {
        title: 'Audit Trail',
        href: '/audit',
        icon: ShieldAlert,
    },
    {
        title: 'Users',
        href: '/users', // Placeholder path
        icon: Users,
    },


    {
        title: 'Settings',
        href: '/settings', // Placeholder path
        icon: Settings,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard">
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
