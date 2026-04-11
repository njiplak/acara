import { Link, usePage } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    Calendar,
    CalendarDays,
    ChevronsUpDown,
    ClipboardList,
    CircleHelp,
    Copy,
    FileText,
    Globe,
    Newspaper,
    LayoutDashboard,
    LogOut,
    MapPin,
    Package,
    Puzzle,
    ClipboardCheck,
    CreditCard,
    Crown,
    Gem,
    MessageSquare,
    ScanLine,
    Settings,
    Tag,
    UserCog,
    UserRound,
    Users,
    UsersRound,
    Wrench,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
    useSidebar,
} from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { logout } from '@/routes';
import backoffice from '@/routes/backoffice';
import type { SharedData, AppLayoutProps } from '@/types';

type MenuItem = {
    label: string;
    icon: LucideIcon;
    href: string;
    permission: string;
    exact?: boolean;
};

type MenuGroup = {
    label: string;
    items: MenuItem[];
};

const menuConfig: MenuGroup[] = [
    {
        label: 'Menu',
        items: [
            { label: 'Dashboard', icon: LayoutDashboard, href: backoffice.index.url(), permission: 'dashboard.view', exact: true },
            { label: 'Calendar', icon: CalendarDays, href: backoffice.calendar.url(), permission: 'calendar.view' },
        ],
    },
    {
        label: 'Master',
        items: [
            { label: 'Event', icon: Calendar, href: backoffice.master.event.index.url(), permission: 'event.view' },
            { label: 'Catalog', icon: Package, href: backoffice.master.catalog.index.url(), permission: 'catalog.view' },
            { label: 'Addon', icon: Puzzle, href: backoffice.master.addon.index.url(), permission: 'addon.view' },
            { label: 'Speaker', icon: UserRound, href: backoffice.master.speaker.index.url(), permission: 'speaker.view' },
            { label: 'Venue', icon: MapPin, href: backoffice.master.venue.index.url(), permission: 'venue.view' },
            { label: 'Voucher', icon: Tag, href: backoffice.master.voucher.index.url(), permission: 'voucher.view' },
            { label: 'Templates', icon: Copy, href: backoffice.master.eventTemplate.index.url(), permission: 'event_template.view' },
            { label: 'Article', icon: Newspaper, href: backoffice.master.article.index.url(), permission: 'article.view' },
            { label: 'FAQ', icon: CircleHelp, href: backoffice.master.faq.index.url(), permission: 'faq.view' },
            { label: 'Subscription Plans', icon: Crown, href: backoffice.master.subscriptionPlan.index.url(), permission: 'subscription_plan.view' },
            { label: 'Sub. Features', icon: Gem, href: backoffice.master.subscriptionFeature.index.url(), permission: 'subscription_feature.view' },
        ],
    },
    {
        label: 'Operational',
        items: [
            { label: 'Order', icon: ClipboardList, href: backoffice.operational.order.index.url(), permission: 'order.view' },
            { label: 'Customer', icon: Users, href: backoffice.operational.customer.index.url(), permission: 'customer.view' },
            { label: 'Check In', icon: ScanLine, href: backoffice.operational.checkIn.scanner.url(), permission: 'check_in.view' },
            { label: 'Testimonial', icon: MessageSquare, href: backoffice.operational.testimonial.index.url(), permission: 'testimonial.view' },
            { label: 'Survey', icon: ClipboardCheck, href: backoffice.operational.survey.index.url(), permission: 'survey.view' },
            { label: 'Sub. Orders', icon: CreditCard, href: backoffice.operational.subscriptionOrder.index.url(), permission: 'subscription_order.view' },
        ],
    },
    {
        label: 'Setting',
        items: [
            { label: 'Landing Page', icon: Globe, href: backoffice.setting.landingPage.edit.url(), permission: 'landing_page.view' },
            { label: 'Operational', icon: Wrench, href: backoffice.setting.operational.edit.url(), permission: 'operational_setting.view' },
            { label: 'Settings', icon: Settings, href: backoffice.setting.setting.index.url(), permission: 'setting.view' },
            { label: 'User', icon: UsersRound, href: backoffice.setting.user.index.url(), permission: 'user.view' },
            { label: 'Role', icon: UserCog, href: backoffice.setting.role.index.url(), permission: 'role.view' },
            { label: 'Pages', icon: FileText, href: backoffice.setting.page.index.url(), permission: 'page.view' },
        ],
    },
];

function getInitials(name: string) {
    return name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function SidebarUser() {
    const { state } = useSidebar();
    const isMobile = useIsMobile();
    const user = usePage<SharedData>().props.auth.user;

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent"
                        >
                            <Avatar className="h-8 w-8 rounded-full">
                                <AvatarFallback className="rounded-full bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                    {getInitials(user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">
                                    {user.name}
                                </span>
                                <span className="truncate text-xs text-muted-foreground">
                                    {user.email}
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        align="end"
                        side={
                            isMobile
                                ? 'bottom'
                                : state === 'collapsed'
                                  ? 'left'
                                  : 'bottom'
                        }
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-full">
                                    <AvatarFallback className="rounded-full bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">
                                        {user.name}
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        {user.email}
                                    </span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link
                                className="block w-full cursor-pointer"
                                href={logout()}
                                as="button"
                            >
                                <LogOut className="mr-2" />
                                Log out
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}

export default function AppLayout({ children }: AppLayoutProps) {
    const page = usePage<SharedData>();
    const { sidebarOpen: isOpen } = page.props;
    const permissions = page.props.auth.permissions;
    const currentUrl = page.url;

    function isMenuActive(item: MenuItem) {
        if (item.exact) {
            return currentUrl === item.href;
        }
        return currentUrl === item.href || currentUrl.startsWith(item.href + '/');
    }

    const visibleGroups = menuConfig
        .map((group) => ({
            ...group,
            items: group.items.filter((item) => permissions.includes(item.permission)),
        }))
        .filter((group) => group.items.length > 0);

    return (
        <SidebarProvider defaultOpen={isOpen}>
            <Sidebar collapsible="icon" variant="sidebar">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link href={backoffice.index.url()} prefetch>
                                    <AppLogo />
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
                <SidebarContent>
                    {visibleGroups.map((group) => (
                        <SidebarGroup key={group.label}>
                            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {group.items.map((item) => (
                                        <SidebarMenuItem key={item.href}>
                                            <SidebarMenuButton asChild isActive={isMenuActive(item)}>
                                                <Link href={item.href}>
                                                    <item.icon />
                                                    <span>{item.label}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    ))}
                </SidebarContent>
                <SidebarFooter>
                    <SidebarUser />
                </SidebarFooter>
            </Sidebar>
            <SidebarInset className="overflow-x-hidden">
                <header className="flex shrink-0 items-center gap-2 border-b px-4 py-2.5 sm:px-6 sm:py-3">
                    <SidebarTrigger />
                    <Separator orientation="vertical" className="mx-1 h-5" />
                    <h1 className="text-sm font-semibold tracking-tight sm:text-base">
                        {page.props.name}
                    </h1>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-3 sm:p-4 md:p-6">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
