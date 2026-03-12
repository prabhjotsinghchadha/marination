import { ReactNode } from "react";

type ButtonVariant = "yes" | "no" | "neutral" | "danger" | "resolve" | "ghost";
type ButtonSize = "sm" | "md";

const variants: Record<ButtonVariant, string> = {
  yes: "bg-yes text-black hover:bg-[#00ffb3] hover:shadow-[0_0_20px_rgba(0,229,160,0.4)]",
  no: "bg-no text-white hover:bg-[#ff6b88] hover:shadow-[0_0_20px_rgba(255,75,110,0.4)]",
  neutral: "bg-surface-3 text-text border border-border hover:bg-surface-2 hover:text-white",
  danger: "bg-no-dim text-no border border-no-border hover:bg-[rgba(255,75,110,0.3)]",
  resolve: "bg-gold-dim text-gold border border-gold-border hover:bg-[rgba(245,166,35,0.25)]",
  ghost: "text-text-dim hover:text-text hover:bg-surface-3",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-[11px] rounded-md",
  md: "px-4 py-3 text-sm rounded-lg w-full",
};

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
}

export default function Button({
  variant = "neutral",
  size = "md",
  disabled = false,
  onClick,
  className = "",
  children,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        font-display font-extrabold uppercase tracking-wide
        transition-all duration-150 cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
