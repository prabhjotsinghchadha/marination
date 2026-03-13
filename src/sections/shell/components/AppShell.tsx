import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { MainNav } from "./MainNav";
import { UserMenu } from "./UserMenu";

export interface NavigationItem {
  label: string;
  href: string;
  isActive?: boolean;
}

export interface AppShellUser {
  name: string;
  avatarUrl?: string;
}

export interface AppShellProps {
  children: React.ReactNode;
  navigationItems: NavigationItem[];
  user?: AppShellUser;
  walletBalance?: number;
  onNavigate?: (href: string) => void;
  onLogout?: () => void;
}

export function AppShell(props: AppShellProps) {
  const { children, navigationItems, user, walletBalance, onNavigate, onLogout } = props;

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavigate = (href: string) => {
    onNavigate?.(href);
    setMobileOpen(false);
  };

  return (
    <div
      className="min-h-screen bg-zinc-50 dark:bg-zinc-950"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <header className="sticky top-0 z-30 h-14 flex items-center gap-4 px-4 md:px-6 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => handleNavigate("/discover")}
          className="flex items-center gap-2 shrink-0 cursor-pointer select-none"
        >
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white" aria-hidden="true">
              <path d="M9 18V5l12-2v13M9 18c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-2c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
            </svg>
          </div>
          <span
            className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm tracking-tight hidden sm:block"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            Marination
          </span>
        </button>

        <div className="hidden md:block w-px h-5 bg-zinc-200 dark:bg-zinc-800 shrink-0" />

        <div className="hidden md:flex flex-1 min-w-0">
          <MainNav items={navigationItems} onNavigate={handleNavigate} />
        </div>

        <div className="ml-auto flex items-center gap-2 shrink-0">
          {walletBalance !== undefined && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50">
              <span className="text-[10px] font-semibold tracking-wide uppercase text-amber-600 dark:text-amber-500">
                Balance
              </span>
              <span
                className="text-sm font-semibold text-amber-800 dark:text-amber-200 tabular-nums"
                style={{ fontFamily: "JetBrains Mono, monospace" }}
              >
                $
                {walletBalance.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          )}

          <div className="hidden md:block">
            <UserMenu user={user} onLogout={onLogout} />
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="md:hidden p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-20 bg-black/30 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed top-14 inset-x-0 z-20 md:hidden bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-lg">
            <div className="flex flex-col p-3 gap-1">
              {navigationItems.map((item) => (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => handleNavigate(item.href)}
                  className={[
                    "flex items-center px-3 py-2.5 rounded-xl text-sm font-medium w-full text-left transition-colors",
                    item.isActive
                      ? "bg-violet-600 text-white"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100",
                  ].join(" ")}
                  style={{ fontFamily: "Space Grotesk, sans-serif" }}
                >
                  {item.label}
                </button>
              ))}

              <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between px-3">
                {walletBalance !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-500">
                      Balance
                    </span>
                    <span
                      className="text-sm font-semibold text-amber-800 dark:text-amber-200 tabular-nums"
                      style={{ fontFamily: "JetBrains Mono, monospace" }}
                    >
                      $
                      {walletBalance.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}
                <UserMenu user={user} onLogout={onLogout} />
              </div>
            </div>
          </div>
        </>
      )}

      <main className="flex-1">{children}</main>
    </div>
  );
}

