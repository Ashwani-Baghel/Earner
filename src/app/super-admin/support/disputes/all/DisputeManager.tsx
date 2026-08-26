"use client";

import { useState } from "react";
import { Search, Filter, ShieldAlert, X, Scale, IndianRupee, MessageSquare, CheckCircle, Clock, AlertTriangle, ArrowRightLeft } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

type DisputeStatus = "Open" | "Under Review" | "Waiting for Buyer" | "Waiting for Seller" | "Escalated" | "Resolved" | "Closed";

interface Dispute {
  id: string;
  buyer: string;
  buyerAvatar: string;
  seller: string;
  sellerAvatar: string;
  order: string;
  amount: string;
  status: DisputeStatus;
  date: string;
  description: string;
}

const MOCK_DISPUTES: Dispute[] = [
  { id: "D001", buyer: "Rahul", buyerAvatar: "https://i.pravatar.cc/150?u=rahul", seller: "Amit", sellerAvatar: "https://i.pravatar.cc/150?u=amit", order: "O123", amount: "₹5,000", status: "Open", date: "Today", description: "Seller delivered incomplete source code." },
  { id: "D002", buyer: "Priya", buyerAvatar: "https://i.pravatar.cc/150?u=priya", seller: "John", sellerAvatar: "https://i.pravatar.cc/150?u=john", order: "O124", amount: "₹2,000", status: "Under Review", date: "Yesterday", description: "Buyer claiming design doesn't match requirements, but seller followed brief." },
  { id: "D003", buyer: "Aman", buyerAvatar: "https://i.pravatar.cc/150?u=aman", seller: "Raj", sellerAvatar: "https://i.pravatar.cc/150?u=raj", order: "O125", amount: "₹8,000", status: "Resolved", date: "2 Days ago", description: "Project cancelled mutually." },
];

export function DisputeManager() {
  const [disputes, setDisputes] = useState<Dispute[]>(MOCK_DISPUTES);
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const selectedDispute = disputes.find(d => d.id === selectedDisputeId);

  const filteredDisputes = disputes.filter(d => {
    const matchesSearch = d.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.buyer.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.seller.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.order.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = statusFilter === "All" || d.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: DisputeStatus) => {
    switch(status) {
      case "Open": return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">Open</span>;
      case "Under Review": return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">Under Review</span>;
      case "Waiting for Buyer": return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">Waiting for Buyer</span>;
      case "Waiting for Seller": return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">Waiting for Seller</span>;
      case "Escalated": return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">Escalated</span>;
      case "Resolved": return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Resolved</span>;
      case "Closed": return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">Closed</span>;
    }
  };

  const updateStatus = (id: string, newStatus: DisputeStatus) => {
    setDisputes(disputes.map(d => d.id === id ? { ...d, status: newStatus } : d));
  };

  return (
    <div className="relative flex h-[calc(100vh-69px)] bg-slate-50 overflow-hidden">
      
      {/* Main Table Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${selectedDispute ? 'pr-[500px] xl:pr-[600px]' : ''}`}>
        <div className="p-6 max-w-7xl mx-auto w-full space-y-6 overflow-y-auto">
          
          {/* Header & Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Scale className="text-indigo-600" size={24} />
                All Disputes
              </h1>
              <p className="text-slate-500 text-sm mt-1 font-medium">Manage and resolve conflicts between buyers and sellers.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text"
                  placeholder="Search ID, Buyer, Seller..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm appearance-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Waiting for Buyer">Waiting for Buyer</option>
                  <option value="Waiting for Seller">Waiting for Seller</option>
                  <option value="Escalated">Escalated</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 bg-slate-50/50">
                    <th className="px-6 py-4 font-bold">ID</th>
                    <th className="px-6 py-4 font-bold">Buyer</th>
                    <th className="px-6 py-4 font-bold">Seller</th>
                    <th className="px-6 py-4 font-bold">Order</th>
                    <th className="px-6 py-4 font-bold">Amount</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDisputes.map((dispute) => (
                    <tr 
                      key={dispute.id} 
                      onClick={() => setSelectedDisputeId(dispute.id)}
                      className={`hover:bg-slate-50 transition-colors group cursor-pointer ${selectedDisputeId === dispute.id ? 'bg-indigo-50/30' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-slate-900">{dispute.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Avatar src={dispute.buyerAvatar} alt={dispute.buyer} size="sm" />
                          <span className="text-sm font-bold text-slate-700">{dispute.buyer}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Avatar src={dispute.sellerAvatar} alt={dispute.seller} size="sm" />
                          <span className="text-sm font-bold text-slate-700">{dispute.seller}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-indigo-600 hover:underline">{dispute.order}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-slate-900">{dispute.amount}</span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(dispute.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors">
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredDisputes.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                        <ShieldAlert size={32} className="mx-auto text-slate-300 mb-3" />
                        <p className="font-semibold text-slate-700">No disputes found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Right Drawer (Dispute Details) */}
      <div 
        className={`absolute top-0 right-0 h-full w-[500px] xl:w-[600px] bg-white border-l border-slate-200 shadow-2xl transition-transform duration-300 flex flex-col z-20 ${
          selectedDispute ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedDispute && (
          <>
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-black text-slate-900">{selectedDispute.id}</h2>
                  {getStatusBadge(selectedDispute.status)}
                </div>
                <p className="text-sm font-semibold text-slate-500 flex items-center gap-2">
                  Order <span className="text-indigo-600 cursor-pointer hover:underline">{selectedDispute.order}</span> • {selectedDispute.amount}
                </p>
              </div>
              <button onClick={() => setSelectedDisputeId(null)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white">
              
              {/* Parties */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Involved Parties</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                    <Avatar src={selectedDispute.buyerAvatar} alt={selectedDispute.buyer} size="lg" className="mx-auto mb-2" />
                    <p className="text-sm font-black text-slate-900">{selectedDispute.buyer}</p>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Buyer</p>
                  </div>
                  <div className="shrink-0 text-slate-300">
                    <ArrowRightLeft size={24} />
                  </div>
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                    <Avatar src={selectedDispute.sellerAvatar} alt={selectedDispute.seller} size="lg" className="mx-auto mb-2" />
                    <p className="text-sm font-black text-slate-900">{selectedDispute.seller}</p>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Seller</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Dispute Reason</h3>
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-900 font-medium leading-relaxed">
                  {selectedDispute.description}
                </div>
              </div>

              {/* Actions */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-between">
                  <span>Admin Resolution</span>
                  <select 
                    value={selectedDispute.status}
                    onChange={(e) => updateStatus(selectedDispute.id, e.target.value as DisputeStatus)}
                    className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg px-2 py-1 outline-none"
                  >
                    <option value="Open">Open</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Waiting for Buyer">Waiting for Buyer</option>
                    <option value="Waiting for Seller">Waiting for Seller</option>
                    <option value="Escalated">Escalated</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => updateStatus(selectedDispute.id, "Resolved")}
                    disabled={selectedDispute.status === "Resolved"}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 hover:shadow-sm transition-all disabled:opacity-50 disabled:pointer-events-none group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                        <CheckCircle size={16} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-slate-900">Resolve Dispute</p>
                        <p className="text-xs text-slate-500 font-medium">Issue decision and close case</p>
                      </div>
                    </div>
                  </button>
                  
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors mt-2 shadow-sm">
                    <MessageSquare size={16} /> Add Internal Note
                  </button>
                </div>
              </div>

            </div>
          </>
        )}
      </div>

    </div>
  );
}
