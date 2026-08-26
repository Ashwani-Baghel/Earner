"use client";

import { useState } from "react";
import { MessageSquarePlus, Plus, Trash2, Edit2, X, Save, Search, Type, Hash, Folder } from "lucide-react";

interface CannedResponse {
  id: string;
  title: string;
  shortcut: string;
  category: string;
  message: string;
}

const INITIAL_RESPONSES: CannedResponse[] = [
  { 
    id: "cr1", 
    title: "Order Checking", 
    shortcut: "/checking", 
    category: "General", 
    message: "Thank you for contacting us. We are currently checking your order details and will get back to you shortly." 
  },
  { 
    id: "cr2", 
    title: "Refund Processed", 
    shortcut: "/refund", 
    category: "Payments", 
    message: "Your refund has been successfully processed. It may take 3-5 business days to appear on your original payment method depending on your bank." 
  },
  { 
    id: "cr3", 
    title: "Request Evidence", 
    shortcut: "/evidence", 
    category: "Disputes", 
    message: "To help us resolve this dispute fairly, please provide any relevant evidence (screenshots, delivery files, or communication logs) within the next 48 hours." 
  },
  { 
    id: "cr4", 
    title: "Revision Policy", 
    shortcut: "/revisions", 
    category: "Orders", 
    message: "Please note that revision requests must align with the original scope of the order. Any requests for completely new features may require an additional payment." 
  },
];

export default function CannedResponsesPage() {
  const [responses, setResponses] = useState<CannedResponse[]>(INITIAL_RESPONSES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResponse, setEditingResponse] = useState<CannedResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    shortcut: "",
    category: "General",
    message: ""
  });

  const handleDelete = (id: string) => {
    if(confirm("Are you sure you want to permanently delete this canned response?")) {
      setResponses(responses.filter(r => r.id !== id));
    }
  };

  const openAddModal = () => {
    setEditingResponse(null);
    setFormData({ title: "", shortcut: "/", category: "General", message: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (response: CannedResponse) => {
    setEditingResponse(response);
    setFormData({
      title: response.title,
      shortcut: response.shortcut,
      category: response.category,
      message: response.message
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.title.trim() || !formData.message.trim()) return;

    // Ensure shortcut starts with /
    const formattedShortcut = formData.shortcut.startsWith("/") ? formData.shortcut : `/${formData.shortcut}`;

    if (editingResponse) {
      setResponses(responses.map(r => 
        r.id === editingResponse.id 
          ? { ...r, ...formData, shortcut: formattedShortcut }
          : r
      ));
    } else {
      const newResponse: CannedResponse = {
        id: `cr${Date.now()}`,
        ...formData,
        shortcut: formattedShortcut
      };
      setResponses([...responses, newResponse]);
    }
    setIsModalOpen(false);
  };

  const filteredResponses = responses.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.shortcut.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 relative h-[calc(100vh-69px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <MessageSquarePlus className="text-indigo-600" size={24} />
            Canned Responses
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Manage pre-written templates that agents can insert to speed up support times.
          </p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search templates..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 shadow-sm"
            />
          </div>
          <button 
            onClick={openAddModal}
            className="shrink-0 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 transition-colors"
          >
            <Plus size={16} /> New Template
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 overflow-y-auto pb-6">
        {filteredResponses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white border border-slate-200 rounded-3xl border-dashed">
            <MessageSquarePlus size={48} className="text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">No canned responses found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResponses.map((response) => (
              <div key={response.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow group flex flex-col h-64 relative overflow-hidden">
                
                {/* Header Strip */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-80"></div>
                
                <div className="flex items-start justify-between mb-4 mt-2">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 line-clamp-1" title={response.title}>{response.title}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider">
                        <Folder size={10} /> {response.category}
                      </span>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md font-mono">
                        {response.shortcut}
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 bg-white/80 backdrop-blur-sm rounded-lg p-1">
                    <button 
                      onClick={() => openEditModal(response)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(response.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 bg-slate-50 rounded-2xl p-4 border border-slate-100 relative overflow-hidden group-hover:bg-indigo-50/30 transition-colors">
                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-5 italic">
                    "{response.message}"
                  </p>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <MessageSquarePlus className="text-indigo-600" size={20} />
                {editingResponse ? "Edit Template" : "Create Template"}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-900 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Type size={14} /> Template Title
                  </label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Order Checking"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Folder size={14} /> Category
                  </label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                  >
                    <option value="General">General</option>
                    <option value="Orders">Orders</option>
                    <option value="Payments">Payments</option>
                    <option value="Disputes">Disputes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Hash size={14} /> Chat Shortcut
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={formData.shortcut}
                    onChange={(e) => setFormData({ ...formData, shortcut: e.target.value })}
                    placeholder="/checking"
                    className="w-full pl-4 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-indigo-600 font-bold focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                  />
                  <p className="text-[10px] text-slate-400 font-medium absolute right-3 top-1/2 -translate-y-1/2">
                    Used by typing this into chat
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Message Body</label>
                <textarea 
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Thank you for contacting us. We are checking your order..."
                  rows={5}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 leading-relaxed focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors resize-none"
                />
              </div>

            </div>

            <div className="p-6 pt-0">
              <button 
                onClick={handleSave}
                disabled={!formData.title.trim() || !formData.message.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} /> {editingResponse ? "Save Changes" : "Create Template"}
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
