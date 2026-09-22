"use client";

import { useState, useEffect } from "react";
import { Mail, Search, Filter, Reply, Trash2, X, CheckCircle2, ChevronRight, Inbox, Eye, Loader2, StickyNote, Send, User, MessageSquare, ArrowUpCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

type InquiryStatus = "UNREAD" | "READ" | "REPLIED";
type TabView = "conversation" | "details";
type ComposerMode = "reply" | "note";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: InquiryStatus;
  priority?: string;
  assignedTo?: string;
  department?: string;
}

export default function GeneralInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<InquiryStatus | "ALL">("ALL");
  
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);
  
  // Drawer States
  const [activeTab, setActiveTab] = useState<TabView>("conversation");
  const [composerMode, setComposerMode] = useState<ComposerMode>("reply");
  const [replyMessage, setReplyMessage] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  const [assignedTo, setAssignedTo] = useState("Unassigned");
  const [department, setDepartment] = useState("General Support");
  const [priority, setPriority] = useState("Medium");
  const [agentsList, setAgentsList] = useState<{name: string, department: string}[]>([]);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchInquiries();
      fetchAgents();
    }
  }, [user]);

  const fetchAgents = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/users?role=ADMIN", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      const usersArray = Array.isArray(data) ? data : (data.users || []);
      setAgentsList(usersArray.map((u: any) => ({
        name: u.name || "Unknown",
        department: u.adminProfile?.department || "General Support",
      })));
    } catch (e) {
      console.error("Failed to fetch agents", e);
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
        if (res.ok) {
          setSelectedInquiry(data.inquiry);
          setAssignedTo(data.inquiry.assignedTo || "Unassigned");
          setDepartment(data.inquiry.department || "General Support");
          setPriority(data.inquiry.priority || "Medium");
        }
      } catch (e) {
        // Only log, do not crash or block. "Failed to fetch" can happen if server restarts.
        console.error(e);
      }
    };
    fetchDetails();
    const interval = setInterval(fetchDetails, 5000);
    return () => clearInterval(interval);
  }, [selectedInquiryId, user]);

  const fetchInquiries = async () => {
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/admin/inquiries", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to load inquiries");
      const data = await res.json();
      setInquiries(data.inquiries);
    } catch (error) {
      toast.error("Could not load inquiries");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: InquiryStatus) => {
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      
      setInquiries(prev => prev.map(inq => 
        inq.id === id ? { ...inq, status: newStatus } : inq
      ));
      
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    }
  };

  const updateAssignee = async (id: string, newAssignee: string) => {
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ assignedTo: newAssignee }),
      });
      if (!res.ok) throw new Error("Failed to assign ticket");
      setAssignedTo(newAssignee);
      setInquiries(inquiries.map(inq => inq.id === id ? { ...inq, assignedTo: newAssignee } : inq));
      toast.success(`Assigned to ${newAssignee}`);
    } catch (error) {
      toast.error("Failed to update assignee");
      console.error(error);
    }
  };

  const updateDepartment = async (id: string, newDept: string) => {
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ department: newDept, assignedTo: "Unassigned" }),
      });
      if (!res.ok) throw new Error("Failed to update department");
      setDepartment(newDept);
      setAssignedTo("Unassigned"); // Reset assignee when changing department
      setInquiries(inquiries.map(inq => inq.id === id ? { ...inq, department: newDept, assignedTo: undefined } : inq));
      toast.success(`Department updated to ${newDept}`);
    } catch (error) {
      toast.error("Failed to update department");
      console.error(error);
    }
  };

  const updatePriority = async (id: string, newPriority: string) => {
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ priority: newPriority }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error Response:", errorText);
        throw new Error(errorText || "Failed to update priority");
      }
      setPriority(newPriority);
      setInquiries(inquiries.map(inq => inq.id === id ? { ...inq, priority: newPriority } : inq));
      toast.success(`Priority updated to ${newPriority}`);
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
      console.error(error);
    }
  };

  const handleEscalate = (id: string) => {
    // If not urgent, escalate to Urgent.
    const newPriority = priority === "Urgent" ? "High" : "Urgent";
    updatePriority(id, newPriority);
  };

  const filteredInquiries = inquiries.filter(inq => {
    const matchesSearch = 
      inq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "ALL" || inq.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: InquiryStatus) => {
    switch(status) {
      case "UNREAD":
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold uppercase tracking-wider">New</span>;
      case "READ":
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider">Read</span>;
      case "REPLIED":
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1"><CheckCircle2 size={12}/> Replied</span>;
    }
  };

  const openInquiry = (inquiry: Inquiry) => {
    setSelectedInquiryId(inquiry.id);
    setSelectedInquiry({ ...inquiry, replies: [] }); // optimistic start
    setReplyMessage("");
    setInternalNote("");
    setAssignedTo("Unassigned");
    setPriority("Medium");
    
    if (inquiry.status === "UNREAD") {
      updateStatus(inquiry.id, "READ");
    }
  };

  const closeDrawer = () => {
    setSelectedInquiryId(null);
    setSelectedInquiry(null);
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedInquiry) return;
    
    setIsSending(true);
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/inquiries/${selectedInquiry.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: replyMessage, isInternal: false })
      });
      if (res.ok) {
        toast.success("Reply sent");
        setReplyMessage("");
        const data = await res.json();
        setSelectedInquiry((prev: any) => ({ ...prev, replies: [...prev.replies, data.reply] }));
        updateStatus(selectedInquiry.id, "REPLIED");
      }
    } catch (err) {
      toast.error("Failed to send reply");
    } finally {
      setIsSending(false);
    }
  };
  
  const handleAddNote = async () => {
    if (!internalNote.trim() || !selectedInquiry) return;
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/inquiries/${selectedInquiry.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: internalNote, isInternal: true })
      });
      if (res.ok) {
        toast.success("Internal note added");
        setInternalNote("");
        const data = await res.json();
        setSelectedInquiry((prev: any) => ({ ...prev, replies: [...prev.replies, data.reply] }));
      }
    } catch (err) {
      toast.error("Failed to add note");
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this inquiry?")) {
      try {
        const token = await user?.getIdToken();
        const res = await fetch(`/api/admin/inquiries/${id}`, { 
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error("Failed to delete");
        
        setInquiries(prev => prev.filter(i => i.id !== id));
        if (selectedInquiry?.id === id) {
          closeDrawer();
        }
        toast.success("Inquiry deleted");
      } catch (err) {
        toast.error("Failed to delete inquiry");
        console.error(err);
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto flex h-[calc(100vh-69px)] relative overflow-hidden bg-slate-50">
      
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${selectedInquiry ? 'pr-[600px] xl:pr-[700px]' : ''}`}>
        <div className="w-full space-y-6 overflow-y-auto">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
            <div>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <Inbox className="text-indigo-600" size={24} />
                General Inquiries
              </h1>
              <p className="text-slate-500 text-sm mt-1 font-medium">
                Review and reply to messages sent through the public contact form.
              </p>
            </div>
          </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <button 
              onClick={() => setFilterStatus("ALL")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${filterStatus === "ALL" ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilterStatus("UNREAD")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${filterStatus === "UNREAD" ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
            >
              New
            </button>
            <button 
              onClick={() => setFilterStatus("REPLIED")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${filterStatus === "REPLIED" ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
            >
              Replied
            </button>
          </div>
          
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search name, email, or subject..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Inquiries List */}
        <div className="flex-1 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col min-h-0">
          <div className="overflow-y-auto flex-1 relative">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
            ) : filteredInquiries.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 py-12">
                <Mail size={48} className="text-slate-300 mb-4" />
                <p className="font-medium text-lg">No inquiries found.</p>
                <p className="text-sm mt-1">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="py-4 px-6 text-xs font-black text-slate-500 uppercase tracking-wider">ID</th>
                      <th className="py-4 px-6 text-xs font-black text-slate-500 uppercase tracking-wider">User</th>
                      <th className="py-4 px-6 text-xs font-black text-slate-500 uppercase tracking-wider">Subject</th>
                      <th className="py-4 px-6 text-xs font-black text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="py-4 px-6 text-xs font-black text-slate-500 uppercase tracking-wider">Status / Priority</th>
                      <th className="py-4 px-6 text-xs font-black text-slate-500 uppercase tracking-wider">Assigned</th>
                      <th className="py-4 px-4 w-10 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInquiries.map((inquiry) => {
                      const displayId = `GI-${inquiry.id.slice(-4).toUpperCase()}`;
                      
                      return (
                        <tr 
                          key={inquiry.id} 
                          onClick={() => openInquiry(inquiry)}
                          className={`hover:bg-slate-50 transition-colors cursor-pointer group ${selectedInquiry?.id === inquiry.id ? 'bg-indigo-50/50' : ''} ${inquiry.status === 'UNREAD' ? 'bg-blue-50/30' : ''}`}
                        >
                          <td className="py-4 px-6 whitespace-nowrap">
                            <span className="text-sm font-bold text-slate-900">{displayId}</span>
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            <span className={`text-sm ${inquiry.status === 'UNREAD' ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                              {inquiry.name}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex flex-col">
                              <span className={`text-sm truncate max-w-[200px] xl:max-w-[300px] ${inquiry.status === 'UNREAD' ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>
                                {inquiry.subject}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            <span className="text-sm font-semibold text-slate-500">
                              {format(new Date(inquiry.createdAt), "MMM d, yyyy h:mm a")}
                            </span>
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            <div className="flex flex-col gap-1.5 items-start">
                              {getStatusBadge(inquiry.status)}
                              {inquiry.priority === 'Urgent' && <span className="flex items-center gap-1 text-[11px] font-bold text-red-700"><span className="w-1.5 h-1.5 rounded-full bg-red-700 animate-pulse"></span> URGENT</span>}
                              {inquiry.priority === 'High' && <span className="flex items-center gap-1 text-[11px] font-bold text-red-500"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> High</span>}
                              {inquiry.priority === 'Medium' && <span className="flex items-center gap-1 text-[11px] font-bold text-amber-500"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Medium</span>}
                              {inquiry.priority === 'Low' && <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400"><span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Low</span>}
                            </div>
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            <span className={`text-sm font-semibold px-2.5 py-1 rounded-lg ${inquiry.assignedTo && inquiry.assignedTo !== "Unassigned" ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 bg-slate-100'}`}>
                              {inquiry.assignedTo || "Unassigned"}
                            </span>
                          </td>
                          <td className="py-4 px-4 w-10 whitespace-nowrap text-right">
                            <button 
                              onClick={(e) => handleDelete(inquiry.id, e)}
                              className="group relative p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                              <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-[11px] font-semibold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-sm">Delete Inquiry</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>

    {/* Right Drawer (Pro Ticket Details style) */}
      <div 
        className={`absolute top-0 right-0 h-full w-[600px] xl:w-[700px] bg-white border-l border-slate-200 shadow-2xl transition-transform duration-300 flex flex-col z-20 ${selectedInquiry ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {selectedInquiry && (
          <>
            {/* Top Toolbar / Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex flex-col gap-3 bg-slate-50/80">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-black text-slate-900">Inquiry #{selectedInquiry.id.slice(-6).toUpperCase()}</h2>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      selectedInquiry.status === "UNREAD" ? "bg-blue-100 text-blue-700" :
                      selectedInquiry.status === "REPLIED" ? "bg-emerald-100 text-emerald-700" :
                      "bg-slate-200 text-slate-600"
                    }`}>
                      {selectedInquiry.status}
                    </span>
                    {priority === 'Urgent' && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-50 text-red-700 border border-red-100">
                        <AlertTriangle size={12} className="text-red-600" /> URGENT
                      </span>
                    )}
                    {priority === 'High' && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-100">
                        HIGH
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-slate-700">{selectedInquiry.subject}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => updateStatus(selectedInquiry.id, selectedInquiry.status === "UNREAD" ? "READ" : "UNREAD")}
                    className={`group relative p-2 rounded-lg transition-colors ${selectedInquiry.status === "UNREAD" ? 'text-amber-500 hover:bg-amber-50' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'}`}
                  >
                    <CheckCircle2 size={18} />
                    <span className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-[11px] font-semibold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-sm">
                      {selectedInquiry.status === "UNREAD" ? "Mark as Read" : "Mark as Unread"}
                    </span>
                  </button>
                  <button 
                    onClick={() => updateStatus(selectedInquiry.id, "REPLIED")}
                    className="group relative p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  >
                    <CheckCircle2 size={18} />
                    <span className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-[11px] font-semibold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-sm">Mark as Replied</span>
                  </button>
                  <button 
                    onClick={() => handleEscalate(selectedInquiry.id)} 
                    className="group relative p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    <ArrowUpCircle size={18} />
                    <span className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-[11px] font-semibold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-sm">
                      {priority === "Urgent" ? "De-escalate Priority" : "Escalate to Urgent"}
                    </span>
                  </button>
                  <button 
                    onClick={(e) => handleDelete(selectedInquiry.id, e as any)}
                    className="group relative p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                    <span className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-[11px] font-semibold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-sm">Delete Inquiry</span>
                  </button>
                  <div className="w-px h-6 bg-slate-200 mx-1"></div>
                  <button onClick={closeDrawer} className="group relative p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-full transition-colors ml-1">
                    <X size={20} />
                    <span className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-[11px] font-semibold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-sm">Close Drawer</span>
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
                  Inquiry Details
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-white flex flex-col">
              
              {/* ----------------- CONVERSATION TAB ----------------- */}
              {activeTab === "conversation" && (
                <>
                  <div className="flex-1 p-6 space-y-6">
                    {/* Initial Inquiry as first message */}
                    <div className="flex flex-col items-start">
                      <div className="max-w-[85%] rounded-2xl shadow-sm overflow-hidden bg-slate-50 border border-slate-200">
                        <div className="px-4 py-2 flex items-center gap-2 border-b border-slate-200 bg-white">
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-600 uppercase">
                            {selectedInquiry.name.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-slate-900">{selectedInquiry.name}</span>
                          <span className="text-[10px] font-medium ml-auto text-slate-400">
                            {format(new Date(selectedInquiry.createdAt), "MMM d, h:mm a")}
                          </span>
                        </div>
                        <div className="px-5 py-4">
                          <p className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">{selectedInquiry.message}</p>
                        </div>
                      </div>
                    </div>

                    {/* Replies */}
                    {selectedInquiry.replies?.map((msg: any) => {
                      const isNote = msg.senderRole === "NOTE" || msg.isInternal;
                      const isUser = msg.senderRole === "USER";
                      
                      if (isNote) {
                        return (
                          <div key={msg.id} className="flex flex-col items-center">
                            <div className="max-w-[85%] bg-[#FFF9C4] border border-[#FBC02D] rounded-2xl px-5 py-4 shadow-sm relative overflow-hidden group">
                              <div className="absolute top-0 right-0 bg-[#FBC02D] text-[#F57F17] text-[10px] font-black px-2 py-0.5 rounded-bl-lg tracking-wider">INTERNAL NOTE</div>
                              <p className="text-sm text-slate-800 font-medium whitespace-pre-wrap">{msg.message}</p>
                              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#FFF176]">
                                <StickyNote size={12} className="text-yellow-700" />
                                <span className="text-[10px] font-bold text-yellow-700 uppercase">
                                  Agent • {format(new Date(msg.createdAt), "MMM d, h:mm a")}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={msg.id} className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}>
                          <div className={`max-w-[85%] rounded-2xl shadow-sm overflow-hidden ${isUser ? 'bg-slate-50 border border-slate-200' : 'bg-indigo-700 text-white'}`}>
                            <div className={`px-4 py-2 flex items-center gap-2 border-b ${isUser ? 'border-slate-200 bg-white' : 'border-indigo-600 bg-indigo-800'}`}>
                              {isUser ? (
                                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-600 uppercase">
                                  {selectedInquiry.name.charAt(0)}
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
                                  <MessageSquare size={12} className="text-white" />
                                </div>
                              )}
                              <span className={`text-xs font-bold ${isUser ? 'text-slate-900' : 'text-indigo-50'}`}>
                                {isUser ? selectedInquiry.name : 'Support Agent'}
                              </span>
                              <span className={`text-[10px] font-medium ml-auto ${isUser ? 'text-slate-400' : 'text-indigo-300'}`}>
                                {format(new Date(msg.createdAt), "MMM d, h:mm a")}
                              </span>
                            </div>
                            <div className="px-5 py-4">
                              <p className={`text-sm leading-relaxed ${isUser ? 'text-slate-800' : 'text-white'} whitespace-pre-wrap`}>
                                {msg.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Reply / Note Composer */}
                  <div className="p-5 bg-slate-50 border-t border-slate-200 shrink-0">
                    <div className="flex items-center gap-1 mb-3">
                      <button
                        onClick={() => setComposerMode("reply")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${composerMode === 'reply' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-200/50'}`}
                      >
                        <MessageSquare size={14} /> Reply to User
                      </button>
                      <button
                        onClick={() => setComposerMode("note")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${composerMode === 'note' ? 'bg-[#FFF9C4] text-yellow-800 shadow-sm border border-[#FBC02D]' : 'text-slate-500 hover:bg-slate-200/50'}`}
                      >
                        <StickyNote size={14} /> Internal Note
                      </button>
                    </div>

                    <div className="relative">
                      <textarea
                        value={composerMode === 'reply' ? replyMessage : internalNote}
                        onChange={(e) => composerMode === 'reply' ? setReplyMessage(e.target.value) : setInternalNote(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            composerMode === 'reply' ? handleSendReply() : handleAddNote();
                          }
                        }}
                        placeholder={composerMode === 'reply' ? "Type a reply to the user..." : "Add a private note for other agents..."}
                        className={`w-full p-4 pb-12 rounded-xl text-sm border focus:outline-none transition-all resize-none shadow-sm ${
                          composerMode === 'note' 
                            ? 'bg-[#FFFDE7] border-[#FBC02D] focus:ring-2 focus:ring-[#FBC02D]/30 placeholder-[#F57F17]/50 text-slate-800' 
                            : 'bg-white border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                        }`}
                        rows={3}
                      />
                      <div className="absolute bottom-3 right-3 flex items-center gap-2">
                        <button
                          onClick={composerMode === 'reply' ? handleSendReply : handleAddNote}
                          disabled={isSending || (composerMode === 'reply' ? !replyMessage.trim() : !internalNote.trim())}
                          className={`p-2 rounded-lg text-white shadow-sm transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${
                            composerMode === 'note' ? 'bg-[#F9A825] hover:bg-[#F57F17]' : 'bg-indigo-600 hover:bg-indigo-700'
                          }`}
                        >
                          {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ----------------- DETAILS TAB ----------------- */}
              {activeTab === "details" && (
                <div className="p-6 space-y-8">
                  {/* Inquiry Properties */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                      Properties
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                        <select 
                          value={selectedInquiry.status}
                          onChange={(e) => updateStatus(selectedInquiry.id, e.target.value as InquiryStatus)}
                          className="w-full text-sm font-semibold text-slate-800 py-2 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 shadow-sm"
                        >
                          <option value="UNREAD">New / Unread</option>
                          <option value="READ">Read</option>
                          <option value="REPLIED">Replied</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Priority</label>
                        <select 
                          value={priority}
                          onChange={(e) => updatePriority(selectedInquiry.id, e.target.value)}
                          className="w-full text-sm font-semibold text-slate-800 py-2 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 shadow-sm"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Urgent">Urgent</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Department</label>
                        <select 
                          value={department}
                          onChange={(e) => updateDepartment(selectedInquiry.id, e.target.value)}
                          className="w-full text-sm font-semibold text-slate-800 py-2 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 shadow-sm"
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
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assigned To</label>
                        <select 
                          value={assignedTo}
                          onChange={(e) => updateAssignee(selectedInquiry.id, e.target.value)}
                          className="w-full text-sm font-semibold text-slate-800 py-2 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 shadow-sm"
                        >
                          <option value="Unassigned">Unassigned</option>
                          {agentsList.filter(a => a.department === department).map((agent, index) => (
                            <option key={`${agent.name}-${index}`} value={agent.name}>
                              {agent.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* User Information */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">User Information</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Name</p>
                        <p className="text-sm font-semibold text-slate-900">{selectedInquiry.name}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email</p>
                        <a href={`mailto:${selectedInquiry.email}`} className="text-sm font-semibold text-indigo-600 hover:underline">
                          {selectedInquiry.email}
                        </a>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Account Status</p>
                        <p className="text-sm font-medium text-slate-600">Unregistered User</p>
                      </div>
                    </div>
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
