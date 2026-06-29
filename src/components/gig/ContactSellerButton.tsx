"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebaseClient";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

interface ContactSellerProps {
  sellerId: string;
  sellerName?: string;
  sellerAvatar?: string | null;
}

export function ContactSellerButton({ sellerId, sellerName = "Seller", sellerAvatar = null }: ContactSellerProps) {
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
      if (!db) throw new Error("Firestore is not initialized");

      // Check if conversation already exists
      const convRef = collection(db, "conversations");
      const q = query(
        convRef,
        where("participants", "array-contains", user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      let existingConvId = null;
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.participants && data.participants.includes(sellerId)) {
          existingConvId = doc.id;
        }
      });

      if (existingConvId) {
        router.push(`/messages?c=${existingConvId}`);
      } else {
        // Create new conversation
        const newConv = await addDoc(convRef, {
          participants: [user.uid, sellerId],
          participantDetails: {
            [user.uid]: {
              name: user.displayName || "You",
              avatar: user.photoURL || null
            },
            [sellerId]: {
              name: sellerName,
              avatar: sellerAvatar
            }
          },
          lastMessage: "",
          updatedAt: serverTimestamp()
        });
        
        router.push(`/messages?c=${newConv.id}`);
      }
    } catch (e: any) {
      console.error("Error creating conversation:", e);
      if (e?.code === 'permission-denied') {
        alert("Firestore permissions error: Please update your Firestore Security Rules in the Firebase Console as shown in the Walkthrough.");
      } else {
        alert("Unable to start conversation. Please try again. " + (e?.message || ""));
      }
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
