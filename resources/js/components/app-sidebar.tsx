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
    Settings
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Case Management',
        href: dashboard(), // Placeholder
        icon: Briefcase,
    },
    {
        title: 'Documents',
        href: dashboard(), // Placeholder
        icon: FileText,
    },
    {
        title: 'Analytics',
        href: dashboard(), // Placeholder
        icon: BarChart3,
    },
    {
        title: 'Reports',
        href: dashboard(), // Placeholder
        icon: ClipboardList,
    },
    {
        title: 'Users',
        href: dashboard(), // Placeholder
        icon: Users,
    },
    {
        title: 'Settings',
        href: dashboard(), // Placeholder
        icon: Settings,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="sidebar" className="bg-[#1c2434] text-white">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
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
