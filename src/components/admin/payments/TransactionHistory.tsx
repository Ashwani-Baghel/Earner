"use client";

import { useState, useEffect } from "react";
import { Loader2, ArrowUpRight, ArrowDownRight, Briefcase, RefreshCcw } from "lucide-react";
import { auth } from "@/lib/firebase";
import { format } from "date-fns";

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      const token = await auth?.currentUser?.getIdToken();
      const res = await fetch("/api/admin/transactions", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setTransactions(data.transactions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "PAYMENT": return <ArrowDownRight className="text-blue-500" size={16} />;
      case "PAYOUT": return <ArrowUpRight className="text-teal-500" size={16} />;
      case "REFUND": return <RefreshCcw className="text-red-500" size={16} />;
      case "PLATFORM_FEE": return <Briefcase className="text-purple-500" size={16} />;
      default: return null;
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "PAYMENT": return "bg-blue-100 text-blue-800";
      case "PAYOUT": return "bg-teal-100 text-teal-800";
      case "REFUND": return "bg-red-100 text-red-800";
      case "PLATFORM_FEE": return "bg-purple-100 text-purple-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-teal-600" /></div>;

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <h3 className="font-semibold text-slate-800">Global Ledger</h3>
        <button onClick={fetchTransactions} className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
          <RefreshCcw size={12} /> Refresh
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="px-6 py-4">ID / Date</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  No transactions recorded yet.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <p className="font-mono text-xs text-slate-500">{tx.id}</p>
                    <p className="text-slate-900 mt-1">
                      {format(new Date(tx.createdAt), "MMM d, yyyy h:mm a")}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getTypeStyle(tx.type)}`}>
                      {getTypeIcon(tx.type)}
                      {tx.type.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {tx.user ? (
                      <div>
                        <p className="font-medium text-slate-900">{tx.user.name}</p>
                        <p className="text-xs text-slate-500">{tx.user.email}</p>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">System</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={tx.description || ""}>
                    {tx.description || "-"}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-900">
                    ${tx.amount.toFixed(2)}
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
