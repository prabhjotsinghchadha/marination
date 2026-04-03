"use client";

import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { DS } from "@/product/design-system/colors";
import { UserMenu } from "../UserMenu";
import type { AppShellUser } from "../AppShell";

interface ClerkUserMenuProps {
  onNavigate?: () => void;
}

/** Maps Clerk session to `UserMenu` with sign-in and sign-out actions. */
export function ClerkUserMenu(props: ClerkUserMenuProps) {
  const { onNavigate } = props;
  const t = useTranslations("UserMenuPage");
  const { user: clerkUser, isSignedIn } = useUser();

  const menuUser: AppShellUser = isSignedIn
    ? {
        name: clerkUser?.fullName ?? clerkUser?.firstName ?? "User",
        avatarUrl: clerkUser?.imageUrl,
      }
    : {
        name: t("guest"),
      };

  return (
    <UserMenu
      user={menuUser}
      isSignedIn={Boolean(isSignedIn)}
      onNavigate={onNavigate}
      signOutSlot={
        <SignOutButton>
          <button
            type="button"
            className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-white/5"
            style={{ color: DS.error }}
          >
            {t("log_out")}
          </button>
        </SignOutButton>
      }
      signInSlot={
        <SignInButton>
          <button
            type="button"
            className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-white/5"
            style={{ color: DS.textPrimary }}
          >
            {t("sign_in")}
          </button>
        </SignInButton>
      }
    />
  );
}
