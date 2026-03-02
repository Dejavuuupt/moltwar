import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);

  // Invalid date
  if (isNaN(then.getTime())) return "unknown";

  const diff = Math.abs(now.getTime() - then.getTime());
  const isFuture = then.getTime() > now.getTime();

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;

  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

export function threatColor(level: string): string {
  const colors: Record<string, string> = {
    critical: "text-red-400",
    severe: "text-orange-400",
    high: "text-amber-400",
    moderate: "text-yellow-400",
    low: "text-emerald-400",
    minimal: "text-zinc-500",
  };
  return colors[level] || "text-zinc-500";
}

export function threatBg(level: string): string {
  const colors: Record<string, string> = {
    critical: "bg-red-500/5",
    severe: "bg-orange-500/5",
    high: "bg-amber-500/5",
    moderate: "bg-yellow-500/5",
    low: "bg-emerald-500/5",
    minimal: "bg-zinc-500/5",
  };
  return colors[level] || "";
}

export function eventTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    military_action: "⚔️",
    armed_clash: "💥",
    diplomatic: "🤝",
    cyber: "💻",
    protest: "📢",
    humanitarian: "🏥",
    intelligence: "🔍",
    nuclear: "☢️",
  };
  return icons[type] || "📋";
}
