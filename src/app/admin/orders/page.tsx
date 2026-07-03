"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Search, RefreshCw, XCircle, RotateCcw } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

interface Order {
  id: string;
  packageTier: string;
  price: number;
  status: string;
  createdAt: string;
  buyer:  { id: string; name: string; email: string };
  seller: { id: string; name: string; email: string };
  gig:    { id: string; title: string };
}

const ORDER_STATUSES = ["", "PENDING", "ACTIVE", "DELIVERED", "COMPLETED", "CANCELLED", "REFUNDED", "REVISION"];

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders]     = useState<Order[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [q, setQ]               = useState("");
  const [status, setStatus]     = useState("");
  const [confirm, setConfirm]   = useState<{ action: string; order: Order } | null>(null);
  const [actioning, setActioning] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const params = new URLSearchParams({ limit: "100" });
      if (q)      params.set("q", q);
      if (status) params.set("status", status);
      const res = await fetch(`/api/admin/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
        setTotal(data.total);
      }
    } finally {
      setLoading(false);
    }
  }, [user, q, status]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const doAction = async () => {
    if (!confirm || !user) return;
    setActioning(true);
    try {
      const token = await user.getIdToken();
      await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: confirm.order.id, action: confirm.action }),
      });
      await fetchOrders();
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
            <h1 className="text-xl font-bold text-slate-900">Order Monitoring</h1>
            <p className="text-sm text-slate-500 mt-0.5">{total} total orders</p>
          </div>
          <button onClick={fetchOrders} className="p-2 rounded-xl hover:bg-slate-100">
            <RefreshCw size={16} className={`text-slate-500 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
        <div className="flex gap-3 mt-4 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search buyer, seller, or gig…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {ORDER_STATUSES.map((s) => (
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
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="font-semibold">No orders found</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {["Gig", "Buyer", "Seller", "Package", "Price", "Status", "Date", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 max-w-[160px]">
                      <p className="font-medium text-slate-900 truncate">{o.gig?.title}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-700">{o.buyer?.name}</p>
                      <p className="text-xs text-slate-400 truncate">{o.buyer?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-700">{o.seller?.name}</p>
                    </td>
                    <td className="px-4 py-3 capitalize text-slate-600">{o.packageTier}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">${o.price.toLocaleString()}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        {!["CANCELLED", "COMPLETED", "REFUNDED"].includes(o.status) && (
                          <button
                            onClick={() => setConfirm({ action: "cancel", order: o })}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold"
                          >
                            <XCircle size={11} /> Cancel
                          </button>
                        )}
                        {o.status === "COMPLETED" && (
                          <button
                            onClick={() => setConfirm({ action: "refund", order: o })}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-semibold"
                          >
                            <RotateCcw size={11} /> Refund
                          </button>
                        )}
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
        title={`${confirm?.action === "cancel" ? "Cancel" : "Refund"} Order`}
        description={`Are you sure you want to ${confirm?.action} the order for "${confirm?.order?.gig?.title}"?`}
        confirmLabel={confirm?.action === "cancel" ? "Cancel Order" : "Issue Refund"}
        danger
        loading={actioning}
        onConfirm={doAction}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
