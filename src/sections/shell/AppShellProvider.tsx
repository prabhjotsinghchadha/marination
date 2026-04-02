"use client";

import { useAuth } from "@clerk/nextjs";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { AppShell } from "./components";
import { DiscoverSearchProvider } from "./DiscoverSearchContext";
import { useRouter } from "@/libs/I18nNavigation";

interface AppShellProviderProps {
  children: ReactNode;
}

export function AppShellProvider(props: AppShellProviderProps) {
  const { children } = props;
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const [walletBalanceUsd, setWalletBalanceUsd] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setWalletBalanceUsd(undefined);
      return;
    }

    let cancelled = false;

    const run = async (): Promise<void> => {
      const res = await fetch("/api/me/wallet");
      const json = (await res.json().catch(() => null)) as { totalUsd?: number } | null;
      if (cancelled) {
        return;
      }
      if (!res.ok || json === null || typeof json.totalUsd !== "number") {
        setWalletBalanceUsd(0);
        return;
      }
      setWalletBalanceUsd(json.totalUsd);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn]);

  return (
    <DiscoverSearchProvider>
      <AppShell
        walletBalance={isSignedIn ? walletBalanceUsd : undefined}
        onNavigate={(href) => router.push(href)}
      >
        {children}
      </AppShell>
    </DiscoverSearchProvider>
  );
}
