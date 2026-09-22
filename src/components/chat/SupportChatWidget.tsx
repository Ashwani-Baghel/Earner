"use client";

import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";

export function SupportChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setIsSubmitted(true);
    setMessage("");
  };

  return (
    <div 
      className="z-[9999]" 
      style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}
    >
      {isOpen ? (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-80 overflow-hidden flex flex-col transition-all">
          <div className="bg-teal-600 text-white p-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm">Earner Support</h3>
              <p className="text-xs text-teal-100">We typically reply in a few minutes.</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:bg-teal-700 p-1 rounded transition-colors">
              <X size={18} />
            </button>
          </div>
          
          <div className="p-4 bg-slate-50 min-h-[250px] flex flex-col justify-end gap-3">
            <div className="flex gap-2 items-end">
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 text-teal-700 font-bold text-xs">
                S
              </div>
              <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-sm text-sm text-slate-700 shadow-sm">
                Hi there! 👋<br/><br/>
                How may I help you today?
              </div>
            </div>
            {isSubmitted && (
              <div className="flex gap-2 items-end justify-end">
                <div className="bg-teal-600 p-3 rounded-2xl rounded-br-sm text-sm text-white shadow-sm max-w-[85%]">
                  Thanks for reaching out! A support agent will review your request and get back to you shortly.
                </div>
              </div>
            )}
          </div>
          
          {!isSubmitted && (
            <form onSubmit={handleSubmit} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
              <input 
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..." 
                className="flex-1 text-sm bg-slate-100 rounded-full px-4 py-2 outline-none focus:ring-1 focus:ring-teal-500"
              />
              <button 
                type="submit"
                disabled={!message.trim()}
                className="bg-teal-600 hover:bg-teal-700 text-white p-2 rounded-full disabled:opacity-50 transition-colors"
              >
                <Send size={16} />
              </button>
            </form>
          )}
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform animate-bounce"
          style={{ animationDuration: '3s' }}
        >
          <MessageCircle size={28} />
        </button>
      )}
    </div>
  );
}
