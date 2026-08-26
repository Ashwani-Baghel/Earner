"use client";

import { useState } from "react";
import { 
  LifeBuoy, Search, Filter, MessageSquare, CheckCircle, Clock, 
  AlertCircle, X, UserPlus, ArrowUpRight, RefreshCcw, AlertTriangle, 
  User, Send, Paperclip, MoreHorizontal, Tag, Link as LinkIcon, 
  Archive, FileText, Activity, GitMerge, FileLock2, ShieldAlert
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

type TicketStatus = "OPEN" | "PENDING" | "RESOLVED" | "CLOSED";
type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
type Department = "General Inquiry" | "Billing" | "Technical Support" | "Partnership Opportunity" | "Trust & Safety";
type TabView = "conversation" | "details" | "history";
type ComposerMode = "reply" | "note";

interface Ticket {
  id: string;
  subject: string;
  customer: string;
  email: string;
  avatar: string;
  status: TicketStatus;
  priority: TicketPriority;
  department: Department;
  time: string;
  category: string;
  assignedTo: string | null;
  tags: string[];
  linkedEntities: { type: "Order" | "User" | "Payment" | "Dispute", id: string }[];
  messages: { id: string; sender: "user" | "agent" | "system" | "note"; text: string; time: string; author?: string }[];
  history: { id: string; action: string; user: string; time: string }[];
  isArchived: boolean;
}

const MOCK_TICKETS: Ticket[] = [
  {
    id: "TKT-1049",
    subject: "Payment not going through",
    customer: "Sarah Jenkins",
    email: "sarah.j@example.com",
    avatar: "https://i.pravatar.cc/150?u=sarah",
    status: "OPEN",
    priority: "HIGH",
    department: "Billing",
    time: "10 mins ago",
    category: "Payment Issue",
    assignedTo: null,
    tags: ["billing", "urgent"],
    linkedEntities: [{ type: "Payment", id: "PAY-9923" }],
    isArchived: false,
    messages: [
      { id: "m1", sender: "user", text: "I tried to pay for a gig but my card keeps getting declined. I've tried twice.", time: "10 mins ago", author: "Sarah Jenkins" }
    ],
    history: [
      { id: "h1", action: "Ticket Created", user: "System", time: "10 mins ago" }
    ]
  },
  {
    id: "TKT-1048",
    subject: "How do I upgrade to Premium?",
    customer: "Michael Chang",
    email: "mike.c@example.com",
    avatar: "https://i.pravatar.cc/150?u=mike",
    status: "PENDING",
    priority: "MEDIUM",
    department: "General Inquiry",
    time: "2 hours ago",
    category: "Account Management",
    assignedTo: "Agent Sarah",
    tags: ["upgrade", "question"],
    linkedEntities: [{ type: "User", id: "USR-402" }],
    isArchived: false,
    messages: [
      { id: "m1", sender: "user", text: "Where can I find the premium upgrade option?", time: "2 hours ago", author: "Michael Chang" },
      { id: "m2", sender: "agent", text: "Hi Michael! You can upgrade from your Account Settings page. Let me know if you need a direct link.", time: "1 hour ago", author: "Agent Sarah" },
      { id: "m3", sender: "note", text: "Customer might need manual upgrade link if they are on the old UI.", time: "55 mins ago", author: "Agent Sarah" }
    ],
    history: [
      { id: "h1", action: "Ticket Created", user: "System", time: "2 hours ago" },
      { id: "h2", action: "Assigned to Agent Sarah", user: "System", time: "1 hour ago" },
      { id: "h3", action: "Status changed to PENDING", user: "Agent Sarah", time: "1 hour ago" }
    ]
  },
];

const AGENTS = ["Agent Sarah", "Agent Mike", "Tech Lead Mark", "Super Admin"];
const DEPARTMENTS: Department[] = ["General Inquiry", "Billing", "Technical Support", "Partnership Opportunity", "Trust & Safety"];

export function TicketManager() {
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabView>("conversation");
  const [composerMode, setComposerMode] = useState<ComposerMode>("reply");
  const [replyText, setReplyText] = useState("");
  const [newTag, setNewTag] = useState("");

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  // --- ACTIONS ---

  const updateTicket = (id: string, updates: Partial<Ticket>, logAction?: string) => {
    setTickets(tickets.map(t => {
      if (t.id === id) {
        const updated = { ...t, ...updates };
        if (logAction) {
          updated.history = [{ id: Date.now().toString(), action: logAction, user: "Super Admin", time: "Just now" }, ...t.history];
        }
        return updated;
      }
      return t;
    }));
  };

  const handleStatusChange = (id: string, newStatus: TicketStatus) => {
    updateTicket(id, { status: newStatus }, `Status changed to ${newStatus}`);
  };

  const handlePriorityChange = (id: string, newPriority: TicketPriority) => {
    updateTicket(id, { priority: newPriority }, `Priority changed to ${newPriority}`);
  };

  const handleDepartmentChange = (id: string, newDept: Department) => {
    updateTicket(id, { department: newDept }, `Moved to department: ${newDept}`);
  };

  const handleAssign = (id: string, agent: string) => {
    updateTicket(id, { assignedTo: agent || null }, agent ? `Assigned to ${agent}` : "Unassigned");
  };

  const handleEscalate = (id: string) => {
    setTickets(tickets.map(t => {
      if (t.id === id) {
        return { 
          ...t, 
          priority: "URGENT",
          messages: [...t.messages, { id: Date.now().toString(), sender: "system", text: "Ticket escalated to Tier 2 Support / Super Admin.", time: "Just now" }],
          history: [{ id: Date.now().toString(), action: "Ticket Escalated", user: "Super Admin", time: "Just now" }, ...t.history]
        };
      }
      return t;
    }));
  };

  const handleAddTag = (id: string) => {
    if (!newTag.trim() || !selectedTicket) return;
    if (!selectedTicket.tags.includes(newTag.trim().toLowerCase())) {
      updateTicket(id, { tags: [...selectedTicket.tags, newTag.trim().toLowerCase()] }, `Added tag: ${newTag.trim().toLowerCase()}`);
    }
    setNewTag("");
  };

  const handleRemoveTag = (id: string, tagToRemove: string) => {
    if (!selectedTicket) return;
    updateTicket(id, { tags: selectedTicket.tags.filter(t => t !== tagToRemove) }, `Removed tag: ${tagToRemove}`);
  };

  const handleArchive = (id: string) => {
    updateTicket(id, { isArchived: true, status: "CLOSED" }, "Ticket archived and closed");
    setSelectedTicketId(null); // close drawer
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedTicketId || !selectedTicket) return;
    const newMessage = { 
      id: Date.now().toString(), 
      sender: composerMode === "note" ? "note" : "agent" as const, 
      text: replyText, 
      time: "Just now",
      author: "Super Admin"
    };
    updateTicket(selectedTicketId, { 
      messages: [...selectedTicket.messages, newMessage] 
    }, composerMode === "note" ? "Added internal note" : "Replied to customer");
    setReplyText("");
  };

  const activeTickets = tickets.filter(t => !t.isArchived && (
    t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.customer.toLowerCase().includes(searchQuery.toLowerCase())
  ));

  return (
    <div className="relative flex h-[calc(100vh-69px)] bg-slate-50 overflow-hidden">
      
      {/* Main Table Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${selectedTicket ? 'pr-[600px] xl:pr-[700px]' : ''}`}>
        <div className="p-6 max-w-7xl mx-auto w-full space-y-6 overflow-y-auto">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <LifeBuoy className="text-teal-600" size={24} />
                Tickets
              </h1>
              <p className="text-slate-500 text-sm mt-1">Manage customer support tickets, escalate, and resolve issues.</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text"
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 shadow-sm"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                <Filter size={16} />
                Filter
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Tickets</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">1,248</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <MessageSquare size={20} />
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Open Tickets</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">24</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                <Clock size={20} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">High Priority</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">5</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                <AlertCircle size={20} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Resolved Today</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">18</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle size={20} />
              </div>
            </div>
          </div>

          {/* Tickets Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4 flex gap-6 overflow-x-auto hide-scrollbar">
              <button className="text-sm font-semibold text-teal-700 border-b-2 border-teal-600 pb-4 -mb-4 whitespace-nowrap">All Active</button>
              <button className="text-sm font-medium text-slate-500 hover:text-slate-700 pb-4 -mb-4 whitespace-nowrap">Unassigned</button>
              <button className="text-sm font-medium text-slate-500 hover:text-slate-700 pb-4 -mb-4 whitespace-nowrap">My Tickets</button>
              <button className="text-sm font-medium text-slate-500 hover:text-slate-700 pb-4 -mb-4 whitespace-nowrap">Archived</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 bg-slate-50/50">
                    <th className="px-6 py-4 font-semibold">Ticket</th>
                    <th className="px-6 py-4 font-semibold">Requester</th>
                    <th className="px-6 py-4 font-semibold">Department</th>
                    <th className="px-6 py-4 font-semibold">Status / Priority</th>
                    <th className="px-6 py-4 font-semibold">Assignee</th>
                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeTickets.map((ticket) => (
                    <tr 
                      key={ticket.id} 
                      onClick={() => { setSelectedTicketId(ticket.id); setActiveTab("conversation"); }}
                      className={`hover:bg-slate-50 transition-colors group cursor-pointer ${selectedTicketId === ticket.id ? 'bg-teal-50/30' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-900">{ticket.id}</div>
                        <div className="text-xs text-slate-500 line-clamp-1 max-w-[150px]">{ticket.subject}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Avatar src={ticket.avatar} alt={ticket.customer} size="sm" />
                          <div>
                            <div className="text-sm font-medium text-slate-900">{ticket.customer}</div>
                            <div className="text-xs text-slate-500">{ticket.time}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                        {ticket.department}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 items-start">
                          {ticket.status === 'OPEN' && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">OPEN</span>}
                          {ticket.status === 'PENDING' && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">PENDING</span>}
                          {ticket.status === 'RESOLVED' && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">RESOLVED</span>}
                          {ticket.status === 'CLOSED' && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">CLOSED</span>}

                          {ticket.priority === 'URGENT' && <span className="flex items-center gap-1 text-[11px] font-bold text-red-700"><span className="w-1.5 h-1.5 rounded-full bg-red-700 animate-pulse"></span> URGENT</span>}
                          {ticket.priority === 'HIGH' && <span className="flex items-center gap-1 text-[11px] font-bold text-red-500"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> High</span>}
                          {ticket.priority === 'MEDIUM' && <span className="flex items-center gap-1 text-[11px] font-bold text-amber-500"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Medium</span>}
                          {ticket.priority === 'LOW' && <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400"><span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Low</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {ticket.assignedTo ? (
                          <div className="flex items-center gap-1.5 text-sm text-slate-700 font-medium">
                            <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[10px] font-bold">
                              {ticket.assignedTo.charAt(0)}
                            </div>
                            {ticket.assignedTo}
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="px-3 py-1.5 text-sm font-semibold text-teal-700 bg-teal-50 border border-teal-100 rounded-lg hover:bg-teal-100 transition-colors">
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                  {activeTickets.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        <CheckCircle size={32} className="mx-auto text-slate-300 mb-3" />
                        <p className="font-semibold text-slate-700">No tickets found</p>
                        <p className="text-sm">You are all caught up!</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Right Drawer (Pro Ticket Details) */}
      <div 
        className={`absolute top-0 right-0 h-full w-[600px] xl:w-[700px] bg-white border-l border-slate-200 shadow-2xl transition-transform duration-300 flex flex-col z-20 ${
          selectedTicket ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedTicket && (
          <>
            {/* Top Toolbar / Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex flex-col gap-3 bg-slate-50/80">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-black text-slate-900">{selectedTicket.id}</h2>
                    {selectedTicket.status === 'CLOSED' ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-200 text-slate-600">CLOSED</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-100 text-teal-700">{selectedTicket.status}</span>
                    )}
                    {selectedTicket.priority === 'URGENT' && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-700 flex items-center gap-1">
                        <AlertTriangle size={10} /> URGENT
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-slate-700">{selectedTicket.subject}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleArchive(selectedTicket.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors tooltip-trigger" title="Archive / Delete">
                    <Archive size={18} />
                  </button>
                  <button onClick={() => handleEscalate(selectedTicket.id)} className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Escalate Ticket">
                    <ShieldAlert size={18} />
                  </button>
                  <button onClick={() => {}} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors" title="Merge Ticket">
                    <GitMerge size={18} />
                  </button>
                  <button 
                    onClick={() => handleStatusChange(selectedTicket.id, selectedTicket.status === 'CLOSED' ? 'OPEN' : 'CLOSED')} 
                    className={`p-2 rounded-lg transition-colors ${
                      selectedTicket.status === 'CLOSED' 
                        ? 'text-amber-500 hover:bg-amber-50 hover:text-amber-700' 
                        : 'text-emerald-500 hover:bg-emerald-50 hover:text-emerald-700'
                    }`} 
                    title={selectedTicket.status === 'CLOSED' ? "Reopen Ticket" : "Close Ticket"}
                  >
                    {selectedTicket.status === 'CLOSED' ? <RefreshCcw size={18} /> : <CheckCircle size={18} />}
                  </button>
                  <div className="w-px h-6 bg-slate-200 mx-1"></div>
                  <button onClick={() => setSelectedTicketId(null)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-full transition-colors ml-1">
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              {/* Drawer Tabs */}
              <div className="flex gap-1 mt-2 bg-slate-200/50 p-1 rounded-xl w-fit">
                <button 
                  onClick={() => setActiveTab("conversation")}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'conversation' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Conversation
                </button>
                <button 
                  onClick={() => setActiveTab("details")}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'details' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Ticket Details
                </button>
                <button 
                  onClick={() => setActiveTab("history")}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Audit Log
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-white flex flex-col">
              
              {/* ----------------- CONVERSATION TAB ----------------- */}
              {activeTab === "conversation" && (
                <>
                  <div className="flex-1 p-6 space-y-6">
                    {selectedTicket.messages.map((msg) => (
                      <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-start' : msg.sender === 'system' ? 'items-center' : 'items-end'}`}>
                        {msg.sender === 'system' ? (
                          <div className="bg-slate-100 border border-slate-200 px-4 py-2 rounded-full flex items-center gap-2 my-2 shadow-sm">
                            <Activity size={14} className="text-slate-500" />
                            <span className="text-xs font-semibold text-slate-600">{msg.text}</span>
                          </div>
                        ) : msg.sender === 'note' ? (
                          <div className="max-w-[85%] bg-[#FFF9C4] border border-[#FBC02D] rounded-2xl px-5 py-4 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 bg-[#FBC02D] text-[#F57F17] text-[10px] font-black px-2 py-0.5 rounded-bl-lg tracking-wider">INTERNAL NOTE</div>
                            <p className="text-sm text-slate-800 font-medium whitespace-pre-wrap">{msg.text}</p>
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#FFF176]">
                              <FileLock2 size={12} className="text-yellow-700" />
                              <span className="text-[10px] font-bold text-yellow-700 uppercase">
                                {msg.author} • {msg.time}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className={`max-w-[85%] rounded-2xl shadow-sm overflow-hidden ${
                            msg.sender === 'user' ? 'bg-slate-50 border border-slate-200' : 'bg-teal-700 text-white'
                          }`}>
                            <div className={`px-4 py-2 flex items-center gap-2 border-b ${msg.sender === 'user' ? 'border-slate-200 bg-white' : 'border-teal-600 bg-teal-800'}`}>
                              {msg.sender === 'user' ? <Avatar src={selectedTicket.avatar} alt="User" size="sm" /> : <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center"><ShieldAlert size={12} className="text-white" /></div>}
                              <span className={`text-xs font-bold ${msg.sender === 'user' ? 'text-slate-900' : 'text-teal-50'}`}>{msg.author}</span>
                              <span className={`text-[10px] font-medium ml-auto ${msg.sender === 'user' ? 'text-slate-400' : 'text-teal-300'}`}>{msg.time}</span>
                            </div>
                            <div className="px-5 py-4">
                              <p className={`text-sm leading-relaxed ${msg.sender === 'user' ? 'text-slate-800' : 'text-white'}`}>{msg.text}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Composer */}
                  <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0">
                    <div className="max-w-4xl mx-auto rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all">
                      <div className="flex border-b border-slate-100 bg-slate-50/50">
                        <button 
                          onClick={() => setComposerMode("reply")}
                          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${composerMode === 'reply' ? 'bg-white text-teal-700 border-b-2 border-teal-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                        >
                          Reply to Customer
                        </button>
                        <button 
                          onClick={() => setComposerMode("note")}
                          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${composerMode === 'note' ? 'bg-[#FFF9C4] text-[#F57F17] border-b-2 border-[#FBC02D]' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                        >
                          Internal Note
                        </button>
                      </div>
                      <div className={`p-3 ${composerMode === 'note' ? 'bg-[#FFFDE7]' : 'bg-white'}`}>
                        <textarea 
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={composerMode === 'reply' ? "Type a message to the customer..." : "Type a private note visible only to admins..."}
                          className="w-full bg-transparent border-none focus:ring-0 resize-none text-sm text-slate-900 min-h-[80px]"
                        />
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
                          <div className="flex gap-1">
                            <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Attach File">
                              <Paperclip size={18} />
                            </button>
                            <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Canned Response">
                              <FileText size={18} />
                            </button>
                          </div>
                          <button 
                            onClick={handleSendReply}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white shadow-sm transition-colors ${
                              composerMode === 'reply' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-[#FBC02D] hover:bg-[#F9A825] text-yellow-900'
                            }`}
                          >
                            <Send size={16} />
                            {composerMode === 'reply' ? 'Send Reply' : 'Add Note'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ----------------- DETAILS TAB ----------------- */}
              {activeTab === "details" && (
                <div className="p-6 space-y-8">
                  {/* User Profile Card */}
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex items-start gap-4">
                    <Avatar src={selectedTicket.avatar} alt={selectedTicket.customer} size="lg" />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900">{selectedTicket.customer}</h3>
                      <p className="text-sm text-slate-500 mb-3">{selectedTicket.email}</p>
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50">View Profile</button>
                        <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50">Order History</button>
                      </div>
                    </div>
                  </div>

                  {/* Core Attributes */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                      <select 
                        value={selectedTicket.status}
                        onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value as TicketStatus)}
                        className="w-full text-sm font-semibold text-slate-800 py-2.5 px-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 shadow-sm"
                      >
                        <option value="OPEN">Open</option>
                        <option value="PENDING">Pending (Waiting on Customer)</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Priority</label>
                      <select 
                        value={selectedTicket.priority}
                        onChange={(e) => handlePriorityChange(selectedTicket.id, e.target.value as TicketPriority)}
                        className="w-full text-sm font-semibold text-slate-800 py-2.5 px-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 shadow-sm"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Department</label>
                      <select 
                        value={selectedTicket.department}
                        onChange={(e) => handleDepartmentChange(selectedTicket.id, e.target.value as Department)}
                        className="w-full text-sm font-semibold text-slate-800 py-2.5 px-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 shadow-sm"
                      >
                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assignee</label>
                      <select 
                        value={selectedTicket.assignedTo || ""}
                        onChange={(e) => handleAssign(selectedTicket.id, e.target.value)}
                        className="w-full text-sm font-semibold text-slate-800 py-2.5 px-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 shadow-sm"
                      >
                        <option value="">Unassigned</option>
                        {AGENTS.map(agent => <option key={agent} value={agent}>{agent}</option>)}
                      </select>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Tags & Linked Entities */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Tag size={14} /> Tags</label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {selectedTicket.tags.map(tag => (
                          <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200">
                            #{tag}
                            <button onClick={() => handleRemoveTag(selectedTicket.id, tag)} className="hover:text-red-500 transition-colors ml-1"><X size={12}/></button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Add tag..." 
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddTag(selectedTicket.id)}
                          className="flex-1 text-xs py-1.5 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
                        />
                        <button onClick={() => handleAddTag(selectedTicket.id)} className="px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-900 transition-colors">Add</button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><LinkIcon size={14} /> Linked Entities</label>
                      <div className="space-y-2">
                        {selectedTicket.linkedEntities.map((entity, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg">
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                              <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] rounded uppercase">{entity.type}</span>
                              {entity.id}
                            </div>
                            <button className="text-xs font-bold text-teal-600 hover:underline">View</button>
                          </div>
                        ))}
                        <button className="w-full py-2 border border-dashed border-slate-300 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors">
                          + Link Order/Payment/Dispute
                        </button>
                      </div>
                    </div>
                  </div>
                  
                </div>
              )}

              {/* ----------------- HISTORY TAB ----------------- */}
              {activeTab === "history" && (
                <div className="p-6">
                  <h3 className="text-sm font-bold text-slate-900 mb-6">Audit Log & History</h3>
                  <div className="relative pl-4 border-l-2 border-slate-200 space-y-6">
                    {selectedTicket.history.map((event, i) => (
                      <div key={event.id} className="relative">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-white border-2 border-slate-300 rounded-full" />
                        <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl ml-2 shadow-sm">
                          <p className="text-sm font-bold text-slate-800">{event.action}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            By <span className="font-semibold text-slate-700">{event.user}</span> • {event.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </>
        )}
      </div>

    </div>
  );
}
