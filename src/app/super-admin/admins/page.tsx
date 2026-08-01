"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Search, RefreshCw, Trash2, Shield, Plus, X, Loader2, Eye, EyeOff, Edit } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isBanned: boolean;
  isVerified: boolean;
  createdAt: string;
  adminProfile?: {
    roleId: string | null;
    permissions: { permission: Permission }[];
  }
}

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface AdminRole {
  id: string;
  name: string;
  description: string;
}

export default function AdminManagementPage() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [permissionsList, setPermissionsList] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [confirm, setConfirm] = useState<{ action: string; target: AdminUser; extra?: string } | null>(null);
  const [actioning, setActioning] = useState(false);

  const [addAdminOpen, setAddAdminOpen] = useState(false);
  const [isEditingAdmin, setIsEditingAdmin] = useState(false);
  const [addAdminForm, setAddAdminForm] = useState<{id?: string, name: string, email: string, password: string, confirmPassword: string, roleId: string, permissionIds: string[]}>({ name: "", email: "", password: "", confirmPassword: "", roleId: "", permissionIds: [] });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [addAdminError, setAddAdminError] = useState("");

  const openCreateAdmin = () => {
    setIsEditingAdmin(false);
    setAddAdminForm({ name: "", email: "", password: "", confirmPassword: "", roleId: "", permissionIds: [] });
    setAddAdminOpen(true);
  };

  const openEditAdmin = (admin: AdminUser) => {
    setIsEditingAdmin(true);
    setAddAdminForm({ 
      id: admin.id,
      name: admin.name, 
      email: admin.email, 
      password: "", 
      confirmPassword: "", 
      roleId: admin.adminProfile?.roleId || "", 
      permissionIds: admin.adminProfile?.permissions.map(p => p.permission.id) || []
    });
    setAddAdminOpen(true);
  };

  const fetchPermissions = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/permissions", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setPermissionsList(data);
      }
    } catch (e) {
      console.error("Failed to fetch permissions", e);
    }
  }, [user]);

  const fetchRoles = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/roles", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
      }
    } catch (e) {
      console.error("Failed to fetch roles", e);
    }
  }, [user]);

  const fetchAdmins = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const params = new URLSearchParams({ limit: "100" });
      if (q) params.set("q", q);
      const res = await fetch(`/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // Filter only Admins and Super Admins
        const filteredAdmins = data.users.filter((u: AdminUser) => u.role === "ADMIN" || u.role === "SUPER_ADMIN");
        setAdmins(filteredAdmins);
        setTotal(filteredAdmins.length);
      }
    } finally {
      setLoading(false);
    }
  }, [user, q]);

  useEffect(() => { 
    fetchAdmins();
    fetchPermissions();
    fetchRoles();
  }, [fetchAdmins, fetchPermissions, fetchRoles]);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingAdmin(true);
    setAddAdminError("");

    if (!isEditingAdmin && addAdminForm.password !== addAdminForm.confirmPassword) {
      setAddAdminError("Passwords do not match");
      setAddingAdmin(false);
      return;
    }

    try {
      const token = await user?.getIdToken();
      
      let res;
      if (isEditingAdmin) {
        res = await fetch("/api/admin/update-admin", {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            userId: addAdminForm.id,
            name: addAdminForm.name,
            roleId: addAdminForm.roleId || null,
            permissionIds: addAdminForm.permissionIds
          }),
        });
      } else {
        res = await fetch("/api/admin/create-admin", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            name: addAdminForm.name,
            email: addAdminForm.email,
            password: addAdminForm.password,
            roleId: addAdminForm.roleId || null,
            permissionIds: addAdminForm.permissionIds
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || (isEditingAdmin ? "Failed to update admin" : "Failed to create admin"));
      
      setAddAdminOpen(false);
      setAddAdminForm({ name: "", email: "", password: "", confirmPassword: "", roleId: "", permissionIds: [] });
      fetchAdmins();
    } catch (err: any) {
      setAddAdminError(err.message);
    } finally {
      setAddingAdmin(false);
    }
  };

  const doAction = async () => {
    if (!confirm || !user) return;
    setActioning(true);
    try {
      const token = await user.getIdToken();
      const { action, target, extra } = confirm;

      if (action === "delete") {
        await fetch("/api/admin/users", {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ userId: target.id }),
        });
      } else {
        const body: any = { userId: target.id, action };
        if (action === "changeRole") body.role = extra;
        await fetch("/api/admin/users", {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      await fetchAdmins();
    } finally {
      setActioning(false);
      setConfirm(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Admin Management</h1>
            <p className="text-sm text-slate-500 mt-0.5">{total} registered admins</p>
          </div>
          <div className="flex items-center gap-3">
            {user?.role === "SUPER_ADMIN" && (
              <button 
                onClick={openCreateAdmin}
                className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
              >
                <Plus size={16} /> Add Admin
              </button>
            )}
            <button onClick={fetchAdmins} className="p-2 rounded-xl hover:bg-slate-100">
              <RefreshCw size={16} className={`text-slate-500 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
        <div className="mt-4 relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or email…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {addAdminOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Shield size={18} className="text-teal-600" /> {isEditingAdmin ? "Edit Admin Access" : "Provision New Admin"}
              </h3>
              <button onClick={() => setAddAdminOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddAdmin} className="p-5 space-y-4">
              {addAdminError && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                  {addAdminError}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Name</label>
                <input 
                  type="text" 
                  required
                  value={addAdminForm.name}
                  onChange={e => setAddAdminForm({...addAdminForm, name: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  disabled={isEditingAdmin}
                  value={addAdminForm.email}
                  onChange={e => setAddAdminForm({...addAdminForm, email: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Role Assignment</label>
                <select 
                  value={addAdminForm.roleId}
                  onChange={e => setAddAdminForm({...addAdminForm, roleId: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="">No Role (SUPER_ADMIN or Custom)</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name} - {r.description}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">Select a predefined role. You can also add extra specific access privileges below.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Extra Access Privileges</label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-h-48 overflow-y-auto space-y-2">
                  {permissionsList.map(p => {
                    const isSelected = addAdminForm.permissionIds.includes(p.id);
                    return (
                      <label key={p.id} className="flex items-start gap-3 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200">
                        <div className="mt-0.5">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAddAdminForm({...addAdminForm, permissionIds: [...addAdminForm.permissionIds, p.id]});
                              } else {
                                setAddAdminForm({...addAdminForm, permissionIds: addAdminForm.permissionIds.filter(id => id !== p.id)});
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
                  {permissionsList.length === 0 && (
                    <p className="text-sm text-slate-500 italic text-center py-4">No permissions found in the database.</p>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Select the specific areas this admin can access. Leave empty if you are granting full SUPER_ADMIN access later, or if this admin is restricted.
                </p>
              </div>

              {!isEditingAdmin && (
                <>
                  <div className="relative">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required
                      minLength={6}
                      value={addAdminForm.password}
                      onChange={e => setAddAdminForm({...addAdminForm, password: e.target.value})}
                      className="w-full pl-4 pr-10 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[30px] text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm Password</label>
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      required
                      minLength={6}
                      value={addAdminForm.confirmPassword}
                      onChange={e => setAddAdminForm({...addAdminForm, confirmPassword: e.target.value})}
                      className="w-full pl-4 pr-10 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-[30px] text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </>
              )}
              
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setAddAdminOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={addingAdmin}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors disabled:opacity-70"
                >
                  {addingAdmin ? <Loader2 size={16} className="animate-spin" /> : isEditingAdmin ? "Save Changes" : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw size={24} className="animate-spin text-teal-500" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {["Admin", "Role", "Status", "Joined", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {admins.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{u.name}</p>
                          <p className="text-xs text-slate-400 truncate max-w-[160px]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={u.role} /></td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        {u.isBanned && <StatusBadge status="BANNED" />}
                        {!u.isBanned && <StatusBadge status="ACTIVE" />}
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {u.role !== "SUPER_ADMIN" && user?.role === "SUPER_ADMIN" && (
                          <>
                            <button
                              onClick={() => openEditAdmin(u)}
                              className="px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
                            >
                              <Edit size={13} /> Edit
                            </button>
                            <button
                              onClick={() => setConfirm({ action: "delete", target: u })}
                              disabled={actioning}
                              className="px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </>
                        )}
                        {u.role === "SUPER_ADMIN" && (
                          <span className="text-xs text-slate-400 italic">No actions available</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {admins.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                      No admins found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirm && (
        <ConfirmDialog
          open={!!confirm}
          title={
            confirm.action === "delete" ? "Delete Admin?" 
            : confirm.action === "ban" ? "Ban Admin?" : "Confirm Action"
          }
          description={
            confirm.action === "delete" 
              ? `Are you sure you want to permanently delete ${confirm.target.name}?` 
              : `Are you sure you want to proceed?`
          }
          confirmLabel={confirm.action === "delete" ? "Delete Admin" : "Confirm"}
          onConfirm={doAction}
          onCancel={() => setConfirm(null)}
          danger={confirm.action === "delete" || confirm.action === "ban"}
          loading={actioning}
        />
      )}
    </div>
  );
}
