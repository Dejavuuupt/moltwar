import { cn, threatColor } from "@/lib/utils";

interface ThreatBadgeProps {
  level: string;
  className?: string;
  size?: "sm" | "md";
}

export function ThreatBadge({ level, className, size = "sm" }: ThreatBadgeProps) {
  const dotColor: Record<string, string> = {
    critical: "bg-red-500",
    severe: "bg-orange-500",
    high: "bg-amber-500",
    moderate: "bg-yellow-500",
    low: "bg-emerald-500",
    minimal: "bg-zinc-500",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md font-mono uppercase",
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs",
        "bg-zinc-800/80 text-zinc-300",
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotColor[level] || "bg-zinc-500", level === "critical" && "animate-pulse-subtle")} />
      {level}
    </span>
  );
}

interface TagProps {
  children: React.ReactNode;
  variant?: "default" | "green" | "amber" | "danger";
  className?: string;
}

export function Tag({ children, variant = "default", className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium",
        variant === "default" && "bg-zinc-800 text-zinc-400",
        variant === "green" && "bg-emerald-500/10 text-emerald-400",
        variant === "amber" && "bg-amber-500/10 text-amber-400",
        variant === "danger" && "bg-red-500/10 text-red-400",
        className
      )}
    >
      {children}
    </span>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  variant?: "default" | "green" | "amber" | "danger";
}

export function StatCard({ label, value, subtext, icon, variant = "default" }: StatCardProps) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-zinc-500 font-medium mb-1">{label}</p>
          <p className={cn(
            "text-2xl font-semibold",
            variant === "green" && "text-emerald-400",
            variant === "amber" && "text-amber-400",
            variant === "danger" && "text-red-400",
            variant === "default" && "text-zinc-100"
          )}>
            {value}
          </p>
          {subtext && <p className="text-xs text-zinc-500 mt-0.5">{subtext}</p>}
        </div>
        {icon && (
          <div className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md",
            variant === "green" && "bg-emerald-500/10 text-emerald-400",
            variant === "amber" && "bg-amber-500/10 text-amber-400",
            variant === "danger" && "bg-red-500/10 text-red-400",
            variant === "default" && "bg-zinc-800 text-zinc-400"
          )}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-2 mb-3">
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
        <h2 className="text-sm font-semibold text-zinc-100">{title}</h2>
        {subtitle && <span className="text-xs text-zinc-500">{subtitle}</span>}
      </div>
      {action}
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-zinc-500 mb-3">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-medium text-zinc-300 mb-1">{title}</h3>
      {description && <p className="text-xs text-zinc-500 max-w-sm">{description}</p>}
    </div>
  );
}
