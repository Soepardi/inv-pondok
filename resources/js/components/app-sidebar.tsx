import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
  LayoutGrid,
  Package,
  Users,
  ClipboardList,
  Building2,
  History,
} from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';

export function AppSidebar() {
  const { auth } = usePage().props as any;
  const user = auth.user;

  const navMain: NavItem[] = [];

  if (user?.role === 'admin') {
    navMain.push({
      title: 'Dashboard',
      href: dashboard().url,
      icon: LayoutGrid,
    });
    navMain.push({
      title: 'Manajemen Barang',
      href: '/items',
      icon: Package,
    });

    if (!user.institution_id) {
      navMain.push({
        title: 'Manajemen User',
        href: '/users',
        icon: Users,
      });
      navMain.push({
        title: 'Manajemen Instansi',
        href: '/institutions',
        icon: Building2,
      });
    }

    navMain.push({
      title: 'Persetujuan',
      href: '/loans/all',
      icon: ClipboardList,
    });
  } else {
    navMain.push({
      title: 'Ajukan Peminjaman',
      href: '/loans/create',
      icon: ClipboardList,
    });
    navMain.push({
      title: 'Riwayat Saya',
      href: '/history/my',
      icon: History,
    });
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={user?.role === 'admin' ? dashboard().url : '/loans'} className="flex items-center gap-2">
                <AppLogoIcon className="h-8 w-8 object-contain shrink-0" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold text-base text-sidebar-foreground group-data-[collapsible=icon]:hidden">Inventaris PTM</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
