/**
 * Store Menu Layout
 * Layout component with sidebar navigation for store management
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, PlusCircle, Globe, Users, Settings, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useStoreContext } from '../context/StoreContext';
import { StoreSelector } from './StoreSelector';
import { Skeleton } from '@/components/ui/skeleton';

interface StoreMenuLayoutProps {
  children: React.ReactNode;
}

const menuSections = [
  {
    label: 'Огляд',
    items: [
      {
        href: '/store-menu',
        icon: LayoutDashboard,
        label: 'Дашборд',
        exact: true,
      },
    ],
  },
  {
    label: 'Товари',
    items: [
      {
        href: '/store-menu/products/my',
        icon: Package,
        label: 'Мої товари',
        exact: false,
      },
      {
        href: '/store-menu/products/new',
        icon: PlusCircle,
        label: 'Додати товар',
        exact: false,
      },
      {
        href: '/store-menu/products/all',
        icon: Globe,
        label: 'Всі товари сайту',
        exact: false,
      },
    ],
  },
  {
    label: 'Команда',
    items: [
      {
        href: '/store-menu/managers',
        icon: Users,
        label: 'Менеджери',
        exact: false,
      },
    ],
  },
  {
    label: 'Налаштування',
    items: [
      {
        href: '/store-menu/store',
        icon: Settings,
        label: 'Профіль магазину',
        exact: false,
      },
    ],
  },
];

const findActiveItem = (pathname: string) => {
  for (const section of menuSections) {
    for (const item of section.items) {
      if (item.exact ? pathname === item.href : pathname.startsWith(item.href)) {
        return item;
      }
    }
  }
  return null;
};

function StoreSidebar({ storeName, pathname }: { storeName: string; pathname: string }) {
  const isActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r border-sidebar-border/60">
      <SidebarHeader className="border-b border-sidebar-border/60 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Store className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Admin</span>
            <span className="font-semibold text-sm line-clamp-1">{storeName}</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        {menuSections.map((section, index) => (
          <React.Fragment key={section.label}>
            <SidebarGroup>
              <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {section.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map(item => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.href, item.exact)}
                        tooltip={item.label}
                      >
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            {index < menuSections.length - 1 && <SidebarSeparator />}
          </React.Fragment>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}

function StoreSwitcher({
  stores,
  selectedStoreId,
  onSelect,
}: {
  stores: { id: string; name: string; logo_url?: string }[];
  selectedStoreId: string;
  onSelect: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedStore = stores.find(s => s.id === selectedStoreId);

  if (!selectedStore) return null;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        className="w-full justify-start gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="h-8 w-8 overflow-hidden rounded-lg border">
          {selectedStore.logo_url ? (
            <Image
              src={selectedStore.logo_url}
              alt={selectedStore.name}
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <Store className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
        <span className="line-clamp-1 flex-1 text-left">{selectedStore.name}</span>
      </Button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border bg-background p-1 shadow-md">
          {stores.map(store => (
            <Button
              key={store.id}
              variant={store.id === selectedStoreId ? 'secondary' : 'ghost'}
              className="w-full justify-start gap-2"
              onClick={() => {
                onSelect(store.id);
                setIsOpen(false);
              }}
            >
              <div className="h-6 w-6 overflow-hidden rounded border">
                {store.logo_url ? (
                  <Image
                    src={store.logo_url}
                    alt={store.name}
                    width={24}
                    height={24}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <Store className="h-3 w-3 text-muted-foreground" />
                  </div>
                )}
              </div>
              <span className="line-clamp-1 flex-1 text-left text-sm">{store.name}</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

export function StoreMenuLayout({ children }: StoreMenuLayoutProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { stores, selectedStore, selectedStoreId, setSelectedStore, isLoading, hasNoStores } =
    useStoreContext();
  const activeItem = findActiveItem(pathname);
  const pageTitle = activeItem?.label || 'Меню магазину';

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md space-y-4 p-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  // Show store selector if no store selected or multiple stores
  if (!selectedStore || stores.length > 1) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          <StoreSelector />
        </div>
      </div>
    );
  }

  // Show no stores message
  if (hasNoStores) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md">
          <StoreSelector />
        </div>
      </div>
    );
  }

  const storeName = selectedStore?.name || 'Мій магазин';

  if (isMobile) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/20">
        {/* Mobile Header */}
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Store className="h-4 w-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">{storeName}</span>
                <span className="text-sm font-semibold">{pageTitle}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle className="h-9 w-9" />
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <LayoutDashboard className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[70vh]">
                  <nav className="flex flex-col gap-4 pt-4">
                    {/* Store Switcher for mobile */}
                    {stores.length > 1 && (
                      <div className="border-b pb-4">
                        <p className="mb-2 px-3 text-xs font-medium text-muted-foreground">
                          Магазин
                        </p>
                        {stores.map(store => (
                          <button
                            key={store.id}
                            onClick={() => {
                              setSelectedStore(store.id);
                              setMobileMenuOpen(false);
                            }}
                            className={cn(
                              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                              selectedStoreId === store.id
                                ? 'bg-primary/10 text-primary'
                                : 'hover:bg-muted'
                            )}
                          >
                            <Store className="h-4 w-4" />
                            {store.name}
                          </button>
                        ))}
                      </div>
                    )}

                    {menuSections.map(section => (
                      <div key={section.label} className="space-y-2">
                        <p className="px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          {section.label}
                        </p>
                        <div className="flex flex-col gap-2">
                          {section.items.map(item => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                                pathname === item.href ||
                                  (!item.exact && pathname.startsWith(item.href))
                                  ? 'bg-primary/10 text-primary'
                                  : 'hover:bg-muted'
                              )}
                            >
                              <item.icon className="h-5 w-5" />
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        {/* Mobile Content */}
        <main className="flex-1 p-4">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-muted/20">
        <StoreSidebar storeName={storeName} pathname={pathname} />

        <SidebarInset className="bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-muted/40 via-background to-background">
          <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />

            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">{storeName}</span>
              <h1 className="text-base font-semibold">{pageTitle}</h1>
            </div>

            <div className="ml-auto flex items-center gap-3">
              {stores.length > 1 && (
                <div className="hidden md:block">
                  <StoreSwitcher
                    stores={stores}
                    selectedStoreId={selectedStoreId!}
                    onSelect={setSelectedStore}
                  />
                </div>
              )}
            </div>
          </header>

          <main className="flex-1 px-6 py-6">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
