"use client";

import { useState, useEffect, useRef } from "react";
import { Ticket, Plus, MessageSquare, ChevronRight, AlertCircle, Clock, CheckCircle, X, Upload, FileText, Image as ImageIcon, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

interface TicketModel {
  id: string;
  subject: string;
  department: string;
  status: string;
  priority: string;
  createdAt: string;
  _count?: { messages: number };
}

export function TicketsTab() {
  const [tickets, setTickets] = useState<TicketModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [department, setDepartment] = useState("General Support");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(0);

  // Conversation View State
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [user]);

  const fetchTickets = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/tickets", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setTickets(data.tickets);
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
    if (!selectedTicketId || !user) return;
    const fetchDetails = async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch(`/api/tickets/${selectedTicketId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setSelectedTicket(data.ticket);
      } catch (e) {
        console.error(e);
      }
    };
    fetchDetails();
    const interval = setInterval(fetchDetails, 5000);
    return () => clearInterval(interval);
  }, [selectedTicketId, user]);

  useEffect(() => {
    const currentLength = selectedTicket?.messages?.length || 0;
    if (currentLength > prevMessagesLengthRef.current) {
      if (chatContainerRef.current) {
        // Use timeout to allow React to render the new messages before scrolling
        setTimeout(() => {
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
          }
        }, 100);
      }
    }
    prevMessagesLengthRef.current = currentLength;
  }, [selectedTicket?.messages?.length]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicketId || !user) return;
    setIsReplying(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/tickets/${selectedTicketId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: replyText })
      });
      if (res.ok) {
        setReplyText("");
        const data = await res.json();
        setSelectedTicket((prev: any) => ({ ...prev, messages: [...prev.messages, data.message] }));
      }
    } catch (e) {
      toast.error("Failed to send reply");
    } finally {
      setIsReplying(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = selectedFiles.filter(file => file.size <= 5 * 1024 * 1024); // 5MB limit
      
      if (validFiles.length !== selectedFiles.length) {
        toast.error("Some files are too large (max 5MB)");
      }
      
      setFiles(prev => [...prev, ...validFiles].slice(0, 3)); // Max 3 files
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await user.getIdToken();
      let attachmentUrls: string[] = [];

      // Upload files if any
      if (files.length > 0) {
        const uploadPromises = files.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          
          if (!uploadRes.ok) {
            throw new Error(`Failed to upload ${file.name}`);
          }
          
          const uploadData = await uploadRes.json();
          return uploadData.url;
        });
        attachmentUrls = await Promise.all(uploadPromises);
      }

      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          subject,
          department,
          message,
          attachments: attachmentUrls
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Ticket created successfully!");
        setTickets([data.ticket, ...tickets]);
        setIsModalOpen(false);
        setSubject("");
        setMessage("");
        setFiles([]);
      } else {
        toast.error(data.error || "Failed to create ticket");
      }
    } catch (err: any) {
      toast.error("An error occurred");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500 animate-pulse">Loading tickets...</div>;
  }

  if (error) {
    return <div className="p-12 text-center text-red-500 bg-red-50 rounded-2xl border border-red-200">Error loading tickets: {error}</div>;
  }

  if (selectedTicketId) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[600px] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center gap-4 bg-slate-50/50">
          <button onClick={() => { setSelectedTicketId(null); setSelectedTicket(null); }} className="p-2 hover:bg-slate-200 bg-slate-100 rounded-full transition-colors text-slate-600">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-900">{selectedTicket?.subject || "Loading..."}</h2>
            <p className="text-sm font-medium text-slate-500">#{selectedTicket?.id?.slice(-6)} • {selectedTicket?.department}</p>
          </div>
        </div>

        {/* Messages */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 scroll-smooth">
          {!selectedTicket ? (
            <div className="flex justify-center items-center h-full"><div className="animate-spin w-8 h-8 border-4 border-teal-500/30 border-t-teal-500 rounded-full" /></div>
          ) : (
            selectedTicket.messages.map((msg: any) => (
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
            ))
          )}
          <div ref={messagesEndRef} />
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
            <Ticket className="text-teal-600" /> My Tickets
          </h2>
          <p className="text-slate-500 mt-1 font-medium">Track your support requests and issues.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-md"
        >
          <Plus size={18} /> New Ticket
        </button>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
          <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700 mb-2">No tickets yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto">You haven't submitted any support tickets. If you need help, create a new ticket above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map(ticket => (
            <div key={ticket.id} onClick={() => {
              setSelectedTicketId(ticket.id);
              // Optimistically clear the unread badge
              setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, userHasUnread: false } : t));
            }} className="group p-5 border border-slate-200 rounded-2xl hover:border-teal-500 hover:shadow-md transition-all bg-white cursor-pointer flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold text-slate-400">#{ticket.id.slice(-6)}</span>
                  {ticket.status === 'OPEN' && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[11px] font-bold rounded flex items-center gap-1"><AlertCircle size={10} /> OPEN</span>}
                  {ticket.status === 'PENDING' && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[11px] font-bold rounded flex items-center gap-1"><Clock size={10} /> PENDING</span>}
                  {ticket.status === 'RESOLVED' && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[11px] font-bold rounded flex items-center gap-1"><CheckCircle size={10} /> RESOLVED</span>}
                  {ticket.status === 'CLOSED' && <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[11px] font-bold rounded">CLOSED</span>}
                </div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">{ticket.subject}</h3>
                  {ticket.userHasUnread && (
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] uppercase font-black tracking-wider rounded-full flex items-center shadow-sm">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-1.5 animate-pulse" />
                      New Reply
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 font-medium">
                  <span>{ticket.department}</span>
                  <span className="flex items-center gap-1"><MessageSquare size={14}/> {ticket._count?.messages || 1} messages</span>
                </div>
              </div>
              <div className="text-right flex items-center md:flex-col gap-4 md:gap-1 w-full md:w-auto justify-between md:justify-center border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                <span className="text-sm font-medium text-slate-400">Updated {formatDistanceToNow(new Date(ticket.createdAt))} ago</span>
                <ChevronRight className="text-slate-300 group-hover:text-teal-500 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Ticket className="text-teal-600 w-5 h-5" /> New Support Ticket
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Brief summary of the issue"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Category</label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium text-slate-700"
                >
                  <option value="General Support">General Support</option>
                  <option value="Orders">Orders</option>
                  <option value="Technical">Technical</option>
                  <option value="Seller Support">Seller Support</option>
                  <option value="Disputes">Disputes</option>
                  <option value="Billing & Payments">Billing & Payments</option>
                  <option value="Trust & Safety">Trust & Safety</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Details</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Please describe your issue in detail..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Attachments (Proof)</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-slate-400" />
                      <p className="mb-1 text-sm text-slate-500"><span className="font-bold">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-slate-400">PNG, JPG, PDF (MAX 5MB, up to 3 files)</p>
                    </div>
                    <input type="file" className="hidden" multiple accept="image/*,.pdf" onChange={handleFileChange} />
                  </label>
                </div>
                
                {files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {files.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 overflow-hidden">
                          {file.type.startsWith('image/') ? <ImageIcon size={18} className="text-teal-500 flex-shrink-0"/> : <FileText size={18} className="text-blue-500 flex-shrink-0"/>}
                          <span className="text-sm font-medium text-slate-700 truncate">{file.name}</span>
                        </div>
                        <button type="button" onClick={() => removeFile(idx)} className="text-slate-400 hover:text-red-500 p-1">
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                      Submitting...
                    </>
                  ) : (
                    "Create Ticket"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
