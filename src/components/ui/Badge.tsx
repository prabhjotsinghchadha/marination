import { ReactNode } from "react";

type BadgeVariant = "live" | "resolved" | "yes" | "no" | "neutral";

const variants: Record<BadgeVariant, string> = {
  live: "bg-yes-dim text-yes border border-yes-border",
  resolved: "bg-gold-dim text-gold border border-gold-border",
  yes: "bg-yes-dim text-yes border border-yes-border",
  no: "bg-no-dim text-no border border-no-border",
  neutral: "bg-white/5 text-white border border-border",
};

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: ReactNode;
}

export default function Badge({ variant = "neutral", className = "", children }: BadgeProps) {
  return (
    <span
      className={`
        inline-block text-[10px] font-bold tracking-widest uppercase
        px-2 py-0.5 rounded
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
