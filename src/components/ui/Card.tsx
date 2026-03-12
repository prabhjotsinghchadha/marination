import { ReactNode } from "react";

interface CardProps {
  className?: string;
  children: ReactNode;
}

export function Card({ className = "", children }: CardProps) {
  return (
    <div className={`bg-surface border border-border rounded-xl overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  right?: ReactNode;
  className?: string;
}

export function CardHeader({ title, right, className = "" }: CardHeaderProps) {
  return (
    <div className={`flex items-center justify-between gap-2 px-4 py-3.5 border-b border-border ${className}`}>
      <span className="font-display text-[11px] font-bold tracking-widest uppercase text-text-dim">
        {title}
      </span>
      {right && <div>{right}</div>}
    </div>
  );
}

interface CardBodyProps {
  className?: string;
  children: ReactNode;
}

export function CardBody({ className = "", children }: CardBodyProps) {
  return (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
}
