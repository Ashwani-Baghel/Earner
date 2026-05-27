"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useAuth } from "./AuthContext";
import { io, Socket } from "socket.io-client";
import { Toast } from "../components/ui/Toast";

interface NotificationContextType {
  socket: Socket | null;
  unreadCount: number;
  decrementUnread: () => void;
  resetUnread: () => void;
  refreshUnreadCount: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  socket: null,
  unreadCount: 0,
  decrementUnread: () => {},
  resetUnread: () => {},
  refreshUnreadCount: () => {},
});

export const useNotification = () => useContext(NotificationContext);

const CHAT_SERVER_URL = process.env.NEXT_PUBLIC_CHAT_SERVER_URL || "http://localhost:3001";

interface ToastData {
  id: string;
  message: string;
  senderName: string;
  senderAvatar?: string;
  conversationId: string;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const socketRef = useRef<Socket | null>(null);

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${CHAT_SERVER_URL}/api/conversations/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  // Fetch initial unread count
  useEffect(() => {
    if (!user || loading) return;
    fetchUnreadCount();
  }, [user, loading]);

  // Connect socket and listen for notifications
  useEffect(() => {
    if (!user || loading) return;

    let isMounted = true;

    const connectSocket = async () => {
      const token = await user.getIdToken();
      const newSocket = io(CHAT_SERVER_URL, {
        auth: { token }
      });

      newSocket.on("connect", () => {
        console.log("Global Notification Socket Connected");
      });

      newSocket.on("new_message_notification", (data: any) => {
        if (!isMounted) return;
        
        // If the user is on the /messages page and actively viewing THIS conversation, 
        // the messages page will mark it as read. Otherwise, we increment unread and show toast.
        // For simplicity, we just check if window.location contains the conversation ID
        // or we just increment it. The messages page will call resetUnread when opened.
        if (typeof window !== "undefined" && window.location.search.includes(data.conversationId)) {
          // User is actively looking at this conversation, do nothing
          return;
        }

        setUnreadCount(prev => prev + 1);
        
        // Show Toast
        const newToast: ToastData = {
          id: Math.random().toString(36).substring(7),
          message: data.text,
          senderName: data.senderName,
          senderAvatar: data.senderAvatar,
          conversationId: data.conversationId,
        };
        
        setToasts(prev => [...prev, newToast]);
      });

      setSocket(newSocket);
      socketRef.current = newSocket;
    };

    connectSocket();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user, loading]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const decrementUnread = () => setUnreadCount(prev => Math.max(0, prev - 1));
  const resetUnread = () => setUnreadCount(0);
  const refreshUnreadCount = () => fetchUnreadCount();

  return (
    <NotificationContext.Provider value={{ socket, unreadCount, decrementUnread, resetUnread, refreshUnreadCount }}>
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
