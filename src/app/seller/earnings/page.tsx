"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2, DollarSign, Clock, XCircle, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: string | number; icon: any; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-500 mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

export default function SellerEarningsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [fetching, setFetching] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/"); return; }
    if (user.hasRole && user.role === "BUYER") { router.push("/buyer/dashboard"); return; }
    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") { router.push("/admin"); return; }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !user.hasRole || user.role !== "SELLER") return;

    const fetchData = async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/orders?role=seller", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (err) {
        console.error("Failed to fetch earnings data:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading || fetching) return (
    <div className="flex items-center justify-center min-h-[100vh]">
      <Loader2 className="animate-spin text-teal-600" size={36} />
    </div>
  );

  // Calculate stats
  const completedOrders = orders.filter(o => o.status === "COMPLETED");
  const pendingOrders = orders.filter(o => ["ACTIVE", "PENDING", "REVISION", "DELIVERED"].includes(o.status));
  const cancelledOrders = orders.filter(o => ["CANCELLED", "REFUNDED", "REJECTED"].includes(o.status));

  const totalEarnings = completedOrders.reduce((sum, o) => sum + Number(o.price), 0);
  const pendingClearance = pendingOrders.reduce((sum, o) => sum + Number(o.price), 0);
  const cancelledRevenue = cancelledOrders.reduce((sum, o) => sum + Number(o.price), 0);

  // Sort orders by most recent for the transactions list
  const recentTransactions = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="bg-[#f7f7f7] min-h-screen pb-20">
      <div className="max-w-6xl mx-auto pt-8 px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Earnings</h1>
          <p className="text-sm text-[#74767e]">Track your revenue, pending clearance, and transaction history.</p>
        </div>

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            label="Net Income" 
            value={formatCurrency(totalEarnings)} 
            icon={DollarSign} 
            color="bg-teal-50 text-teal-600" 
          />
          <StatCard 
            label="Pending Clearance" 
            value={formatCurrency(pendingClearance)} 
            icon={Clock} 
            color="bg-amber-50 text-amber-600" 
          />
          <StatCard 
            label="Cancelled Revenue" 
            value={formatCurrency(cancelledRevenue)} 
            icon={XCircle} 
            color="bg-red-50 text-red-600" 
          />
        </div>

        {/* ── Transactions List ── */}
        <div className="premium-card p-0 overflow-hidden shadow-sm">
          <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <TrendingUp size={20} className="text-teal-600" />
              Transaction History
            </h2>
          </div>

          {recentTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold whitespace-nowrap">
                    <th className="px-8 py-4">Date</th>
                    <th className="px-6 py-4">For</th>
                    <th className="px-6 py-4">Order Status</th>
                    <th className="px-8 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentTransactions.map((order) => {
                    const isCompleted = order.status === "COMPLETED";
                    const isCancelled = ["CANCELLED", "REFUNDED", "REJECTED"].includes(order.status);
                    const isPending = !isCompleted && !isCancelled;

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5 text-sm text-slate-600 whitespace-nowrap">
                          <div className="font-medium text-slate-900">{format(new Date(order.createdAt), 'MMM d, yyyy')}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{format(new Date(order.createdAt), 'h:mm a')}</div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm font-bold text-slate-900 line-clamp-1">{order.gig.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Order #{order.id.slice(0, 8)}...</p>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            isCompleted ? 'bg-teal-50 text-teal-700' :
                            isPending ? 'bg-amber-50 text-amber-700' :
                            'bg-red-50 text-red-700'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className={`px-8 py-5 text-right font-bold text-sm ${isCancelled ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                          {isPending ? <span className="text-amber-600 mr-2 text-xs font-normal">(Pending)</span> : null}
                          {isCompleted ? <span className="text-teal-600 mr-2 text-xs font-normal">+</span> : null}
                          {formatCurrency(order.price)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
               <DollarSign size={48} className="text-[#b5b6ba] mx-auto mb-4" />
               <h2 className="text-xl font-bold text-[#404145] mb-2">No Transactions Yet</h2>
               <p className="text-sm text-[#74767e]">Once you receive and complete orders, your earnings will appear here.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
