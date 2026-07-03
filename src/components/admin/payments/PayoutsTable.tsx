"use client";

import { useState, useEffect } from "react";
import { Loader2, DollarSign, CheckCircle2 } from "lucide-react";
import { auth } from "@/lib/firebase";

export function PayoutsTable() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPayouts = async () => {
    try {
      const token = await auth?.currentUser?.getIdToken();
      const res = await fetch("/api/admin/payouts", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setSellers(data.sellers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const handlePayout = async (sellerId: string, amount: number) => {
    if (!confirm(`Are you sure you want to process a payout of $${amount.toFixed(2)}?\nNote: A 5% platform fee will be deducted from this amount.`)) return;

    setProcessingId(sellerId);
    try {
      const token = await auth?.currentUser?.getIdToken();
      const res = await fetch("/api/admin/payouts", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ sellerId, amount })
      });
      
      if (!res.ok) throw new Error("Failed to process payout");
      alert("Payout processed successfully!");
      fetchPayouts();
    } catch (err: any) {
      alert(err.message || "Error processing payout");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-teal-600" /></div>;

  if (sellers.length === 0) {
    return (
      <div className="text-center py-12 border border-slate-200 rounded-lg bg-slate-50">
        <CheckCircle2 className="mx-auto h-12 w-12 text-slate-300 mb-3" />
        <h3 className="text-sm font-medium text-slate-900">All caught up</h3>
        <p className="text-sm text-slate-500 mt-1">There are no sellers awaiting payouts.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
          <tr>
            <th className="px-6 py-4">Seller Name</th>
            <th className="px-6 py-4">Email</th>
            <th className="px-6 py-4">Available Earnings</th>
            <th className="px-6 py-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {sellers.map((seller) => (
            <tr key={seller.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 font-medium text-slate-900">{seller.user.name}</td>
              <td className="px-6 py-4 text-slate-500">{seller.user.email}</td>
              <td className="px-6 py-4 text-teal-600 font-bold">${seller.earnings.toFixed(2)}</td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => handlePayout(seller.id, seller.earnings)}
                  disabled={processingId === seller.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold disabled:opacity-50 transition-colors"
                >
                  {processingId === seller.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <DollarSign size={14} />
                  )}
                  Pay Out
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
