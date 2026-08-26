"use client";

import { useState } from "react";
import { Users, Plus, ShieldCheck, Mail, Activity, MoreVertical, Edit2, Ban, X, CheckCircle, XCircle, Sliders, UserCog, Trash2, Clock, MessageCircle } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

interface Permissions {
  handleLiveChat: boolean;
  manageTickets: boolean;
  accessPayments: boolean;
  issueRefunds: boolean;
  resolveDisputes: boolean;
  manageUsers: boolean;
}

interface SupportAgent {
  id: string;
  name: string;
  avatar: string;
  role: string;
  department: string;
  status: "Active" | "Inactive";
  activeChats: number;
  maxChats: number;
  workingHours: string;
  email: string;
  permissions: Permissions;
}

const INITIAL_AGENTS: SupportAgent[] = [
  {
    id: "sa1",
    name: "John",
    avatar: "https://i.pravatar.cc/150?u=john-support",
    role: "Support Agent",
    department: "General Support",
    status: "Active",
    activeChats: 3,
    maxChats: 5,
    workingHours: "09:00 AM - 05:00 PM EST",
    email: "john.s@earner.com",
    permissions: {
      handleLiveChat: true,
      manageTickets: true,
      accessPayments: false,
      issueRefunds: false,
      resolveDisputes: false,
      manageUsers: false
    }
  },
  {
    id: "sa2",
    name: "Sarah",
    avatar: "https://i.pravatar.cc/150?u=sarah-pay",
    role: "Payment Support",
    department: "Billing & Payments",
    status: "Active",
    activeChats: 1,
    maxChats: 3,
    workingHours: "10:00 AM - 06:00 PM EST",
    email: "sarah.p@earner.com",
    permissions: {
      handleLiveChat: true,
      manageTickets: true,
      accessPayments: true,
      issueRefunds: true,
      resolveDisputes: false,
      manageUsers: false
    }
  },
  {
    id: "sa3",
    name: "Mike",
    avatar: "https://i.pravatar.cc/150?u=mike-disp",
    role: "Dispute Specialist",
    department: "Trust & Safety",
    status: "Inactive",
    activeChats: 0,
    maxChats: 4,
    workingHours: "08:00 AM - 04:00 PM EST",
    email: "mike.d@earner.com",
    permissions: {
      handleLiveChat: false,
      manageTickets: true,
      accessPayments: true,
      issueRefunds: true,
      resolveDisputes: true,
      manageUsers: true
    }
  }
];

