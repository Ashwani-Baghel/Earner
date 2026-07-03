"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, CheckCircle, XCircle, Package, RotateCcw, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

const STATUS_CONFIG = {
  active: { icon: Clock, color: "text-teal-600", bg: "bg-[#e6f7ef] text-teal-600", label: "In Progress" },
  delivered: { icon: Package, color: "text-[#1052d2]", bg: "bg-[#e6f0ff] text-[#1052d2]", label: "Delivered" },
  completed: { icon: CheckCircle, color: "text-[#74767e]", bg: "bg-[#fafafa] text-[#74767e]", label: "Completed" },
  pending: { icon: AlertCircle, color: "text-[#f7a918]", bg: "bg-[#fff4e6] text-[#f7a918]", label: "Pending Requirements" },
  revision: { icon: RotateCcw, color: "text-purple-500", bg: "bg-purple-50 text-purple-600", label: "In Revision" },
  cancelled: { icon: XCircle, color: "text-red-500", bg: "bg-red-50 text-red-600", label: "Cancelled" },
};

type TabKey = "all" | "active" | "delivered" | "completed";

export default function SellerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [tab, setTab] = useState<TabKey>("active");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/orders?role=seller", {
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

  const filtered = tab === "all" ? orders : orders.filter((o) => o.status.toLowerCase() === tab);

  return (
    <div className="bg-[#f7f7f7] min-h-screen pb-20">
      <div className="max-w-6xl mx-auto pt-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Manage Orders</h1>
        <p className="text-sm text-[#74767e] mb-8">View and fulfill your active orders</p>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[#e4e5e7] mb-8">
          {(["active", "delivered", "completed", "all"] as TabKey[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-bold capitalize border-b-[3px] transition-all ${tab === t ? "border-teal-600 text-slate-900" : "border-transparent text-[#74767e] hover:text-[#404145]"}`}>
              {t}
              <span className="ml-1.5 text-xs text-[#74767e] font-normal bg-[#e4e5e7]/50 px-2 py-0.5 rounded-full">
                {t === "all" ? orders.length : orders.filter((o) => o.status.toLowerCase() === t).length}
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
          <div className="premium-card p-12 text-center">
            <Package size={48} className="text-[#b5b6ba] mx-auto mb-4" />
            <p className="font-semibold text-[#404145]">No orders found</p>
            <p className="text-sm text-[#74767e] mt-1">You don't have any {tab !== "all" ? tab : ""} orders right now.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => {
              const cfg = STATUS_CONFIG[order.status.toLowerCase() as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
              const Icon = cfg.icon;
              return (
                <div key={order.id} className="premium-card p-5">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Thumbnail */}
                    <div className="flex-shrink-0 rounded-lg overflow-hidden w-24 h-16 bg-[#fafafa] relative">
                      <Image src={order.gig.images?.[0] || "https://picsum.photos/seed/logo1/100/80"} alt={order.gig.title} fill className="object-cover" unoptimized />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <p className="font-semibold text-sm text-[#404145] line-clamp-2">{order.gig.title}</p>
                          <p className="text-xs text-[#74767e] mt-1">
                            For <span className="font-medium text-[#404145]">{order.buyer.displayName || order.buyer.name}</span>
                            {" · "}{order.packageTier} Package
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${cfg.bg}`}>
                          <Icon size={12} /> {cfg.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-6 mt-4 flex-wrap">
                        <span className="text-sm font-bold text-[#222325]">{formatCurrency(order.price)}</span>
                        <span className="text-xs font-semibold text-[#74767e] flex items-center gap-1.5"><Clock size={14} className="text-[#1dbf73]" /> Due: {format(new Date(order.dueDate), "MMM d, yyyy")}</span>
                        <span className="text-xs text-[#74767e]">Order #{order.id}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
