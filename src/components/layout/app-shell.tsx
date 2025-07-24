
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  LayoutDashboard,
  ScanLine,
  Factory,
  Ticket,
  LogOut,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useReceipts } from '@/context/receipt-context';
import { Avatar, AvatarFallback } from '../ui/avatar';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, logout } = useReceipts();

  const menuItems = [
    { href: '/', label: 'Scan Receipt', icon: Home },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/inventory', label: 'Inventory', icon: Factory },
    { href: '/passes', label: 'Passes', icon: Ticket },
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
          {isAuthenticated && (
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
          )}
        </SidebarContent>
        {isAuthenticated && (
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={logout} tooltip={{children: "Logout", className: "font-body"}}>
                            <LogOut />
                            <span className="font-body">Logout</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        )}
      </Sidebar>
      <SidebarInset>
        <div className={cn("p-4 sm:p-6 lg:p-8")}>
            <header className="flex h-14 items-center justify-end border-b bg-background px-4 md:hidden">
              <SidebarTrigger />
            </header>
            <main>
              {children}
            </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
