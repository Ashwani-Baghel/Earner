"use client";

import { useEffect, ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Modal({ open, onClose, title, children, size = "md", className }: ModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) { document.addEventListener("keydown", handleKey); document.body.style.overflow = "hidden"; }
    return () => { document.removeEventListener("keydown", handleKey); document.body.style.overflow = ""; };
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-2xl" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          "relative bg-white rounded-xl shadow-2xl w-full animate-fade-in-up",
          widths[size],
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#e4e5e7]">
            <h2 className="text-lg font-semibold text-[#404145]">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-[#f5f5f5] transition-colors"
              aria-label="Close"
            >
              <X size={20} className="text-[#74767e]" />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
