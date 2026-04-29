'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconDashboard,
  IconCreditCard,
  IconLogout,
  IconExternalLink,
} from '@tabler/icons-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@shared/ui/sidebar';

const navItems = [
  { title: 'Дашборд', url: '/admin', icon: IconDashboard },
  { title: 'Бонусные карты', url: '/admin/bonuses', icon: IconCreditCard },
];

export function AppSidebar({
  email,
  ...props
}: React.ComponentProps<typeof Sidebar> & { email?: string }) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/admin">
                <span className="text-base font-semibold">Mio Mio · Admin</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const active =
                  item.url === '/admin'
                    ? pathname === '/admin'
                    : pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/" target="_blank">
                <IconExternalLink />
                <span>На сайт</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {email && (
            <SidebarMenuItem>
              <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">
                {email}
              </div>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/api/auth/sign-out" rel="nofollow">
                <IconLogout />
                <span>Выйти</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
