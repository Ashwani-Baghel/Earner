"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Search, RefreshCw, Ban, CheckCircle, Trash2, Shield, UserCheck, Plus, X, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isBanned: boolean;
  isVerified: boolean;
  isSeller: boolean;
  createdAt: string;
  _count: { gigsAsSeller: number; ordersAsBuyer: number };
}

const ROLES = ["BUYER", "SELLER", "ADMIN", "SUPER_ADMIN"];

function AdminUsersPageContent() {
  const { user } = useAuth();
  const [users, setUsers]       = useState<AdminUser[]>([]);
  const [total, setTotal]       = useState(0);
  const [counts, setCounts]     = useState({ total: 0, buyersOnly: 0, sellers: 0 });
  const [loading, setLoading]   = useState(true);
  const searchParams = useSearchParams();
  const [q, setQ]               = useState("");
  const [role, setRole]         = useState(searchParams.get("role")?.toUpperCase() || "");
  const [isSeller, setIsSeller] = useState(searchParams.get("isSeller") === "true");
  const [confirm, setConfirm]   = useState<{ action: string; target: AdminUser; extra?: string } | null>(null);
  const [actioning, setActioning] = useState(false);

  useEffect(() => {
    const urlRole = searchParams.get("role")?.toUpperCase() || "";
    if (role !== urlRole) {
      setRole(urlRole);
    }
    const urlIsSeller = searchParams.get("isSeller") === "true";
    if (isSeller !== urlIsSeller) {
      setIsSeller(urlIsSeller);
    }
  }, [searchParams]);



  const fetchUsers = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const params = new URLSearchParams({ limit: "100" });
      if (q) params.set("q", q);
      if (role) params.set("role", role);
      if (isSeller) params.set("isSeller", "true");
      const res = await fetch(`/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setTotal(data.total);
        if (data.counts) setCounts(data.counts);
      }
    } finally {
      setLoading(false);
    }
  }, [user, q, role, isSeller]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

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
      await fetchUsers();
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
            <h1 className="text-xl font-bold text-slate-900">User Management</h1>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-sm font-medium bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">{counts.total} Total Users</span>
              <span className="text-sm font-medium bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full">{counts.buyersOnly} Only Buyer</span>
              <span className="text-sm font-medium bg-purple-50 text-purple-600 px-2.5 py-0.5 rounded-full">{counts.sellers} Both (Buyer & Seller)</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchUsers} className="p-2 rounded-xl hover:bg-slate-100">
              <RefreshCw size={16} className={`text-slate-500 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                value={q}
                onChange={e => setQ(e.target.value)}
              />
            </div>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="bg-slate-100 border-transparent rounded-xl px-4 py-2 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
            >
              <option value="">All Roles</option>
              {ROLES.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl cursor-pointer transition-colors whitespace-nowrap">
              <input type="checkbox" checked={isSeller} onChange={e => setIsSeller(e.target.checked)} className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer" />
              Also a Seller
            </label>
          </div>
      </div>

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
                  {["User", "Role", "Status", "Gigs", "Orders", "Joined", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
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
                    <td className="px-5 py-4">
                      <div className="flex flex-col items-start gap-1.5">
                        <StatusBadge status={u.role === "SELLER" ? "BUYER" : u.role} />
                        {u.isSeller && u.role !== "SUPER_ADMIN" && u.role !== "ADMIN" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 uppercase tracking-wider">
                            Also Seller
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        {u.isBanned && <StatusBadge status="BANNED" />}
                        {u.isVerified && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                            <CheckCircle size={10} /> Verified
                          </span>
                        )}
                        {!u.isBanned && !u.isVerified && (
                          <span className="text-xs text-slate-400">Normal</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 font-medium">{u._count.gigsAsSeller}</td>
                    <td className="px-5 py-4 text-slate-600 font-medium">{u._count.ordersAsBuyer}</td>
                    <td className="px-5 py-4 text-xs text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 flex-nowrap">
                        <button
                          onClick={() => setConfirm({ action: u.isBanned ? "unban" : "ban", target: u })}
                          className={`flex items-center justify-center gap-1 w-[76px] px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            u.isBanned
                              ? "bg-teal-50 text-teal-700 hover:bg-teal-100"
                              : "bg-orange-50 text-orange-700 hover:bg-orange-100"
                          }`}
                        >
                          <Ban size={11} /> {u.isBanned ? "Unban" : "Ban"}
                        </button>
                        <button
                          onClick={() => setConfirm({ action: u.isVerified ? "unverify" : "verify", target: u })}
                          className="flex items-center justify-center gap-1 w-[88px] px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-colors"
                        >
                          <UserCheck size={11} /> {u.isVerified ? "Unverify" : "Verify"}
                        </button>
                        <div className="w-[84px]">
                          {u.role !== "SUPER_ADMIN" && (
                            <select
                              defaultValue=""
                              onChange={(e) => {
                                if (e.target.value) {
                                  setConfirm({ action: "changeRole", target: u, extra: e.target.value });
                                  e.target.value = "";
                                }
                              }}
                              className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none"
                            >
                              <option value="">Role…</option>
                              {ROLES.filter((r) => r !== u.role && r !== "SUPER_ADMIN").map((r) => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </select>
                          )}
                        </div>
                        <button
                          onClick={() => setConfirm({ action: "delete", target: u })}
                          className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold transition-colors"
                        >
                          <Trash2 size={11} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirm}
        title={`${confirm?.action === "ban" ? "Ban" : confirm?.action === "unban" ? "Unban" : confirm?.action === "delete" ? "Delete" : confirm?.action === "changeRole" ? "Change Role" : confirm?.action === "verify" ? "Verify" : "Unverify"} User`}
        description={
          confirm?.action === "changeRole"
            ? `Change ${confirm?.target?.name}'s role to ${confirm?.extra}?`
            : `Are you sure you want to ${confirm?.action} ${confirm?.target?.name}?${confirm?.action === "delete" ? " This is permanent." : ""}`
        }
        confirmLabel={confirm?.action === "ban" ? "Ban" : confirm?.action === "delete" ? "Delete" : "Confirm"}
        danger={confirm?.action === "ban" || confirm?.action === "delete"}
        loading={actioning}
        onConfirm={doAction}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminUsersPageContent />
    </Suspense>
  );
}
