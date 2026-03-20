import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { DS } from "@/product/design-system/colors";
import { MainNav } from "./MainNav";
import { UserMenu } from "./UserMenu";
import Image from "next/image";

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
      className="min-h-screen"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <header
        className="sticky top-0 z-30 h-14 flex items-center gap-4 px-4 md:px-6 border-b"
        style={{
          background: "rgba(18,18,18,0.96)",
          backdropFilter: "blur(12px)",
          borderColor: DS.bgDarkGray,
        }}
      >
        <button
          type="button"
          onClick={() => handleNavigate("/discover")}
          className="flex items-center gap-2 shrink-0 cursor-pointer select-none"
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "transparent", boxShadow: "none" }}
          >
            <Image
              src="/assets/logo/logo_minimal_white.png"
              alt="Marination logo"
              width={18}
              height={18}
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
          <span
            className="font-semibold text-[22px] leading-none tracking-tight hidden sm:block"
            style={{
              fontFamily:
                '"SF Pro Display","SF Pro Text",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
            }}
          >
            MariNation
          </span>
        </button>

        <div
          className="hidden md:block w-px h-5 shrink-0"
          style={{ background: DS.bgDarkGray }}
        />

        <div className="hidden md:flex flex-1 min-w-0">
          <MainNav items={navigationItems} onNavigate={handleNavigate} />
        </div>

        <div className="ml-auto flex items-center gap-2 shrink-0">
          {walletBalance !== undefined && (
            <div
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border"
              style={{
                background: "rgba(255,174,66,0.12)",
                borderColor: DS.accentDarker,
              }}
            >
              <span
                className="text-[10px] font-semibold tracking-wide uppercase"
                style={{ color: DS.accentPrimary }}
              >
                Balance
              </span>
              <span
                className="text-sm font-semibold tabular-nums"
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
            className="md:hidden p-1.5 rounded-md transition-colors"
            style={{ color: DS.textSecondary }}
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
            className="fixed inset-0 z-20 md:hidden"
            style={{ background: "rgba(0,0,0,0.4)" }}
            onClick={() => setMobileOpen(false)}
          />
          <div
            className="fixed top-14 inset-x-0 z-20 md:hidden border-b shadow-lg"
            style={{ background: DS.bgDark, borderColor: DS.bgDarkGray }}
          >
            <div className="flex flex-col p-3 gap-1">
              {navigationItems.map((item) => (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => handleNavigate(item.href)}
                  className={[
                    "flex items-center px-3 py-2.5 rounded-xl text-sm font-medium w-full text-left transition-colors",
                    item.isActive
                      ? "text-zinc-950"
                      : "text-zinc-400 hover:text-zinc-100",
                  ].join(" ")}
                  style={{
                    fontFamily: "Space Grotesk, sans-serif",
                    background: item.isActive ? DS.accentGradient : "transparent",
                  }}
                >
                  {item.label}
                </button>
              ))}

              <div
                className="mt-2 pt-2 border-t flex items-center justify-between px-3"
                style={{ borderColor: DS.bgDarkGray }}
              >
                {walletBalance !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wide"
                      style={{ color: DS.accentPrimary }}
                    >
                      Balance
                    </span>
                    <span
                      className="text-sm font-semibold tabular-nums"
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

      <main className="flex-1" style={{ background: DS.bgDarkest }}>
        {children}
      </main>
    </div>
  );
}

