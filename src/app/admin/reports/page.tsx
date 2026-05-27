"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Flag, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

interface Report {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
  reporter: { id: string; name: string; email: string };
}

export default function AdminReportsPage() {
  const { user } = useAuth();
  const [reports, setReports]   = useState<Report[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [statusFilter, setStatusFilter] = useState("OPEN");
  const [confirm, setConfirm]   = useState<{ action: "resolve" | "dismiss"; report: Report } | null>(null);
  const [actioning, setActioning] = useState(false);

  const fetchReports = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const params = new URLSearchParams({ limit: "100" });
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/reports?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports);
        setTotal(data.total);
      }
    } finally {
      setLoading(false);
    }
  }, [user, statusFilter]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const doAction = async () => {
    if (!confirm || !user) return;
    setActioning(true);
    try {
      const token = await user.getIdToken();
      await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: confirm.report.id, action: confirm.action }),
      });
      await fetchReports();
    } finally {
      setActioning(false);
      setConfirm(null);
    }
  };

  const typeColor: Record<string, string> = {
    USER: "bg-blue-50 text-blue-700",
    GIG:  "bg-teal-50 text-teal-700",
    MESSAGE: "bg-purple-50 text-purple-700",
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Reports & Moderation</h1>
            <p className="text-sm text-slate-500 mt-0.5">{total} reports</p>
          </div>
          <button onClick={fetchReports} className="p-2 rounded-xl hover:bg-slate-100">
            <RefreshCw size={16} className={`text-slate-500 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Status tabs */}
        <div className="flex gap-2 mt-4">
          {["OPEN", "RESOLVED", "DISMISSED", ""].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                statusFilter === s
                  ? "bg-teal-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {s || "All"}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw size={24} className="animate-spin text-teal-500" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Flag size={40} className="mx-auto mb-3 opacity-40" />
            <p className="font-semibold">No reports found</p>
          </div>
        ) : (
          reports.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${typeColor[r.targetType] ?? "bg-slate-100 text-slate-600"}`}>
                      {r.targetType}
                    </span>
                    <StatusBadge status={r.status} />
                    <span className="text-xs text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-900 mb-1">{r.reason}</p>
                  {r.details && (
                    <p className="text-sm text-slate-500 mb-2">{r.details}</p>
                  )}
                  <p className="text-xs text-slate-400">
                    Reported by <span className="font-medium text-slate-600">{r.reporter?.name}</span>
                    {" · "} Target ID: <code className="bg-slate-100 px-1 rounded text-xs">{r.targetId}</code>
                  </p>
                </div>

                {r.status === "OPEN" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => setConfirm({ action: "resolve", report: r })}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 text-xs font-semibold transition-colors"
                    >
                      <CheckCircle size={13} /> Resolve
                    </button>
                    <button
                      onClick={() => setConfirm({ action: "dismiss", report: r })}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold transition-colors"
                    >
                      <XCircle size={13} /> Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.action === "resolve" ? "Resolve Report" : "Dismiss Report"}
        description={`Mark this report as ${confirm?.action === "resolve" ? "resolved" : "dismissed"}?`}
        confirmLabel={confirm?.action === "resolve" ? "Resolve" : "Dismiss"}
        danger={false}
        loading={actioning}
        onConfirm={doAction}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
