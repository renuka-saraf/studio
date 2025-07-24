"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  LayoutDashboard,
  ScanLine,
  Factory,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { href: '/', label: 'Scan Receipt', icon: Home },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/inventory', label: 'Inventory', icon: Factory },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/">
                        <ScanLine className="h-6 w-6 text-primary" />
                        <span className="sr-only">Scanalyze</span>
                    </Link>
                </Button>
                <h1 className="text-lg font-semibold tracking-tight font-headline">Scanalyze</h1>
            </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label, className: "font-body" }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span className="font-body">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className={cn("p-4 sm:p-6 lg:p-8", pathname === '/' && 'p-0 sm:p-0 lg:p-0')}>
            <header className="flex h-14 items-center justify-end border-b bg-background px-4 md:hidden">
              <SidebarTrigger />
            </header>
            <main className={cn(pathname !== '/' && 'p-4 sm:p-6')}>
              {children}
            </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
