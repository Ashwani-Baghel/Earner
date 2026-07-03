"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { toast, Toaster } from "react-hot-toast";
import { db } from "@/lib/firebaseClient";
import { collectionGroup, query, where, onSnapshot, collection } from "firebase/firestore";

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

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

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

            toast((t) => (
              <span className="flex items-center gap-2 cursor-pointer" onClick={() => {
                toast.dismiss(t.id);
                if (typeof window !== "undefined") window.location.href = `/messages?c=${convId}`;
              }}>
                <b>{data.senderName || "New Message"}:</b> {data.text || "You have a new message"}
              </span>
            ), { id: change.doc.id });
          }
        }
      });
    }, (error) => {
      console.error("Firestore Notification Listener Error:", error.message);
    });

    // Listener for system notifications (orders, gigs, etc.)
    const notifQ = query(
      collection(db, "notifications"),
      where("recipientId", "==", user.uid)
    );

    const unsubscribeNotif = onSnapshot(notifQ, (snapshot) => {
      if (!isMounted) return;
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          // We only want to toast for fresh notifications created recently
          const isRecent = data.createdAt ? (Date.now() - data.createdAt) < 60000 : true;
          if (isRecent && data.read === false) {
            toast.success(data.message || "New notification", { id: change.doc.id });
          }
        }
      });
    }, (error) => {
      console.error("Firestore Notifications Listener Error:", error.message);
    });

    return () => {
      isMounted = false;
      unsubscribe();
      unsubscribeNotif();
    };
  }, [user, loading]);



  const decrementUnread = () => setUnreadCount(prev => Math.max(0, prev - 1));
  const resetUnread = () => setUnreadCount(0);
  const refreshUnreadCount = () => {};

  return (
    <NotificationContext.Provider value={{ unreadCount, decrementUnread, resetUnread, refreshUnreadCount }}>
      {children}
      
      {/* React Hot Toast Container */}
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          style: {
            background: '#fff',
            color: '#404145',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            borderRadius: '8px',
            fontSize: '14px'
          },
          success: {
            iconTheme: {
              primary: '#1dbf73',
              secondary: '#fff',
            },
          },
        }}
      />
    </NotificationContext.Provider>
  );
}
