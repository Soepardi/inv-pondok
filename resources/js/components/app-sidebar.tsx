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
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
  BookOpen,
  Folder,
  LayoutGrid,
  Package,
  Users,
  ClipboardList,
  Undo2,
  History,
  Building2,
} from 'lucide-react';
import AppLogo from './app-logo';

// routes
import items from '@/routes/items';
import users from '@/routes/users';
import institutions from '@/routes/institutions';
import loans from '@/routes/loans';
import history from '@/routes/history';

// menu untuk admin
const adminNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: dashboard(),
    icon: LayoutGrid,
  },
  {
    title: 'Manajemen Barang',
    href: items.index(),
    icon: Package,
  },
  {
    title: 'Manajemen User',
    href: users.index(),
    icon: Users,
  },
  {
    title: 'Manajemen Instansi',
    href: institutions.index(),
    icon: Building2,
  },
  {
    title: 'Persetujuan',
    href: '/loans/all',
    icon: ClipboardList,
  },
];

// menu untuk user biasa
const userNavItems: NavItem[] = [
  {
    title: 'Ajukan Peminjaman',
    href: loans.create(),
    icon: ClipboardList,
  },
  {
    title: 'Riwayat Saya',
    href: history.my(),
    icon: History,
  },
];

// menu footer (global)
const footerNavItems: NavItem[] = [

];

export function AppSidebar() {
  const { auth } = usePage().props as unknown as {
    auth: { user: { role: string } };
  };

  // tentukan menu berdasarkan role
  const mainNavItems =
    auth.user?.role === 'admin' ? adminNavItems : userNavItems;

  return (
    <Sidebar collapsible="icon" variant="inset">
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
        <NavFooter items={footerNavItems} className="mt-auto" />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
