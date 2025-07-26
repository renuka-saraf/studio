
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
  Menu,
  Split,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
  const [isOpen, setIsOpen] = React.useState(true);

  const menuItems = [
    { href: '/', label: 'Scan Receipt', icon: Home },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/inventory', label: 'Inventory', icon: Factory },
    { href: '/passes', label: 'Passes', icon: Ticket },
    { href: '/split-expense', label: 'Split Expense', icon: Split },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          {isAuthenticated ? (
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <SidebarHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/">
                                <ScanLine className="h-6 w-6 text-primary" />
                                <span className="sr-only">Scanalyze</span>
                            </Link>
                        </Button>
                        <h1 className="text-lg font-semibold tracking-tight font-headline">Scanalyze</h1>
                    </div>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </CollapsibleTrigger>
                </div>
              </SidebarHeader>
              <CollapsibleContent>
                <SidebarMenu className="mt-2">
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
              </CollapsibleContent>
            </Collapsible>
          ) : (
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
