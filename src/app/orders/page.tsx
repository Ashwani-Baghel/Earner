"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, CheckCircle, XCircle, Package, RotateCcw, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Loader2, Trash2 } from "lucide-react";

const STATUS_CONFIG = {
  active: { icon: Clock, color: "text-teal-600", bg: "bg-[#e6f7ef] text-teal-600", label: "In Progress" },
  delivered: { icon: Package, color: "text-[#1052d2]", bg: "bg-[#e6f0ff] text-[#1052d2]", label: "Delivered" },
  completed: { icon: CheckCircle, color: "text-[#74767e]", bg: "bg-[#fafafa] text-[#74767e]", label: "Completed" },
  pending: { icon: AlertCircle, color: "text-[#f7a918]", bg: "bg-[#fff4e6] text-[#f7a918]", label: "Pending" },
  revision: { icon: RotateCcw, color: "text-purple-500", bg: "bg-purple-50 text-purple-600", label: "In Revision" },
  cancelled: { icon: XCircle, color: "text-red-500", bg: "bg-red-50 text-red-600", label: "Cancelled" },
};

type TabKey = "all" | "active" | "delivered" | "completed" | "cancelled";

function OrderCancelAction({ order, handleCancelOrder, cancellingId }: { order: any, handleCancelOrder: (id: string) => void, cancellingId: string | null }) {
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [canCancel, setCanCancel] = useState(false);

  useEffect(() => {
    if (order.status !== "PENDING" && order.status !== "ACTIVE") {
      setCanCancel(false);
      return;
    }

    const calculate = () => {
      const created = new Date(order.createdAt).getTime();
      const now = new Date().getTime();
      const diff = (3 * 60 * 60 * 1000) - (now - created);
      
      if (diff <= 0) {
        setCanCancel(false);
        setTimeLeft(null);
      } else {
        setCanCancel(true);
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
      }
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [order]);

  if (!canCancel) return null;

  return (
    <div className="flex items-center gap-3">
      {timeLeft && (
        <span className="text-xs font-medium text-orange-500 hidden sm:inline-block animate-pulse">
          Cancel eligible: {timeLeft}
        </span>
      )}
      <button
        onClick={() => handleCancelOrder(order.id)}
        disabled={cancellingId === order.id}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
      >
        {cancellingId === order.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
        Cancel Order
      </button>
    </div>
  );
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("all");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/orders?role=buyer", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [user]);

  const handleCancelOrder = async (orderId: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to cancel this order? This action cannot be undone.")) return;
    
    setCancellingId(orderId);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "CANCELLED" } : o));
      } else {
        const error = await res.json();
        alert(error.error || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Cancel order error:", error);
      alert("Failed to cancel order");
    } finally {
      setCancellingId(null);
    }
  };

  const filtered = tab === "all" ? orders : orders.filter((o) => o.status.toLowerCase() === tab);

  return (
    <div className="container-earner py-8">
      <h1 className="text-2xl font-bold text-[#404145] mb-2">My Orders</h1>
      <p className="text-sm text-[#74767e] mb-6">Track and manage your orders</p>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#e4e5e7] mb-6 overflow-x-auto pb-1">
        {(["all", "active", "delivered", "completed", "cancelled"] as TabKey[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-all whitespace-nowrap ${tab === t ? "border-teal-600 text-teal-600" : "border-transparent text-[#74767e] hover:text-[#404145]"}`}>
            {t}
            <span className="ml-1.5 text-xs">
              ({t === "all" ? orders.length : orders.filter((o) => o.status.toLowerCase() === t).length})
            </span>
          </button>
        ))}
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-teal-600" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Package size={48} className="text-[#b5b6ba] mx-auto mb-4" />
          <p className="font-semibold text-[#404145]">No orders yet</p>
          <p className="text-sm text-[#74767e] mt-1">Browse services and place your first order</p>
          <Link href="/" className="mt-4 inline-block px-6 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors">
            Browse Services
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const cfg = STATUS_CONFIG[order.status.toLowerCase() as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
            const Icon = cfg.icon;
            
            return (
              <div key={order.id} className="bg-white rounded-xl border border-[#e4e5e7] p-5 hover:shadow-sm transition-shadow">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Thumbnail */}
                  <Link href={`/gig/${order.gigId}`} className="flex-shrink-0 rounded-lg overflow-hidden w-24 h-16 bg-[#fafafa] relative block">
                    <Image src={order.gig.images?.[0] || "https://picsum.photos/seed/logo1/100/80"} alt={order.gig.title} fill className="object-cover" unoptimized />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <Link href={`/gig/${order.gigId}`} className="font-semibold text-sm text-[#404145] hover:text-[#1dbf73] transition-colors line-clamp-2">{order.gig.title}</Link>
                        <p className="text-xs text-[#74767e] mt-0.5">
                          By <Link href={`/seller/${order.seller.id}`} className="hover:text-[#1dbf73]">{order.seller.displayName || order.seller.name}</Link>
                          {" · "}{order.packageTier} Package
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${cfg.bg}`}>
                        <Icon size={12} /> {cfg.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-3 flex-wrap gap-4">
                      <div className="flex items-center gap-6 flex-wrap">
                        <span className="text-sm font-bold text-[#404145]">{formatCurrency(order.price)}</span>
                        <span className="text-xs text-[#74767e] flex items-center gap-1"><Clock size={12} /> Due: {format(new Date(order.dueDate), "MMM d, yyyy")}</span>
                        <span className="text-xs text-[#74767e]">Order #{order.id}</span>
                      </div>
                      <OrderCancelAction 
                        order={order} 
                        handleCancelOrder={handleCancelOrder} 
                        cancellingId={cancellingId} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
