"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Shield, Key, Search, RefreshCw, Plus, Trash2, Edit, X, Loader2 } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface AdminRole {
  id: string;
  name: string;
  description: string;
  permissions: { permission: Permission }[];
  _count?: { admins: number };
}

export default function RolesManagementPage() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [permissionsList, setPermissionsList] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Form State
  const [form, setForm] = useState<{ id?: string, name: string, description: string, permissionIds: string[] }>({
    name: "", description: "", permissionIds: []
  });

  // Delete State
  const [confirmDelete, setConfirmDelete] = useState<AdminRole | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const [resRoles, resPerms] = await Promise.all([
        fetch("/api/admin/roles", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/permissions", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (resRoles.ok) setRoles(await resRoles.json());
      if (resPerms.ok) setPermissionsList(await resPerms.json());
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreateModal = () => {
    setIsEditing(false);
    setForm({ name: "", description: "", permissionIds: [] });
    setErrorMsg("");
    setModalOpen(true);
  };

  const openEditModal = (role: AdminRole) => {
    setIsEditing(true);
    setForm({ 
      id: role.id, 
      name: role.name, 
      description: role.description || "", 
      permissionIds: role.permissions.map(rp => rp.permission.id) 
    });
    setErrorMsg("");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    try {
      const token = await user?.getIdToken();
      const method = isEditing ? "PATCH" : "POST";
      const body = isEditing ? { ...form, roleId: form.id } : form;

      const res = await fetch("/api/admin/roles", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save role");

      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete || !user) return;
    setDeleting(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/roles", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ roleId: confirmDelete.id }),
      });
      if (res.ok) {
        fetchData();
      }
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Roles & Permissions</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage custom roles and access control</p>
          </div>
          <div className="flex items-center gap-3">
            {user?.role === "SUPER_ADMIN" && (
              <button 
                onClick={openCreateModal}
                className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
              >
                <Plus size={16} /> Create Role
              </button>
            )}
            <button onClick={fetchData} className="p-2 rounded-xl hover:bg-slate-100">
              <RefreshCw size={16} className={`text-slate-500 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw size={24} className="animate-spin text-teal-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Hardcoded Super Admin */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-slate-900"></div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center">
                  <Shield size={20} />
                </div>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold tracking-wider uppercase rounded-md">System</span>
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Super Admin</h3>
              <p className="text-sm text-slate-500 mb-4 flex-1">Implicitly has all permissions across the entire platform. Cannot be edited or deleted.</p>
              <div className="pt-4 border-t border-slate-100 text-sm font-semibold text-slate-400">
                Full Access
              </div>
            </div>

            {/* Dynamic Roles */}
            {roles.map((role) => (
              <div key={role.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full group hover:border-teal-200 transition-colors relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-teal-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <Key size={20} />
                  </div>
                  {user?.role === "SUPER_ADMIN" && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(role)} className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => setConfirmDelete(role)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{role.name}</h3>
                <p className="text-sm text-slate-500 mb-4 flex-1">{role.description || "No description provided."}</p>
                
                <div className="pt-4 border-t border-slate-100">
                  <div className="text-xs font-semibold text-slate-500 mb-2 flex justify-between">
                    <span>{role.permissions.length} Permissions</span>
                    <span>{role._count?.admins || 0} Users</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 3).map(p => (
                      <span key={p.permission.id} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">
                        {p.permission.name}
                      </span>
                    ))}
                    {role.permissions.length > 3 && (
                      <span className="text-[10px] bg-slate-50 text-slate-400 px-2 py-0.5 rounded-md font-mono">
                        +{role.permissions.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Shield size={18} className="text-teal-600" /> {isEditing ? "Edit Role" : "Create New Role"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 flex-1 overflow-y-auto space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                  {errorMsg}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Role Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Support Agent"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <input 
                  type="text" 
                  placeholder="What does this role do?"
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 mt-4">Assign Base Permissions</label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  {permissionsList.map(p => {
                    const isSelected = form.permissionIds.includes(p.id);
                    return (
                      <label key={p.id} className="flex items-start gap-3 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200">
                        <div className="mt-0.5">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setForm({...form, permissionIds: [...form.permissionIds, p.id]});
                              } else {
                                setForm({...form, permissionIds: form.permissionIds.filter(id => id !== p.id)});
                              }
                            }}
                            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{p.description}</p>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">{p.name}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-70"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : isEditing ? "Save Changes" : "Create Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <ConfirmDialog
          open={!!confirmDelete}
          title="Delete Role?"
          description={`Are you sure you want to permanently delete the "${confirmDelete.name}" role? Any admins assigned to this role will lose these base permissions.`}
          confirmLabel="Delete Role"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
          danger={true}
          loading={deleting}
        />
      )}
    </div>
  );
}
