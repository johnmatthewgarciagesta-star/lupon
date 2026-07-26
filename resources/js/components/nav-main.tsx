import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronRight, Folder, FileText } from 'lucide-react';
import { useState } from 'react';
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();
    const { url } = usePage();

    // State for expanded menu groups
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
        Documents: true, // Open by default
    });

    const toggleGroup = (title: string) => {
        setOpenGroups((prev) => ({
            ...prev,
            [title]: !prev[title],
        }));
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarMenu>
                {items.map((item) => {
                    const hasSubItems = item.items && item.items.length > 0;
                    const isParentActive = hasSubItems && item.items?.some((sub) => {
                        const hrefStr = typeof sub.href === 'string' ? sub.href : String(sub.href);
                        return url.startsWith(hrefStr);
                    });
                    const isOpen = openGroups[item.title] ?? isParentActive;

                    if (hasSubItems) {
                        return (
                            <SidebarMenuItem key={item.title} className="space-y-1">
                                <SidebarMenuButton
                                    onClick={() => toggleGroup(item.title)}
                                    isActive={isParentActive}
                                    tooltip={{ children: item.title }}
                                    className="cursor-pointer flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-2">
                                        {item.icon && (
                                            <div className="flex bg-[#dd8b11] rounded-md p-1 items-center justify-center shrink-0">
                                                <item.icon className="h-4 w-4 text-white dark:text-black" />
                                            </div>
                                        )}
                                        <span className="font-semibold">{item.title}</span>
                                    </div>
                                    {isOpen ? (
                                        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform" />
                                    )}
                                </SidebarMenuButton>

                                {isOpen && (
                                    <div className="ml-4 pl-2 border-l border-amber-300 dark:border-amber-800/60 space-y-1 my-1">
                                        {item.items?.map((sub) => {
                                            const subHref = typeof sub.href === 'string' ? sub.href : String(sub.href);
                                            const isSubActive = url === subHref || url.startsWith(subHref);
                                            const SubIcon = sub.icon || FileText;
                                            return (
                                                <Link
                                                    key={sub.title}
                                                    href={sub.href}
                                                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors font-medium ${
                                                        isSubActive
                                                            ? 'bg-amber-500/15 text-[#dd8b11] dark:text-amber-400 font-bold shadow-xs'
                                                            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                                    }`}
                                                >
                                                    <SubIcon className={`h-3.5 w-3.5 ${isSubActive ? 'text-[#dd8b11]' : 'text-muted-foreground'}`} />
                                                    <span>{sub.title}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </SidebarMenuItem>
                        );
                    }

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={isCurrentUrl(item.href)}
                                tooltip={{ children: item.title }}
                            >
                                <Link href={item.href}>
                                    {item.icon && (
                                        <div className="flex bg-[#dd8b11] rounded-md p-1 items-center justify-center shrink-0">
                                            <item.icon className="h-4 w-4 text-white dark:text-black" />
                                        </div>
                                    )}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
