"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface ChatContextType {
  isChatOpen: boolean;
  activeConvId: string | null;
  openChat: (convId?: string) => void;
  closeChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);

  const openChat = (convId?: string) => {
    if (convId) {
      setActiveConvId(convId);
    }
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
    setActiveConvId(null);
  };

  return (
    <ChatContext.Provider value={{ isChatOpen, activeConvId, openChat, closeChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
