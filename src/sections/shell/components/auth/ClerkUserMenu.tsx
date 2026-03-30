"use client";

import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import { DS } from "@/product/design-system/colors";
import { UserMenu } from "../UserMenu";
import type { AppShellUser } from "../AppShell";

export function ClerkUserMenu() {
  const { user: clerkUser, isSignedIn } = useUser();

  const menuUser: AppShellUser = isSignedIn
    ? {
        name: clerkUser?.fullName ?? clerkUser?.firstName ?? "User",
        avatarUrl: clerkUser?.imageUrl,
      }
    : {
        name: "Guest",
      };

  return (
    <UserMenu
      user={menuUser}
      action={
        isSignedIn ? (
          <SignOutButton>
            <button
              type="button"
              title="Log out"
              className="p-1.5 rounded-md transition-colors shrink-0"
              style={{ color: DS.textSecondary }}
            >
              <LogOut size={14} />
            </button>
          </SignOutButton>
        ) : (
          <SignInButton>
            <button
              type="button"
              title="Sign in"
              className="p-1.5 rounded-md transition-colors shrink-0"
              style={{ color: DS.textSecondary }}
            >
              Sign in
            </button>
          </SignInButton>
        )
      }
    />
  );
}

