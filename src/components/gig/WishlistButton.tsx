"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function WishlistButton({ gigId }: { gigId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);

  const handleToggle = () => {
    if (!user) {
      router.push("?login=true");
      return;
    }
    // Toggle state for now
    setIsSaved(!isSaved);
  };

  return (
    <button 
      onClick={handleToggle}
      className={`px-4 py-2 border border-[#e4e5e7] rounded-lg text-sm font-semibold flex items-center justify-center transition-all ${
        isSaved 
          ? "bg-red-50 text-red-500 border-red-200 hover:bg-red-100" 
          : "text-[#404145] hover:border-[#1dbf73] hover:text-[#1dbf73]"
      }`}
      title={isSaved ? "Remove from Wishlist" : "Add to Wishlist"}
    >
      <Heart size={16} fill={isSaved ? "currentColor" : "none"} />
    </button>
  );
}
