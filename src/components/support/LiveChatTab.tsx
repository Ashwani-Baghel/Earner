"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Bot, User, Loader2, StopCircle } from "lucide-react";
import { useLiveChat } from "@/hooks/useLiveChat";

export function LiveChatTab() {
  const { session, messages, isLoading, isSending, startSession, sendMessage, endSession } = useLiveChat();
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(text);
    setText("");
  };

  if (isLoading && !session) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-teal-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Connecting to chat...</p>
      </div>
    );
  }

  if (!session || session.status === "CLOSED") {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
        <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-6" />
        <h2 className="text-2xl font-black text-slate-900 mb-4">Live Support Chat</h2>
        <p className="text-slate-500 max-w-lg mx-auto mb-8 font-medium">
          Connect instantly with one of our support agents. Average wait time is currently under 3 minutes.
        </p>
        <button 
          onClick={startSession}
          disabled={isLoading}
          className="inline-block px-8 py-3.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? "Starting Session..." : "Start Chat Session"}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
      {/* Chat Header */}
      <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-500/20 rounded-full flex items-center justify-center text-teal-400 border border-teal-500/30">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-bold">Live Support</h3>
            <p className="text-xs text-slate-400">
              {session.status === "WAITING" ? "Waiting for an agent..." : "Agent connected"}
            </p>
          </div>
        </div>
        <button 
          onClick={endSession}
          className="text-xs font-bold bg-slate-800 hover:bg-red-900 hover:text-red-100 text-slate-300 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
        >
          <StopCircle size={14} /> End Chat
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-4">
        {messages.map((msg, i) => {
          const isSystem = msg.senderId === "SYSTEM";
          const isMe = !isSystem && msg.senderId !== session.agentId; // Assuming if not system and not agent, it's user

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-4">
                <span className="text-xs font-bold bg-slate-200 text-slate-600 px-3 py-1 rounded-full shadow-sm">
                  {msg.message}
                </span>
              </div>
            );
          }

          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                isMe ? 'bg-teal-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
              }`}>
                <p className="text-sm font-medium whitespace-pre-wrap leading-relaxed">{msg.message}</p>
              </div>
              <span className="text-[10px] font-bold text-slate-400 mt-1 mx-1">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div className="p-4 bg-white border-t border-slate-200 shrink-0">
        <form onSubmit={handleSend} className="relative">
          <input 
            type="text" 
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isSending}
            placeholder="Type your message..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-4 pr-12 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={!text.trim() || isSending}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-teal-600 text-white rounded-lg flex items-center justify-center hover:bg-teal-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="ml-1" />}
          </button>
        </form>
      </div>
    </div>
  );
}
