"use client";

import { useCms } from "@/context/CmsContext";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function AnnouncementBar() {
  const { announcement } = useCms();
  
  if (!announcement || !announcement.isActive) return null;

  return (
    <div 
      className="w-full py-2 px-4 text-center text-sm font-medium z-50 relative flex items-center justify-center gap-2 group"
      style={{ backgroundColor: announcement.backgroundColor || "#0d9488", color: announcement.textColor || "#ffffff" }}
    >
      <span>{announcement.message}</span>
      {announcement.linkUrl && (
        <Link href={announcement.linkUrl} className="underline decoration-white/50 hover:decoration-white transition-all flex items-center gap-1">
          Learn More <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </div>
  );
}
