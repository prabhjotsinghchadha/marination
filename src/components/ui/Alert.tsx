import { ReactNode } from "react";

type AlertVariant = "error" | "success" | "info" | "warning";

const variants: Record<AlertVariant, string> = {
  error: "bg-no-dim text-no border-no-border",
  success: "bg-yes-dim text-yes border-yes-border",
  info: "bg-accent-dim text-blue-300 border-blue-500/30",
  warning: "bg-gold-dim text-gold border-gold-border",
};

interface AlertProps {
  variant?: AlertVariant;
  className?: string;
  children: ReactNode;
}

export default function Alert({ variant = "info", className = "", children }: AlertProps) {
  return (
    <div
      className={`
        px-3 py-2.5 rounded-lg text-xs leading-relaxed border
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
