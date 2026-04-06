import type { ReactNode } from "react";

interface ShadowCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

/**
 * Shared bento-grid card with a subtle drop shadow used across both the
 * Student and Teacher dashboards.
 */
export function ShadowCard({ children, className = "", hover = true }: ShadowCardProps) {
  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.12)] ${
        hover
          ? "hover:shadow-[0_8px_32px_-4px_rgba(15,23,42,0.18)] hover:-translate-y-0.5"
          : ""
      } transition-all duration-200 ${className}`}
    >
      {children}
    </div>
  );
}
