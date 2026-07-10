import Image from "next/image";
import { cn } from "../../lib/utils";

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  online?: boolean;
  initials?: string;
  className?: string;
}

const sizes = { xs: 24, sm: 32, md: 40, lg: 56, xl: 80 };
const sizeClasses = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-14 w-14 text-lg",
  xl: "h-20 w-20 text-2xl",
};

export function Avatar({ src, alt, size = "md", online, initials, className }: AvatarProps) {
  const px = sizes[size];
  const cls = sizeClasses[size];

  return (
    <div className={cn("relative flex-shrink-0", className)}>
      <div className={cn("rounded-full overflow-hidden bg-[#e4e5e7] flex items-center justify-center", cls)}>
        {src ? (
          <Image src={src} alt={alt} width={px} height={px} className="object-cover w-full h-full" unoptimized />
        ) : (
          <span className="font-semibold text-[#404145]">
            {initials || (alt ? alt.charAt(0).toUpperCase() : "U")}
          </span>
        )}
      </div>
      {online !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-white",
            size === "xs" || size === "sm" ? "h-2 w-2" : "h-3 w-3",
            online ? "bg-[#1dbf73]" : "bg-[#b5b6ba]"
          )}
        />
      )}
    </div>
  );
}
