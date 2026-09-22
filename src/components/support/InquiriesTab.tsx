"use client";

import { useState, useEffect, useRef } from "react";
import { Inbox, ExternalLink, Calendar, ChevronRight, ArrowLeft, Send, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

interface Inquiry {
  id: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

export function InquiriesTab() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  
  // Conversation View State
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(0);

  useEffect(() => {
    fetchInquiries();
  }, [user]);

  const fetchInquiries = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/inquiries/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setInquiries(data.inquiries);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedInquiryId || !user) return;
    const fetchDetails = async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch(`/api/inquiries/${selectedInquiryId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setSelectedInquiry(data.inquiry);
      } catch (e) {
        console.error(e);
      }
    };
    fetchDetails();
    const interval = setInterval(fetchDetails, 5000);
    return () => clearInterval(interval);
  }, [selectedInquiryId, user]);

  useEffect(() => {
    const currentLength = selectedInquiry?.replies?.length || 0;
    if (currentLength > prevMessagesLengthRef.current) {
      if (chatContainerRef.current) {
        setTimeout(() => {
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
          }
        }, 100);
      }
    }
    prevMessagesLengthRef.current = currentLength;
  }, [selectedInquiry?.replies?.length]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedInquiryId || !user) return;
    setIsReplying(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/inquiries/${selectedInquiryId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: replyText })
      });
      if (res.ok) {
        setReplyText("");
        const data = await res.json();
        setSelectedInquiry((prev: any) => ({ ...prev, replies: [...prev.replies, data.reply] }));
      }
    } catch (e) {
      toast.error("Failed to send reply");
    } finally {
      setIsReplying(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500 animate-pulse">Loading inquiries...</div>;
  }

  if (error) {
    return <div className="p-12 text-center text-red-500 bg-red-50 rounded-2xl border border-red-200">Error loading inquiries: {error}</div>;
  }

  if (selectedInquiryId) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[600px] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center gap-4 bg-slate-50/50">
          <button onClick={() => { setSelectedInquiryId(null); setSelectedInquiry(null); }} className="p-2 hover:bg-slate-200 bg-slate-100 rounded-full transition-colors text-slate-600">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-900">{selectedInquiry?.subject || "Loading..."}</h2>
            <p className="text-sm font-medium text-slate-500">#{selectedInquiry?.id?.slice(-6)}</p>
          </div>
        </div>

        {/* Messages */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 scroll-smooth">
          {!selectedInquiry ? (
            <div className="flex justify-center items-center h-full"><div className="animate-spin w-8 h-8 border-4 border-teal-500/30 border-t-teal-500 rounded-full" /></div>
          ) : (
            <>
              {/* Initial Message */}
              <div className="flex flex-col items-end">
                <span className="text-[11px] font-bold text-slate-400 mb-1 ml-1">You</span>
                <div className="max-w-[85%] sm:max-w-[70%] rounded-2xl px-5 py-3.5 bg-teal-600 text-white rounded-tr-sm shadow-md shadow-teal-500/20">
                  <p className="text-[15px] whitespace-pre-wrap leading-relaxed">{selectedInquiry.message}</p>
                  <div className="text-[10px] mt-2 font-medium text-teal-100">
                    {new Date(selectedInquiry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              
              {/* Replies */}
              {selectedInquiry.replies.map((msg: any) => (
                <div key={msg.id} className={`flex flex-col ${msg.senderRole === 'USER' ? 'items-end' : 'items-start'}`}>
                  <span className="text-[11px] font-bold text-slate-400 mb-1 ml-1">
                    {msg.senderRole === 'USER' ? 'You' : msg.senderRole === 'SYSTEM' ? 'Automated Support' : 'Support Agent'}
                  </span>
                  <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-5 py-3.5 ${msg.senderRole === 'USER' ? 'bg-teal-600 text-white rounded-tr-sm shadow-md shadow-teal-500/20' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'}`}>
                    <p className="text-[15px] whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-3 flex gap-2 flex-wrap">
                        {msg.attachments.map((url: string, i: number) => (
                          <a key={i} href={url} target="_blank" rel="noreferrer" className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-colors ${msg.senderRole === 'USER' ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                            <FileText size={12} /> Attachment {i + 1}
                          </a>
                        ))}
                      </div>
                    )}
                    <div className={`text-[10px] mt-2 font-medium ${msg.senderRole === 'USER' ? 'text-teal-100' : 'text-slate-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Reply Box */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <form onSubmit={handleReply} className="flex gap-3">
            <textarea 
              value={replyText} 
              onChange={e => setReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleReply(e as any);
                }
              }}
              placeholder="Type your reply here..."
              rows={1}
              className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium resize-none min-h-[52px] max-h-[150px]"
            />
            <button type="submit" disabled={isReplying || !replyText.trim()} className="px-6 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-md flex items-center gap-2">
              {isReplying ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={18} />}
              Send
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Inbox className="text-teal-600" /> My Inquiries
          </h2>
          <p className="text-slate-500 mt-1 font-medium">History of messages sent via the Contact form.</p>
        </div>
        <Link 
          href="/contact"
          className="flex items-center gap-2 bg-white text-slate-900 border border-slate-200 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ExternalLink size={18} /> New Inquiry
        </Link>
      </div>

      {inquiries.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
          <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700 mb-2">No inquiries found</h3>
          <p className="text-slate-500 max-w-sm mx-auto">You haven't submitted any general inquiries via our contact form.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map(inquiry => (
            <div key={inquiry.id} onClick={() => {
              setSelectedInquiryId(inquiry.id);
              // Optimistically clear the unread badge
              setInquiries(prev => prev.map(i => i.id === inquiry.id ? { ...i, userHasUnread: false } : i));
            }} className="group p-5 border border-slate-200 rounded-2xl bg-white flex flex-col md:flex-row gap-4 justify-between items-start md:items-center hover:border-teal-500 hover:shadow-md transition-all cursor-pointer">
              <div className="flex-1 w-full">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-slate-400">#{inquiry.id.slice(-6)}</span>
                  <span className={`px-2 py-0.5 text-[11px] font-bold rounded ${
                    inquiry.status === 'UNREAD' || inquiry.status === 'NEW' ? 'bg-amber-100 text-amber-700' : 
                    inquiry.status === 'REPLIED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {inquiry.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">{inquiry.subject}</h3>
                  {inquiry.userHasUnread && (
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] uppercase font-black tracking-wider rounded-full flex items-center shadow-sm">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-1.5 animate-pulse" />
                      New Reply
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 font-medium line-clamp-1">{inquiry.message}</p>
              </div>
              <div className="text-right flex items-center md:flex-col gap-4 md:gap-1 w-full md:w-auto justify-between md:justify-center border-t md:border-t-0 border-slate-100 pt-3 md:pt-0 shrink-0">
                <div className="flex items-center gap-1 text-xs font-medium text-slate-400">
                  <Calendar size={12} /> {formatDistanceToNow(new Date(inquiry.createdAt))} ago
                </div>
                <ChevronRight className="text-slate-300 group-hover:text-teal-500 transition-colors hidden md:block" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
