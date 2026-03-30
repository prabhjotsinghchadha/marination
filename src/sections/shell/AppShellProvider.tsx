"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "./components";

interface AppShellProviderProps {
  children: ReactNode;
}

const NAV_ITEMS = [
  { label: "Discover", href: "/discover" },
  { label: "Trade", href: "/trade" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Admin", href: "/admin" },
  { label: "Help", href: "/help" },
];

export function AppShellProvider(props: AppShellProviderProps) {
  const { children } = props;
  const router = useRouter();
  const pathname = usePathname();

  const navigationItems = NAV_ITEMS.map((item) => ({
    ...item,
    isActive: pathname?.startsWith(item.href) ?? false,
  }));

  return (
    <AppShell
      navigationItems={navigationItems}
      walletBalance={1250}
      onNavigate={(href) => router.push(href)}
    >
      {children}
    </AppShell>
  );
}

