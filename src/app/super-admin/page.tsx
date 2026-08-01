import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Users, Briefcase, TrendingUp, CheckCircle2,
  Clock, Shield, ArrowRight, Server
} from "lucide-react";

export default async function SuperAdminDashboard() {
  const [totalUsers, totalGigs, pendingGigs, activeGigs, totalOrders, totalSellers, totalAdmins] =
    await Promise.all([
      prisma.user.count(),
      prisma.gig.count(),
      prisma.gig.count({ where: { status: { equals: "PENDING" as any } } }),
      prisma.gig.count({ where: { status: { equals: "ACTIVE" as any } } }),
      prisma.order.count(),
      prisma.user.count({ where: { role: { equals: "SELLER" as any } } }),
      prisma.user.count({ where: { role: { in: ["ADMIN", "SUPER_ADMIN"] as any } } }),
    ]);

  const recentAdmins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] as any } },
    take: 5,
    orderBy: { createdAt: "desc" },
    select: { name: true, email: true, role: true, createdAt: true },
  });

  const STATS = [
    { label: "Total Users", value: totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Sellers", value: totalSellers, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Total Gigs", value: totalGigs, icon: Briefcase, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Active Gigs", value: activeGigs, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
    { label: "Pending Approval", value: pendingGigs, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Total Admins", value: totalAdmins, icon: Shield, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Super Admin Dashboard</h1>
          <p className="text-slate-500 font-medium mt-1">Platform overview and high-level health metrics.</p>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
            <Server size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">System Health</h3>
            <p className="text-sm text-slate-500">All systems operational</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-emerald-100 text-emerald-700 font-bold rounded-full text-sm flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          ONLINE
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {STATS.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-slate-500 mb-1">{stat.label}</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value.toLocaleString()}</h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} strokeWidth={2.5} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Admins */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Recently Added Admins</h3>
              <p className="text-sm text-slate-500 font-medium mt-0.5">Staff members joined recently</p>
            </div>
            <Link href="/super-admin/admins" className="text-teal-600 hover:text-teal-700 font-bold text-sm flex items-center gap-1 group">
              Manage
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentAdmins.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No admins found.</div>
            ) : (
              recentAdmins.map((admin, i) => (
                <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                      {admin.name?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{admin.name || "Unknown"}</h4>
                      <p className="text-sm text-slate-500">{admin.email}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${admin.role === 'SUPER_ADMIN' ? 'bg-rose-100 text-rose-700' : 'bg-teal-100 text-teal-700'}`}>
                    {admin.role}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