export default function SupportAgentsPage() {
  const [agents, setAgents] = useState<SupportAgent[]>(INITIAL_AGENTS);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  const togglePermission = (agentId: string, permKey: keyof Permissions) => {
    setAgents(agents.map(a => {
      if (a.id !== agentId) return a;
      return {
        ...a,
        permissions: {
          ...a.permissions,
          [permKey]: !a.permissions[permKey]
        }
      };
    }));
  };

  const updateField = (agentId: string, field: keyof SupportAgent, value: any) => {
    setAgents(agents.map(a => a.id === agentId ? { ...a, [field]: value } : a));
  };

  const removeAgent = (agentId: string) => {
    setAgents(agents.filter(a => a.id !== agentId));
    setSelectedAgentId(null);
  };

  return (
    <div className="relative flex h-[calc(100vh-69px)] bg-slate-50 overflow-hidden">
      
      {/* Main Grid Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${selectedAgent ? 'pr-[500px] xl:pr-[600px]' : ''}`}>
        <div className="p-6 max-w-7xl mx-auto w-full space-y-8 overflow-y-auto">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <Users className="text-indigo-600" size={24} />
                Support Agents
              </h1>
              <p className="text-slate-500 text-sm mt-1 font-medium">
                Create and manage the staff who handle customer support, live chats, and billing.
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 transition-colors">
              <Plus size={16} /> Add Agent
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <div key={agent.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                
                {/* Top color block & actions */}
                <div className="h-16 bg-slate-50 border-b border-slate-100 flex justify-end p-3 relative">
                  <div className="absolute top-1/2 left-6 -translate-y-[-10px]">
                    <Avatar src={agent.avatar} alt={agent.name} size="xl" className="border-4 border-white shadow-sm bg-white" />
                  </div>
                  <button onClick={() => setSelectedAgentId(agent.id)} className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                    <Edit2 size={14} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 pt-14">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-black text-slate-900">{agent.name}</h2>
                      <p className="text-sm font-bold text-indigo-600 flex items-center gap-1.5 mt-0.5">
                        <ShieldCheck size={14} /> {agent.role}
                      </p>
                    </div>
                    
                    {agent.status === "Active" ? (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Active
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-xs font-bold flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div> Inactive
                      </span>
                    )}
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between text-sm font-medium text-slate-600">
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-slate-400" />
                        <span className="truncate max-w-[150px]">{agent.email}</span>
                      </div>
                      <div className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                        {agent.department}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <Clock size={16} className="text-slate-400" />
                      {agent.workingHours}
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl mt-4">
                      <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                        <MessageCircle size={16} className="text-indigo-400" />
                        Active Chats
                      </div>
                      <div className="text-right">
                        <span className={`text-base font-black ${agent.activeChats > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
                          {agent.activeChats}
                        </span>
                        <span className="text-xs font-bold text-slate-400"> / {agent.maxChats} Limit</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 grid grid-cols-2 gap-3 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setSelectedAgentId(agent.id)}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors"
                    >
                      <UserCog size={14} /> Manage
                    </button>
                    {agent.status === "Active" ? (
                      <button 
                        onClick={() => updateField(agent.id, "status", "Inactive")}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-bold rounded-xl transition-colors"
                      >
                        <Ban size={14} /> Deactivate
                      </button>
                    ) : (
                      <button 
                        onClick={() => updateField(agent.id, "status", "Active")}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-bold rounded-xl transition-colors"
                      >
                        <Activity size={14} /> Activate
                      </button>
                    )}
                  </div>
                  
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Drawer (Manage Agent) */}
      <div 
        className={`absolute top-0 right-0 h-full w-[500px] xl:w-[600px] bg-white border-l border-slate-200 shadow-2xl transition-transform duration-300 flex flex-col z-20 ${
          selectedAgent ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedAgent && (
          <>
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <Avatar src={selectedAgent.avatar} alt={selectedAgent.name} size="lg" className="border-2 border-white shadow-sm" />
                <div>
                  <h2 className="text-xl font-black text-slate-900">{selectedAgent.name}</h2>
                  <p className="text-sm font-semibold text-slate-500">{selectedAgent.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedAgentId(null)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white">
              
              {/* Profile Configuration */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <UserCog size={16} /> Identity & Assignment
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Role</label>
                    <select 
                      value={selectedAgent.role}
                      onChange={(e) => updateField(selectedAgent.id, "role", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500 shadow-sm"
                    >
                      <option value="Support Agent">Support Agent</option>
                      <option value="Payment Support">Payment Support</option>
                      <option value="Dispute Specialist">Dispute Specialist</option>
                      <option value="Moderator">Moderator</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Department</label>
                    <select 
                      value={selectedAgent.department}
                      onChange={(e) => updateField(selectedAgent.id, "department", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500 shadow-sm"
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
                </div>
              </div>

              {/* Workload & Schedule */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Sliders size={16} /> Workload & Schedule
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <div>
                      <p className="text-sm font-bold text-slate-900">Maximum Active Chats</p>
                      <p className="text-xs text-slate-500 font-medium">Cap simultaneous live chats or tickets per agent.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus-within:border-indigo-500 shadow-sm w-24">
                      <input 
                        type="number" 
                        value={selectedAgent.maxChats}
                        onChange={(e) => updateField(selectedAgent.id, "maxChats", parseInt(e.target.value) || 0)}
                        className="w-full text-sm font-bold text-slate-900 outline-none text-center"
                        min="1"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <div>
                      <p className="text-sm font-bold text-slate-900">Working Hours</p>
                      <p className="text-xs text-slate-500 font-medium">When is this agent scheduled to be online?</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus-within:border-indigo-500 shadow-sm w-48">
                      <input 
                        type="text" 
                        value={selectedAgent.workingHours}
                        onChange={(e) => updateField(selectedAgent.id, "workingHours", e.target.value)}
                        className="w-full text-sm font-bold text-slate-900 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Permissions */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <ShieldCheck size={16} /> Granular Permissions
                </h3>
                
                <div className="grid grid-cols-2 gap-8">
                  
                  {/* CAN */}
                  <div className="space-y-4">
                    <p className="text-xs font-black text-emerald-600 uppercase tracking-wider border-b border-emerald-100 pb-2">Can Perform</p>
                    <div className="space-y-3">
                      {[
                        { key: "handleLiveChat", label: "Handle Live Chat" },
                        { key: "manageTickets", label: "Manage Tickets" },
                        { key: "accessPayments", label: "Access Payments" },
                        { key: "issueRefunds", label: "Issue Refunds" },
                        { key: "resolveDisputes", label: "Resolve Disputes" },
                        { key: "manageUsers", label: "Manage Users" }
                      ].filter(p => selectedAgent.permissions[p.key as keyof Permissions]).map(perm => (
                        <div key={perm.key} className="flex items-center justify-between group">
                          <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <CheckCircle size={14} className="text-emerald-500" />
                            {perm.label}
                          </span>
                          <button 
                            onClick={() => togglePermission(selectedAgent.id, perm.key as keyof Permissions)}
                            className="text-xs font-bold text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Revoke
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CANNOT */}
                  <div className="space-y-4">
                    <p className="text-xs font-black text-red-600 uppercase tracking-wider border-b border-red-100 pb-2">Cannot Perform</p>
                    <div className="space-y-3">
                      {[
                        { key: "handleLiveChat", label: "Handle Live Chat" },
                        { key: "manageTickets", label: "Manage Tickets" },
                        { key: "accessPayments", label: "Access Payments" },
                        { key: "issueRefunds", label: "Issue Refunds" },
                        { key: "resolveDisputes", label: "Resolve Disputes" },
                        { key: "manageUsers", label: "Manage Users" }
                      ].filter(p => !selectedAgent.permissions[p.key as keyof Permissions]).map(perm => (
                        <div key={perm.key} className="flex items-center justify-between group">
                          <span className="text-sm font-bold text-slate-500 flex items-center gap-2 opacity-70">
                            <XCircle size={14} className="text-red-400" />
                            {perm.label}
                          </span>
                          <button 
                            onClick={() => togglePermission(selectedAgent.id, perm.key as keyof Permissions)}
                            className="text-xs font-bold text-slate-400 hover:text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Grant
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* Danger Zone */}
              <div className="pt-8 mt-8 border-t border-red-100">
                <h3 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  Danger Zone
                </h3>
                <div className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-xl">
                  <div>
                    <p className="text-sm font-bold text-red-900">Remove Agent</p>
                    <p className="text-xs text-red-700 font-medium">Permanently delete this agent from the system.</p>
                  </div>
                  <button 
                    onClick={() => removeAgent(selectedAgent.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-bold shadow-sm hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} /> Remove
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
