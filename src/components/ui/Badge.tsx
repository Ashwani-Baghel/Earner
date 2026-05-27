import { cn } from "../../lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "green" | "yellow" | "blue" | "red" | "outline";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({ children, variant = "default", size = "sm", className }: BadgeProps) {
  const base = "inline-flex items-center font-medium rounded-full";
  const variants = {
    default: "bg-[#f1f1f1] text-[#404145]",
    green: "bg-[#e6f7ef] text-[#1dbf73]",
    yellow: "bg-[#fffce1] text-[#b17c00] border border-[#ffbe00]",
    blue: "bg-[#e6f0ff] text-[#1052d2]",
    red: "bg-red-50 text-red-600",
    outline: "border border-[#e4e5e7] text-[#74767e] bg-white",
  };
  const sizes = { sm: "text-xs px-2 py-0.5", md: "text-sm px-3 py-1" };

  return (
    <span className={cn(base, variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
}
