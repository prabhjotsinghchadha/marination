"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { DS } from "@/product/design-system/colors";
import { useOptionalDiscoverSearch } from "@/sections/shell/DiscoverSearchContext";
import { ClerkUserMenu } from "./auth/ClerkUserMenu";
import Image from "next/image";

export interface AppShellUser {
  name: string;
  avatarUrl?: string;
}

export interface AppShellProps {
  children: React.ReactNode;
  walletBalance?: number;
  onNavigate?: (href: string) => void;
}

export function AppShell(props: AppShellProps) {
  const { children, walletBalance, onNavigate } = props;

  const [mobileOpen, setMobileOpen] = useState(false);
  const discoverSearch = useOptionalDiscoverSearch();

  const handleNavigate = (href: string) => {
    onNavigate?.(href);
    setMobileOpen(false);
  };

  const showHeaderSearch = discoverSearch?.discoverSearchActive === true;

  return (
    <div
      className="min-h-screen"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <header
        className="sticky top-0 z-30 h-14 flex items-center gap-2 sm:gap-4 px-3 sm:px-4 md:px-6 border-b"
        style={{
          background: "rgba(18,18,18,0.96)",
          backdropFilter: "blur(12px)",
          borderColor: DS.bgDarkGray,
        }}
      >
        <button
          type="button"
          onClick={() => handleNavigate("/")}
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

        {showHeaderSearch && discoverSearch !== null && (
          <div className="relative flex-1 min-w-0 max-w-[480px]">
            <svg
              className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none z-1"
              style={{ opacity: 0.25 }}
              width={13}
              height={13}
              fill="none"
              stroke="white"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="7" strokeWidth="2.5" />
              <path d="M16.5 16.5L21 21" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={discoverSearch.searchQuery}
              onChange={(event) => discoverSearch.setSearchQuery(event.target.value)}
              placeholder="Search markets..."
              className="w-full pl-[30px] pr-3 py-[7px] text-[12px] rounded-lg outline-none transition-colors"
              style={{
                background: DS.bgDark,
                border: `1px solid ${DS.bgSurface}`,
                color: DS.textPrimary,
              }}
              onFocus={(event) => {
                event.target.style.borderColor = DS.accentDarker;
              }}
              onBlur={(event) => {
                event.target.style.borderColor = DS.bgSurface;
              }}
            />
          </div>
        )}

        <div className="flex items-center gap-2 shrink-0 ml-auto">
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
            <ClerkUserMenu onNavigate={() => setMobileOpen(false)} />
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
            <div className="flex items-center justify-between px-4 py-3 gap-3">
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
                <div className="ml-auto">
                  <ClerkUserMenu onNavigate={() => setMobileOpen(false)} />
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
