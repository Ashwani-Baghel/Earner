"use client";

import { useState, useEffect } from "react";
import { Loader2, RefreshCcw, AlertTriangle } from "lucide-react";
import { auth } from "@/lib/firebase";

export function RefundsManager() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const token = await auth?.currentUser?.getIdToken();
      const res = await fetch("/api/admin/refunds", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleRefund = async (order: any) => {
    if (!confirm(`Are you sure you want to refund order ${order.id} for $${order.price.toFixed(2)}?\nThis cannot be undone.`)) return;

    setProcessingId(order.id);
    try {
      const token = await auth?.currentUser?.getIdToken();
      const res = await fetch("/api/admin/refunds", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ orderId: order.id })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process refund");
      
      alert("Refund processed successfully!");
      fetchOrders();
    } catch (err: any) {
      alert(err.message || "Error processing refund");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-teal-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 text-amber-800">
        <AlertTriangle className="shrink-0 mt-0.5" size={18} />
        <div className="text-sm">
          <p className="font-semibold mb-1">Refund Policy</p>
          <p>Only Active or Pending orders can be refunded. Completed orders are not eligible for refunds. Refunding an order will return the funds to the buyer and cancel the project for the seller.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="px-6 py-4">Order details</th>
              <th className="px-6 py-4">Buyer</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  No active or pending orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{order.gig.title}</p>
                    <p className="text-xs text-slate-500 mt-1 font-mono">{order.id}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <p className="font-medium">{order.buyer.name}</p>
                    <p className="text-xs text-slate-400">{order.buyer.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">${order.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleRefund(order)}
                      disabled={processingId === order.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-md text-xs font-semibold disabled:opacity-50 transition-colors"
                    >
                      {processingId === order.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <RefreshCcw size={14} />
                      )}
                      Issue Refund
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
