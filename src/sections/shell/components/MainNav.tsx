import { BarChart2, Briefcase, Compass, HelpCircle, SlidersHorizontal, Trophy } from "lucide-react";
import { DS } from "@/product/design-system/colors";
import type { NavigationItem } from "./AppShell";

interface MainNavProps {
  items: NavigationItem[];
  onNavigate: (href: string) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  "/discover": <Compass size={14} />,
  "/trade": <BarChart2 size={14} />,
  "/portfolio": <Briefcase size={14} />,
  "/leaderboard": <Trophy size={14} />,
  "/admin": <SlidersHorizontal size={14} />,
  "/help": <HelpCircle size={14} />,
};

export function MainNav(props: MainNavProps) {
  const { items, onNavigate } = props;

  return (
    <nav className="flex items-center gap-0.5 overflow-x-auto scrollbar-none">
      {items.map((item) => (
        <button
          key={item.href}
          type="button"
          onClick={() => onNavigate(item.href)}
          className={[
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-150 shrink-0",
            item.isActive
              ? "shadow-sm"
              : "hover:text-zinc-100",
          ].join(" ")}
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            background: item.isActive ? DS.accentGradient : "transparent",
            color: item.isActive ? DS.neutralDark : DS.textSecondary,
          }}
        >
          <span className={item.isActive ? "opacity-90" : "opacity-60"}>
            {ICON_MAP[item.href] ?? <Compass size={14} />}
          </span>
          {item.label}
        </button>
      ))}
    </nav>
  );
}

