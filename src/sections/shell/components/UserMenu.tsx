import { LogOut } from "lucide-react";
import { DS } from "@/product/design-system/colors";
import type { AppShellUser } from "./AppShell";

interface UserMenuProps {
  user?: AppShellUser;
  onLogout?: () => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function UserMenu(props: UserMenuProps) {
  const { user, onLogout } = props;
  const initials = user?.name ? getInitials(user.name) : "U";

  return (
    <div className="flex items-center gap-2.5">
      {user?.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={user.name}
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
      )}

      <span
        className="flex-1 text-sm font-medium truncate"
        style={{ color: DS.textPrimary }}
      >
        {user?.name ?? "Guest"}
      </span>

      <button
        type="button"
        onClick={onLogout}
        title="Log out"
        className="p-1.5 rounded-md transition-colors shrink-0"
        style={{ color: DS.textSecondary }}
      >
        <LogOut size={14} />
      </button>
    </div>
  );
}

