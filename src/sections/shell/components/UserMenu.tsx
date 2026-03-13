import { LogOut } from "lucide-react";
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
          className="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-violet-200 dark:ring-violet-800"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/60 flex items-center justify-center shrink-0">
          <span
            className="text-xs font-semibold text-violet-700 dark:text-violet-300"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            {initials}
          </span>
        </div>
      )}

      <span className="flex-1 text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">
        {user?.name ?? "Guest"}
      </span>

      <button
        type="button"
        onClick={onLogout}
        title="Log out"
        className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
      >
        <LogOut size={14} />
      </button>
    </div>
  );
}

