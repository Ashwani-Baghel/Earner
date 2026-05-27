"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Search, Filter, CheckCircle, XCircle, Ban, Trash2, RefreshCw, Eye } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

interface Gig {
  id: string;
  title: string;
  category: string;
  status: string;
  createdAt: string;
  seller: { id: string; name: string; email: string };
}

const STATUSES = ["", "PENDING", "ACTIVE", "REJECTED", "BANNED", "PAUSED", "DRAFT"];

export default function AdminGigsPage() {
  const { user } = useAuth();
  const [gigs, setGigs]         = useState<Gig[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [q, setQ]               = useState("");
  const [status, setStatus]     = useState("");
  const [confirm, setConfirm]   = useState<{ action: string; gig: Gig } | null>(null);
  const [actioning, setActioning] = useState(false);

  const fetchGigs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const params = new URLSearchParams({ limit: "100" });
      if (q)      params.set("q", q);
      if (status) params.set("status", status);
      const res = await fetch(`/api/admin/gigs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setGigs(data.gigs);
        setTotal(data.total);
      }
    } finally {
      setLoading(false);
    }
  }, [user, q, status]);

  useEffect(() => { fetchGigs(); }, [fetchGigs]);

  const doAction = async (gigId: string, action: string) => {
    if (!user) return;
    setActioning(true);
    try {
      const token = await user.getIdToken();
      if (action === "delete") {
        await fetch("/api/admin/gigs", {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ gigId }),
        });
      } else {
        const statusMap: Record<string, string> = {
          approve: "ACTIVE", reject: "REJECTED", ban: "BANNED",
        };
        await fetch("/api/admin/gigs", {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ gigId, status: statusMap[action] }),
        });
      }
      await fetchGigs();
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
            <h1 className="text-xl font-bold text-slate-900">Gig Moderation</h1>
            <p className="text-sm text-slate-500 mt-0.5">{total} total gigs</p>
          </div>
          <button onClick={fetchGigs} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <RefreshCw size={16} className={`text-slate-500 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mt-4 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title or category…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s || "All Statuses"}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw size={24} className="animate-spin text-teal-500" />
          </div>
        ) : gigs.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Filter size={40} className="mx-auto mb-3 opacity-40" />
            <p className="font-semibold">No gigs found</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {["Gig Title", "Seller", "Category", "Status", "Created", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {gigs.map((gig) => (
                  <tr key={gig.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900 truncate max-w-[200px]">{gig.title}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-700">{gig.seller?.name}</p>
                      <p className="text-xs text-slate-400 truncate">{gig.seller?.email}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{gig.category}</td>
                    <td className="px-5 py-4"><StatusBadge status={gig.status} /></td>
                    <td className="px-5 py-4 text-slate-400 text-xs">
                      {new Date(gig.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        {gig.status === "PENDING" && (
                          <button
                            onClick={() => setConfirm({ action: "approve", gig })}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 text-xs font-semibold transition-colors"
                          >
                            <CheckCircle size={12} /> Approve
                          </button>
                        )}
                        {gig.status !== "REJECTED" && gig.status !== "BANNED" && (
                          <button
                            onClick={() => setConfirm({ action: "reject", gig })}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold transition-colors"
                          >
                            <XCircle size={12} /> Reject
                          </button>
                        )}
                        {gig.status !== "BANNED" && (
                          <button
                            onClick={() => setConfirm({ action: "ban", gig })}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 text-xs font-semibold transition-colors"
                          >
                            <Ban size={12} /> Ban
                          </button>
                        )}
                        <button
                          onClick={() => setConfirm({ action: "delete", gig })}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold transition-colors"
                        >
                          <Trash2 size={12} /> Delete
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
        title={`${confirm?.action === "approve" ? "Approve" : confirm?.action === "reject" ? "Reject" : confirm?.action === "ban" ? "Ban" : "Delete"} Gig`}
        description={`Are you sure you want to ${confirm?.action} "${confirm?.gig?.title}"?${confirm?.action === "delete" ? " This is permanent." : ""}`}
        confirmLabel={confirm?.action === "approve" ? "Approve" : confirm?.action === "reject" ? "Reject" : confirm?.action === "ban" ? "Ban" : "Delete"}
        danger={confirm?.action !== "approve"}
        loading={actioning}
        onConfirm={() => confirm && doAction(confirm.gig.id, confirm.action)}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
