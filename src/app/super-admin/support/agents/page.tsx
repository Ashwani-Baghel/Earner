"use client";

import { useState, useEffect } from "react";
import { Users, Plus, ShieldCheck, Mail, Activity, Edit2, Ban, X, CheckCircle, XCircle, Sliders, UserCog, Trash2, Clock, MessageCircle } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/context/AuthContext";

interface SystemPermission {
  id: string;
  name: string;
  description: string;
}

interface SupportAgent {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  department: string;
  isActive: boolean;
  permissionIds: string[];
  activeChats: number;
  maxChats: number;
  workingHours: string;
}

export default function SupportAgentsPage() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<SupportAgent[]>([]);
  const [permissionsList, setPermissionsList] = useState<SystemPermission[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAgentEmail, setNewAgentEmail] = useState("");
  const [newAgentName, setNewAgentName] = useState("");
  const [newAgentPassword, setNewAgentPassword] = useState("");
  const [newAgentDepartment, setNewAgentDepartment] = useState("General Support");
  const [isLoading, setIsLoading] = useState(false);

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  useEffect(() => {
    fetchAgents();
    fetchPermissions();
  }, [user]);

  const fetchAgents = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/users?role=ADMIN", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const usersArray = Array.isArray(data) ? data : (data.users || []);
        setAgents(usersArray.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`,
          role: u.adminProfile?.role?.name || "Support Agent",
          department: u.adminProfile?.department || "General Support",
          isActive: u.adminProfile?.isActive ?? false,
          permissionIds: u.adminProfile?.permissions?.map((p: any) => p.permission.id) || [],
          activeChats: 0,
          maxChats: 5,
          workingHours: "09:00 AM - 05:00 PM EST"
        })));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPermissions = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/permissions", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setPermissionsList(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/create-admin", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          email: newAgentEmail,
          name: newAgentName,
          password: newAgentPassword,
          department: newAgentDepartment
        })
      });
      
      if (res.ok) {
        setIsAddModalOpen(false);
        setNewAgentEmail("");
        setNewAgentName("");
        setNewAgentPassword("");
        setNewAgentDepartment("General Support");
        fetchAgents();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to add agent");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const updateAgentDB = async (agentId: string, updates: any) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      // Optimistic UI update
      setAgents(prev => prev.map(a => a.id === agentId ? { ...a, ...updates } : a));
      
      await fetch("/api/admin/update-admin", {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ userId: agentId, ...updates })
      });
      // Optionally fetchAgents() here to guarantee sync, but optimistic UI is smoother
    } catch (e) {
      console.error(e);
    }
  };

  const togglePermission = (agentId: string, permId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;
    
    let newPerms = [...agent.permissionIds];
    if (newPerms.includes(permId)) {
      newPerms = newPerms.filter(id => id !== permId);
    } else {
      newPerms.push(permId);
    }
    
    updateAgentDB(agentId, { permissionIds: newPerms });
  };

  const setAgentActiveStatus = (agentId: string, isActive: boolean) => {
    updateAgentDB(agentId, { isActive });
  };
  
  const removeAgent = (agentId: string) => {
    // Only deactivate instead of hard delete for safety
    setAgentActiveStatus(agentId, false);
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
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 transition-colors"
            >
              <Plus size={16} /> Add Agent
            </button>
          </div>

          {agents.length === 0 && !isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-slate-200 border-dashed">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                <Users className="text-indigo-400" size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">No Support Agents Yet</h3>
              <p className="text-slate-500 font-medium max-w-md mb-8">
                You haven't created any support agents yet. Get started by adding your first agent to handle customer support tickets and live chats.
              </p>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl transition-all"
              >
                <Plus size={18} /> Add Your First Agent
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <div key={agent.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                  
                  {/* Top color block & actions */}
                  <div className="h-16 bg-slate-50 border-b border-slate-100 flex justify-end p-3 relative">
                    <div className="absolute top-1/2 left-6 -translate-y-[-10px]">
                      <Avatar src={agent.avatar || ""} alt={agent.name} size="xl" className="border-4 border-white shadow-sm bg-white" />
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
                      
                      {agent.isActive ? (
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
                      {agent.isActive ? (
                        <button 
                          onClick={() => setAgentActiveStatus(agent.id, false)}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-bold rounded-xl transition-colors"
                        >
                          <Ban size={14} /> Deactivate
                        </button>
                      ) : (
                        <button 
                          onClick={() => setAgentActiveStatus(agent.id, true)}
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
          )}
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
                <Avatar src={selectedAgent.avatar || ""} alt={selectedAgent.name} size="lg" className="border-2 border-white shadow-sm" />
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
                      onChange={(e) => updateAgentDB(selectedAgent.id, { role: e.target.value })}
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
                      onChange={(e) => updateAgentDB(selectedAgent.id, { department: e.target.value })}
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
                        onChange={(e) => updateAgentDB(selectedAgent.id, { maxChats: parseInt(e.target.value) || 0 })}
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
                        onChange={(e) => updateAgentDB(selectedAgent.id, { workingHours: e.target.value })}
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
                      {permissionsList.filter(p => selectedAgent.permissionIds.includes(p.id)).map(perm => (
                        <div key={perm.id} className="flex items-center justify-between group">
                          <span className="text-sm font-bold text-slate-700 flex items-center gap-2" title={perm.description}>
                            <CheckCircle size={14} className="text-emerald-500" />
                            {perm.name}
                          </span>
                          <button 
                            onClick={() => togglePermission(selectedAgent.id, perm.id)}
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
                      {permissionsList.filter(p => !selectedAgent.permissionIds.includes(p.id)).map(perm => (
                        <div key={perm.id} className="flex items-center justify-between group">
                          <span className="text-sm font-bold text-slate-500 flex items-center gap-2 opacity-70" title={perm.description}>
                            <XCircle size={14} className="text-red-400" />
                            {perm.name}
                          </span>
                          <button 
                            onClick={() => togglePermission(selectedAgent.id, perm.id)}
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
                    <p className="text-sm font-bold text-red-900">Deactivate Agent</p>
                    <p className="text-xs text-red-700 font-medium">Remove this agent's access immediately.</p>
                  </div>
                  <button 
                    onClick={() => removeAgent(selectedAgent.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-bold shadow-sm hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} /> Deactivate
                  </button>
                </div>
              </div>

            </div>
          </>
        )}
      </div>

      {/* Add Agent Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-black text-slate-900">Add New Agent</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddAgent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={newAgentName}
                  onChange={e => setNewAgentName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-semibold"
                  placeholder="e.g. Jane Doe"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={newAgentEmail}
                  onChange={e => setNewAgentEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-semibold"
                  placeholder="jane@earner.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                <input 
                  type="password" 
                  value={newAgentPassword}
                  onChange={e => setNewAgentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-semibold"
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Department</label>
                <select 
                  value={newAgentDepartment}
                  onChange={e => setNewAgentDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-semibold bg-white"
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
              
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 px-4 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2 px-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Creating...' : 'Create Agent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
