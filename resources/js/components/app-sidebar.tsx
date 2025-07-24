import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { Send, ChartLine, LayoutGrid, ChartCandlestick, Wallet, Cog, Landmark, Mail, House, FileText, BellRing } from 'lucide-react';
import AppLogo from './app-logo';

// Define the auth structure in the PageProps interface
interface PageProps extends InertiaPageProps {
  auth: {
    user: {
      name: string | null;
      email: string | null;
      role: string | null;
    } | null;
  };
}

// Admin-only navigation items
const adminNavItems: NavItem[] = [
  {
    title: 'Admin Dashboard',
    href: '/wallet/admin/dashboard',
    icon: House,
  },
  {
    title: 'Portfoilios',
    href: '/wallet/admin/portfolios',
    icon: ChartCandlestick,
  },
  {
    title: 'Requests',
    href: '/wallet/admin/requests',
    icon: FileText,
  },
  {
    title: 'Mail',
    href: '/wallet/admin/mail',
    icon: Mail,
  },
  {
    title: 'Accounts',
    href: '/wallet/admin/accounts',
    icon: Landmark,
  },
  {
    title: 'Notifications',
    href: '/wallet/admin/notifications',
    icon: BellRing,
  },
];

// Regular user navigation items
const userNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutGrid,
  },
  {
    title: 'Accounts',
    href: '/wallet',
    icon: Wallet,
  },
  {
    title: 'Send and Request',
    href: '/wallet/transactions',
    icon: Send,
  },
  {
    title: 'Investments',
    href: '/wallet/investments',
    icon: ChartLine,
  },
  {
    title: 'Activity',
    href: '/wallet/activity',
    icon: Cog,
  },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
  // Properly type the page props
  const { props } = usePage<PageProps>();
  const userRole = props.auth?.user?.role;
  
//   console.log('User Role:', userRole);
  
  // Only show items appropriate for the user's role
  // If admin, show ONLY admin links
  const navItems = userRole === 'admin' ? adminNavItems : userNavItems;

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard" prefetch>
                <AppLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavFooter items={footerNavItems} className="mt-auto" />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}