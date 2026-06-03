"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function ContactSellerButton({ sellerId }: { sellerId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleContact = async () => {
    if (!user) {
      router.push("?login=true");
      return;
    }
    setLoading(true);
    try {
      const token = await user.getIdToken();
      // Use the chat-server API directly since Next.js doesn't have it
      // wait, the Next.js frontend connects to chat server
      const API_URL = process.env.NEXT_PUBLIC_CHAT_API_URL || "http://localhost:3001";
      const res = await fetch(`${API_URL}/api/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ recipientId: sellerId })
      });
      if (res.ok) {
        const conv = await res.json();
        router.push(`/messages?c=${conv.id}`);
      }
    } catch (e) {
      console.error(e);
      alert("Unable to connect to the chat server. Please ensure it is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleContact}
      disabled={loading}
      className="px-4 py-2 border border-[#e4e5e7] text-[#404145] rounded-lg text-sm font-semibold flex items-center gap-2 hover:border-[#1dbf73] hover:text-[#1dbf73] transition-all disabled:opacity-50"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14} />}
      Contact
    </button>
  );
}
