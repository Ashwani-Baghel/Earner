"use client";

import { useState } from "react";
import { FolderGit2, Plus, GripVertical, Trash2, Edit2, Users, ArrowRightLeft, X, Save } from "lucide-react";

interface Department {
  id: string;
  name: string;
  description: string;
  agents: number;
  autoRouting: boolean;
  active: boolean;
}

const INITIAL_DEPARTMENTS: Department[] = [
  { id: "d1", name: "General Support", description: "Default catch-all for general inquiries and account issues.", agents: 12, autoRouting: true, active: true },
  { id: "d2", name: "Payments", description: "Handles billing, withdrawals, and payment failures.", agents: 4, autoRouting: true, active: true },
  { id: "d3", name: "Orders", description: "Issues related to gig delivery, cancellations, and active orders.", agents: 8, autoRouting: true, active: true },
  { id: "d4", name: "Technical", description: "Bug reports, platform glitches, and technical assistance.", agents: 3, autoRouting: false, active: true },
  { id: "d5", name: "Seller Support", description: "Dedicated help for freelancers regarding their gigs and metrics.", agents: 5, autoRouting: true, active: true },
  { id: "d6", name: "Disputes", description: "Mediates conflicts and escalated order issues between users.", agents: 6, autoRouting: true, active: true },
];

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    autoRouting: true,
    active: true
  });

  const toggleField = (id: string, field: "active" | "autoRouting") => {
    setDepartments(departments.map(d => 
      d.id === id ? { ...d, [field]: !d[field] } : d
    ));
  };

  const handleDelete = (id: string) => {
    if(confirm("Are you sure you want to permanently delete this department? Tickets will fall back to general routing.")) {
      setDepartments(departments.filter(d => d.id !== id));
    }
  };

  const openAddModal = () => {
    setEditingDept(null);
    setFormData({ name: "", description: "", autoRouting: true, active: true });
    setIsModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      description: dept.description,
      autoRouting: dept.autoRouting,
      active: dept.active
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) return;

    if (editingDept) {
      setDepartments(departments.map(d => 
        d.id === editingDept.id 
          ? { ...d, ...formData }
          : d
      ));
    } else {
      const newDept: Department = {
        id: `d${Date.now()}`,
        agents: 0,
        ...formData
      };
      setDepartments([...departments, newDept]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <FolderGit2 className="text-indigo-600" size={24} />
            Support Departments
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Manage routing categories to ensure tickets and chats reach the specialized agents.
          </p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} /> Add Department
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="px-6 py-4 w-10"></th>
                <th className="px-6 py-4">Department Details</th>
                <th className="px-6 py-4 text-center">Active Agents</th>
                <th className="px-6 py-4 text-center">Auto-Routing</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                    No departments found. Click "Add Department" to create one.
                  </td>
                </tr>
              )}
              {departments.map((dept) => (
                <tr key={dept.id} className={`group hover:bg-slate-50 transition-colors ${!dept.active ? 'opacity-60' : ''}`}>
                  <td className="px-6 py-4">
                    <button className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing">
                      <GripVertical size={18} />
                    </button>
                  </td>
                  
                  <td className="px-6 py-4">
                    <p className={`text-base font-black ${dept.active ? 'text-slate-900' : 'text-slate-500 line-through'}`}>
                      {dept.name}
                    </p>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5 max-w-md truncate">
                      {dept.description}
                    </p>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl font-bold text-sm w-fit mx-auto border border-indigo-100">
                      <Users size={14} /> {dept.agents}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => toggleField(dept.id, "autoRouting")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${dept.autoRouting ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${dept.autoRouting ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </td>
                  
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => toggleField(dept.id, "active")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${dept.active ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${dept.active ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </td>
                  
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEditModal(dept)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(dept.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Widget */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex items-start gap-4">
        <div className="shrink-0 w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
          <ArrowRightLeft size={20} />
        </div>
        <div>
          <h3 className="text-sm font-black text-indigo-900 mb-1">How Ticket Routing Works</h3>
          <p className="text-sm text-indigo-800/80 font-medium leading-relaxed">
            When <strong>Auto-Routing</strong> is enabled, any new chat or ticket matching the department's category will automatically be assigned to the next available agent within that specific department. If auto-routing is disabled, tickets fall into a general pool where agents must manually claim them.
          </p>
        </div>
      </div>

      {/* Modal overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <FolderGit2 className="text-indigo-600" size={20} />
                {editingDept ? "Edit Department" : "Add Department"}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-900 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Department Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. VIP Support"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What kind of tickets does this department handle?"
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors resize-none"
                />
              </div>

              <div className="pt-2 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Auto-Routing</p>
                    <p className="text-xs text-slate-500 mt-0.5">Automatically assign incoming tickets.</p>
                  </div>
                  <button 
                    onClick={() => setFormData({ ...formData, autoRouting: !formData.autoRouting })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.autoRouting ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${formData.autoRouting ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Department Status</p>
                    <p className="text-xs text-slate-500 mt-0.5">Allow users to select this category.</p>
                  </div>
                  <button 
                    onClick={() => setFormData({ ...formData, active: !formData.active })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.active ? 'bg-indigo-600' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${formData.active ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button 
                onClick={handleSave}
                disabled={!formData.name.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} /> {editingDept ? "Save Changes" : "Create Department"}
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
