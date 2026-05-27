"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Search, RefreshCw, Ban, CheckCircle, Trash2, Shield, UserCheck } from "lucide-react";
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
  _count: { gigsAsSeller: number; ordersAsBuyer: number };
}

const ROLES = ["BUYER", "SELLER", "ADMIN", "SUPER_ADMIN"];

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers]       = useState<AdminUser[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [q, setQ]               = useState("");
  const [confirm, setConfirm]   = useState<{ action: string; target: AdminUser; extra?: string } | null>(null);
  const [actioning, setActioning] = useState(false);

  const fetchUsers = useCallback(async () => {
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
        setUsers(data.users);
        setTotal(data.total);
      }
    } finally {
      setLoading(false);
    }
  }, [user, q]);

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
            <p className="text-sm text-slate-500 mt-0.5">{total} registered users</p>
          </div>
          <button onClick={fetchUsers} className="p-2 rounded-xl hover:bg-slate-100">
            <RefreshCw size={16} className={`text-slate-500 ${loading ? "animate-spin" : ""}`} />
          </button>
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
                    <td className="px-5 py-4"><StatusBadge status={u.role} /></td>
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
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => setConfirm({ action: u.isBanned ? "unban" : "ban", target: u })}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            u.isBanned
                              ? "bg-teal-50 text-teal-700 hover:bg-teal-100"
                              : "bg-orange-50 text-orange-700 hover:bg-orange-100"
                          }`}
                        >
                          <Ban size={11} /> {u.isBanned ? "Unban" : "Ban"}
                        </button>
                        <button
                          onClick={() => setConfirm({ action: u.isVerified ? "unverify" : "verify", target: u })}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-colors"
                        >
                          <UserCheck size={11} /> {u.isVerified ? "Unverify" : "Verify"}
                        </button>
                        <select
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) {
                              setConfirm({ action: "changeRole", target: u, extra: e.target.value });
                              e.target.value = "";
                            }
                          }}
                          className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none"
                        >
                          <option value="">Role…</option>
                          {ROLES.filter((r) => r !== u.role).map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => setConfirm({ action: "delete", target: u })}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold transition-colors"
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
