import React, { useEffect } from "react";
import { X } from "lucide-react";
import Link from "next/link";
import { Avatar } from "./Avatar";

interface ToastProps {
  id: string;
  message: string;
  senderName: string;
  senderAvatar?: string;
  conversationId: string;
  onClose: (id: string) => void;
}

export function Toast({ id, message, senderName, senderAvatar, conversationId, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <div className="bg-white border border-[#e4e5e7] shadow-lg rounded-lg p-4 mb-3 flex items-start gap-3 w-80 animate-in slide-in-from-right-8 pointer-events-auto">
      <Avatar src={senderAvatar || null} alt={senderName} size="md" initials={senderName[0]} />
      <div className="flex-1 min-w-0">
        <Link href={`/messages?c=${conversationId}`} className="block hover:text-[#1dbf73] transition-colors" onClick={() => onClose(id)}>
          <p className="font-semibold text-sm text-[#404145] truncate">{senderName}</p>
          <p className="text-sm text-[#74767e] truncate mt-0.5">{message}</p>
        </Link>
      </div>
      <button onClick={() => onClose(id)} className="text-[#c5c6c9] hover:text-[#74767e] transition-colors flex-shrink-0">
        <X size={16} />
      </button>
    </div>
  );
}
