"use client";

import Link from "next/link";
import { BarChart3, ChevronDown, DollarSign } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { DS } from "@/product/design-system/colors";
import type { AppShellUser } from "./AppShell";
import type { ReactNode } from "react";

interface UserMenuProps {
  user?: AppShellUser;
  isSignedIn: boolean;
  signOutSlot: ReactNode;
  signInSlot: ReactNode;
  onNavigate?: () => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Header user control: opens a menu with profile, links, and sign out or sign in. */
export function UserMenu(props: UserMenuProps) {
  const { user, isSignedIn, signOutSlot, signInSlot, onNavigate } = props;
  const t = useTranslations("UserMenuPage");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const displayName = user?.name ?? t("guest");
  const initials = user?.name ? getInitials(user.name) : "U";

  const prefix = `/${locale}`;

  const close = () => setOpen(false);

  const handleNavigate = () => {
    close();
    onNavigate?.();
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      if (root && !root.contains(event.target as Node)) {
        close();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [open]);

  const avatar = user?.avatarUrl ? (
    <img
      src={user.avatarUrl}
      alt=""
      className="w-8 h-8 rounded-full object-cover shrink-0 ring-2"
      style={{ boxShadow: `0 0 0 2px ${DS.accentMedium}` }}
    />
  ) : (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
      style={{ background: "rgba(255,174,66,0.14)" }}
    >
      <span
        className="text-xs font-semibold"
        style={{ fontFamily: "Space Grotesk, sans-serif", color: DS.accentPrimary }}
      >
        {initials}
      </span>
    </div>
  );

  const linkClass =
    "block w-full px-3 py-2 text-left text-sm transition-colors rounded-md hover:bg-white/5";
  const linkStyle = { color: DS.textPrimary };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="flex items-center gap-1.5 rounded-lg py-1 pr-1 pl-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#F7941D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#121212]"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`${t("menu_label")}: ${displayName}`}
        onClick={() => setOpen((value) => !value)}
      >
        {avatar}
        <ChevronDown
          size={16}
          className="shrink-0 transition-transform"
          style={{ color: DS.textSecondary, transform: open ? "rotate(180deg)" : undefined }}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 min-w-[272px] overflow-hidden rounded-2xl border py-2 shadow-xl"
          style={{
            background: DS.bgDark,
            borderColor: DS.bgSurface,
            boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
          }}
        >
          <div className="flex items-center gap-3 px-3 pb-3 pt-1">
            {avatar}
            <span className="min-w-0 flex-1 text-sm font-medium truncate" style={{ color: DS.textPrimary }}>
              {displayName}
            </span>
          </div>

          <div className="mx-3 h-px" style={{ background: DS.bgSurface }} />

          {isSignedIn && (
            <>
              <div className="px-1.5 py-2">
                <Link
                  href={`${prefix}/dashboard`}
                  role="menuitem"
                  className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-white/5"
                  style={{ color: DS.textPrimary }}
                  onClick={handleNavigate}
                >
                  <BarChart3 size={18} style={{ color: DS.accentMedium }} aria-hidden />
                  {t("my_predictions")}
                </Link>
                <Link
                  href={`${prefix}/dashboard`}
                  role="menuitem"
                  className="mt-0.5 flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-white/5"
                  style={{ color: DS.textPrimary }}
                  onClick={handleNavigate}
                >
                  <span
                    className="flex h-[22px] w-[22px] items-center justify-center rounded-full"
                    style={{ background: DS.successBg }}
                    aria-hidden
                  >
                    <DollarSign size={14} strokeWidth={2.5} style={{ color: DS.success }} />
                  </span>
                  {t("rewards")}
                </Link>
              </div>
              <div className="mx-3 h-px" style={{ background: DS.bgSurface }} />
            </>
          )}

          <nav className="px-1.5 py-2" aria-label={t("menu_label")}>
            <Link
              href={isSignedIn ? `${prefix}/dashboard/user-profile` : `${prefix}/sign-in`}
              role="menuitem"
              className={linkClass}
              style={linkStyle}
              onClick={handleNavigate}
            >
              {t("account_info")}
            </Link>
            <Link
              href={`${prefix}/docs`}
              role="menuitem"
              className={linkClass}
              style={linkStyle}
              onClick={handleNavigate}
            >
              {t("rules")}
            </Link>
            <Link
              href={`${prefix}/privacy-policy`}
              role="menuitem"
              className={linkClass}
              style={linkStyle}
              onClick={handleNavigate}
            >
              {t("privacy_policy")}
            </Link>
            <Link
              href={`${prefix}/terms-of-use`}
              role="menuitem"
              className={linkClass}
              style={linkStyle}
              onClick={handleNavigate}
            >
              {t("terms_of_use")}
            </Link>
            <Link
              href={`${prefix}/help-center`}
              role="menuitem"
              className={linkClass}
              style={linkStyle}
              onClick={handleNavigate}
            >
              {t("help_center")}
            </Link>
          </nav>

          <div className="mx-3 h-px" style={{ background: DS.bgSurface }} />

          <div className="px-1.5 py-2">
            {isSignedIn ? (
              <div className="w-full" onClick={handleNavigate}>
                {signOutSlot}
              </div>
            ) : (
              <div className="w-full" onClick={handleNavigate}>
                {signInSlot}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
