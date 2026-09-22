"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

export interface LiveChatMessage {
  id: string;
  senderId: string;
  message: string;
  createdAt: string;
}

export interface LiveChatSession {
  id: string;
  status: "WAITING" | "ACTIVE" | "CLOSED";
  agentId?: string;
  messages: LiveChatMessage[];
}

export function useLiveChat() {
  const [session, setSession] = useState<LiveChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  const { user } = useAuth();

  // Fetch the active session
  const fetchSession = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/chat", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.session) {
        setSession(data.session);
        setIsPolling(data.session.status !== "CLOSED");
      } else {
        setIsPolling(false);
      }
    } catch (error) {
      console.error("Error fetching chat session:", error);
    }
  }, []);

  // Poll for new messages every 3 seconds if active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPolling) {
      interval = setInterval(() => {
        fetchSession();
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPolling, fetchSession]);

  // Initial fetch
  useEffect(() => {
    setIsLoading(true);
    fetchSession().finally(() => setIsLoading(false));
  }, [fetchSession]);

  const startSession = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action: "START" })
      });
      const data = await res.json();
      if (res.ok && data.session) {
        setSession(data.session);
        setIsPolling(true);
      } else {
        toast.error(data.error || "Failed to start chat");
      }
    } catch (error) {
      console.error("Error starting chat:", error);
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!session || !text.trim() || !user) return;
    
    setIsSending(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          action: "MESSAGE", 
          sessionId: session.id,
          message: text 
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        // Optimistically update
        setSession({
          ...session,
          messages: [...session.messages, data.message]
        });
      } else {
        toast.error(data.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("An error occurred");
    } finally {
      setIsSending(false);
    }
  };

  const endSession = async () => {
    if (!session || !user) return;
    try {
      const token = await user.getIdToken();
      await fetch("/api/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action: "CLOSE", sessionId: session.id })
      });
      setSession(prev => prev ? { ...prev, status: "CLOSED" } : null);
      setIsPolling(false);
      toast.success("Chat session ended");
    } catch (error) {
      console.error("Error ending chat:", error);
    }
  };

  return {
    session,
    messages: session?.messages || [],
    isLoading,
    isSending,
    startSession,
    sendMessage,
    endSession
  };
}
