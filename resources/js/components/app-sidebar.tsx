import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Briefcase,
    FileText,
    Folder,
    BarChart3,
    ClipboardList,
    Users,
    Trophy,
    ShieldAlert,
    ChevronsLeft,
    ChevronsRight,
} from 'lucide-react';
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
    SidebarRail,
    useSidebar,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';
import { SharedData } from '@/types';

const mainNavItems: NavItem[] = [
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
        href: '/documents/folders',
        icon: FileText,
        items: [
            {
                title: 'Documents Folder',
                href: '/documents/folders',
                icon: Folder,
            },
            {
                title: 'Documents',
                href: '/documents/templates',
                icon: FileText,
            },
        ],
    },
    {
        title: 'Reports',
        href: '/system-reports',
        icon: ClipboardList,
    },
    {
        title: 'Audit Trail',
        href: '/audit',
        icon: ShieldAlert,
    },
    {
        title: 'Users',
        href: '/users',
        icon: Users,
    },
];

export function AppSidebar() {
    const { state, toggleSidebar } = useSidebar();
    const isCollapsed = state === 'collapsed';
    const { auth } = usePage<SharedData>().props;
    const userRoles = auth.roles || [];
    const isAdmin = auth.user?.role === 'Administrator' || userRoles.includes('Administrator');
    const isEncoder = userRoles.includes('Encoder') || userRoles.includes('Data Encoder');

    const filteredNavItems = mainNavItems.filter((item) => {
        if (isEncoder || isAdmin) {
            // Both Data Encoders and Admins see Documents Folder & Documents, but not Audit/Users for Encoders
            if (isEncoder && ['Audit Trail', 'Users'].includes(item.title)) {
                return false;
            }
            return true;
        }
        return true;
    });

    return (
        <Sidebar collapsible="offcanvas" variant="sidebar">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex items-center gap-2 p-2">
                            <AppLogo />
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
                {/* Collapse / Expand toggle button */}
                <button
                    onClick={toggleSidebar}
                    className={`
                        flex items-center gap-2 w-full rounded-lg border border-sidebar-border/50
                        text-xs font-semibold transition-all duration-200
                        hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
                        text-sidebar-foreground/70
                        ${isCollapsed ? 'justify-center p-2' : 'px-3 py-2'}
                    `}
                    title={isCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
                >
                    {isCollapsed ? (
                        <ChevronsRight className="h-4 w-4" />
                    ) : (
                        <>
                            <ChevronsLeft className="h-4 w-4" />
                            <span>Collapse</span>
                            <kbd className="ml-auto text-[10px] font-mono opacity-40 border border-sidebar-border/30 rounded px-1 py-0.5">⌘B</kbd>
                        </>
                    )}
                </button>
            </SidebarFooter>

            {/* Hover rail on the sidebar edge for quick toggle */}
            <SidebarRail />
        </Sidebar>
    );
}
