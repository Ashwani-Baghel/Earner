"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, CheckCircle, XCircle, Package, RotateCcw, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const ORDERS = [
  { id: "ORD-001", gigId: "gig-1", title: "I will design a modern minimalist logo", seller: "Alex Rivera", sellerUsername: "designpro_alex", image: "https://picsum.photos/seed/logo1/100/80", price: 75, status: "active", tier: "Standard", dueDate: "Apr 5, 2026", deliveryTime: 3 },
  { id: "ORD-002", gigId: "gig-7", title: "I will write SEO-optimized blog posts", seller: "Maya Patel", sellerUsername: "copy_queen_maya", image: "https://picsum.photos/seed/writing1/100/80", price: 65, status: "delivered", tier: "Standard", dueDate: "Mar 30, 2026", deliveryTime: 3 },
  { id: "ORD-003", gigId: "gig-5", title: "I will create a cinematic promotional video", seller: "Kai Tanaka", sellerUsername: "videomaster_kai", image: "https://picsum.photos/seed/video1/100/80", price: 499, status: "completed", tier: "Premium", dueDate: "Mar 22, 2026", deliveryTime: 10 },
  { id: "ORD-004", gigId: "gig-9", title: "I will build a custom AI chatbot", seller: "Marco Bianchi", sellerUsername: "aidev_marco", image: "https://picsum.photos/seed/chatbot1/100/80", price: 499, status: "pending", tier: "Standard", dueDate: "Apr 13, 2026", deliveryTime: 10 },
  { id: "ORD-005", gigId: "gig-3", title: "I will build a Next.js web application", seller: "Sara Johnson", sellerUsername: "webdev_sara", image: "https://picsum.photos/seed/webdev1/100/80", price: 999, status: "active", tier: "Premium", dueDate: "Apr 24, 2026", deliveryTime: 21 },
];

const STATUS_CONFIG = {
  active: { icon: Clock, color: "text-teal-600", bg: "bg-[#e6f7ef] text-teal-600", label: "In Progress" },
  delivered: { icon: Package, color: "text-[#1052d2]", bg: "bg-[#e6f0ff] text-[#1052d2]", label: "Delivered" },
  completed: { icon: CheckCircle, color: "text-[#74767e]", bg: "bg-[#fafafa] text-[#74767e]", label: "Completed" },
  pending: { icon: AlertCircle, color: "text-[#f7a918]", bg: "bg-[#fff4e6] text-[#f7a918]", label: "Pending" },
  revision: { icon: RotateCcw, color: "text-purple-500", bg: "bg-purple-50 text-purple-600", label: "In Revision" },
  cancelled: { icon: XCircle, color: "text-red-500", bg: "bg-red-50 text-red-600", label: "Cancelled" },
};

type TabKey = "all" | "active" | "delivered" | "completed";

export default function OrdersPage() {
  const [tab, setTab] = useState<TabKey>("all");

  const filtered = tab === "all" ? ORDERS : ORDERS.filter((o) => o.status === tab);

  return (
    <div className="container-earner py-8">
      <h1 className="text-2xl font-bold text-[#404145] mb-2">My Orders</h1>
      <p className="text-sm text-[#74767e] mb-6">Track and manage your orders</p>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#e4e5e7] mb-6">
        {(["all", "active", "delivered", "completed"] as TabKey[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-all ${tab === t ? "border-teal-600 text-teal-600" : "border-transparent text-[#74767e] hover:text-[#404145]"}`}>
            {t}
            <span className="ml-1.5 text-xs">
              ({t === "all" ? ORDERS.length : ORDERS.filter((o) => o.status === t).length})
            </span>
          </button>
        ))}
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
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
            const cfg = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
            const Icon = cfg.icon;
            return (
              <div key={order.id} className="bg-white rounded-xl border border-[#e4e5e7] p-5 hover:shadow-sm transition-shadow">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Thumbnail */}
                  <Link href={`/gig/${order.gigId}`} className="flex-shrink-0 rounded-lg overflow-hidden w-24 h-16 bg-[#fafafa] relative">
                    <Image src={order.image} alt={order.title} fill className="object-cover" unoptimized />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <Link href={`/gig/${order.gigId}`} className="font-semibold text-sm text-[#404145] hover:text-[#1dbf73] transition-colors line-clamp-2">{order.title}</Link>
                        <p className="text-xs text-[#74767e] mt-0.5">
                          By <Link href={`/seller/${order.sellerUsername}`} className="hover:text-[#1dbf73]">{order.seller}</Link>
                          {" · "}{order.tier} Package
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${cfg.bg}`}>
                        <Icon size={12} /> {cfg.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-6 mt-3 flex-wrap">
                      <span className="text-sm font-bold text-[#404145]">{formatCurrency(order.price)}</span>
                      <span className="text-xs text-[#74767e] flex items-center gap-1"><Clock size={12} /> Due: {order.dueDate}</span>
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
  );
}
