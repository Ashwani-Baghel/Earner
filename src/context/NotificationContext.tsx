"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { Toast } from "../components/ui/Toast";
import { db } from "@/lib/firebaseClient";
import { collectionGroup, query, where, onSnapshot } from "firebase/firestore";

interface NotificationContextType {
  unreadCount: number;
  decrementUnread: () => void;
  resetUnread: () => void;
  refreshUnreadCount: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  decrementUnread: () => {},
  resetUnread: () => {},
  refreshUnreadCount: () => {},
});

export const useNotification = () => useContext(NotificationContext);

interface ToastData {
  id: string;
  message: string;
  senderName: string;
  senderAvatar?: string;
  conversationId: string;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    if (!user || loading || !db) return;

    let isMounted = true;

    const q = query(
      collectionGroup(db, "messages"),
      where("recipientId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!isMounted) return;
      
      let unread = 0;
      snapshot.docs.forEach((docSnap) => {
        if (docSnap.data().read === false) unread++;
      });
      setUnreadCount(unread);

      // Handle toasts for new messages
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          if (data.read === false) {
            const convId = change.doc.ref.parent.parent?.id;
            
            // If actively viewing this conversation, skip toast
            if (typeof window !== "undefined" && window.location.search.includes(convId || "")) {
              return;
            }

            const newToast: ToastData = {
              id: change.doc.id,
              message: data.text || "You have a new message",
              senderName: data.senderName || "New Message",
              conversationId: convId || "",
            };
            setToasts(prev => [...prev, newToast]);
          }
        }
      });
    }, (error) => {
      console.error("Firestore Notification Listener Error:", error.message);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [user, loading]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const decrementUnread = () => setUnreadCount(prev => Math.max(0, prev - 1));
  const resetUnread = () => setUnreadCount(0);
  const refreshUnreadCount = () => {};

  return (
    <NotificationContext.Provider value={{ unreadCount, decrementUnread, resetUnread, refreshUnreadCount }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col pointer-events-none">
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} onClose={removeToast} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
