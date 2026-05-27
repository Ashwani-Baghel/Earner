import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Users, Briefcase, TrendingUp, CheckCircle2,
  Clock, ShieldCheck, BarChart3, ArrowRight,
} from "lucide-react";

export default async function AdminDashboard() {
  const [totalUsers, totalGigs, pendingGigs, activeGigs, totalOrders, totalSellers] =
    await Promise.all([
      prisma.user.count(),
      prisma.gig.count(),
      prisma.gig.count({ where: { status: { equals: "PENDING" as any } } }),
      prisma.gig.count({ where: { status: { equals: "ACTIVE" as any } } }),
      prisma.order.count(),
      prisma.user.count({ where: { role: { equals: "SELLER" as any } } }),
    ]);

  const recentGigs = await prisma.gig.findMany({
    where: { status: { equals: "PENDING" as any } },
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      seller: { select: { name: true, email: true, avatar: true } },
      category: { select: { name: true } },
    },
  });

  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const metrics = [
    {
      label: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
      change: "+12% this month",
      positive: true,
    },
    {
      label: "Total Gigs",
      value: totalGigs,
      icon: Briefcase,
      color: "bg-teal-50 text-teal-600",
      change: `${activeGigs} active`,
      positive: true,
    },
    {
      label: "Pending Review",
      value: pendingGigs,
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
      change: "Needs attention",
      positive: pendingGigs === 0,
    },
    {
      label: "Total Orders",
      value: totalOrders,
      icon: TrendingUp,
      color: "bg-purple-50 text-purple-600",
      change: "All time",
      positive: true,
    },
    {
      label: "Active Sellers",
      value: totalSellers,
      icon: ShieldCheck,
      color: "bg-green-50 text-green-600",
      change: `of ${totalUsers} users`,
      positive: true,
    },
    {
      label: "Approval Rate",
      value: totalGigs > 0 ? `${Math.round((activeGigs / totalGigs) * 100)}%` : "—",
      icon: BarChart3,
      color: "bg-indigo-50 text-indigo-600",
      change: "Gig approval rate",
      positive: true,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-sm text-slate-500 mt-1">
          Welcome back! Here's what's happening on Earner.
        </p>
      </div>

      <div className="p-6 lg:p-8 space-y-8">

        {/* ── Metric Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {metrics.map(({ label, value, icon: Icon, color, change, positive }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon size={20} />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
              <p className="text-sm font-semibold text-slate-500">{label}</p>
              <p className={`text-xs mt-2 font-medium ${positive ? "text-teal-600" : "text-amber-600"}`}>
                {change}
              </p>
            </div>
          ))}
        </div>

        {/* ── Two Columns: Pending Gigs + Recent Users ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Pending Gigs */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Clock size={17} className="text-amber-600" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-sm">Pending Gig Reviews</h2>
                  <p className="text-xs text-slate-500">{pendingGigs} awaiting approval</p>
                </div>
              </div>
              <Link
                href="/admin/gigs"
                className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
              >
                View all <ArrowRight size={13} />
              </Link>
            </div>

            <div className="divide-y divide-slate-50">
              {recentGigs.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <CheckCircle2 size={32} className="text-teal-400 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-700">All caught up!</p>
                  <p className="text-xs text-slate-400 mt-1">No gigs pending review.</p>
                </div>
              ) : (
                recentGigs.map((gig) => (
                  <div key={gig.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm flex-shrink-0">
                      {gig.seller?.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 truncate">{gig.title}</p>
                      <p className="text-xs text-slate-400 truncate">{gig.seller?.name} · {gig.category?.name}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 flex-shrink-0">
                      Pending
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Users size={17} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-sm">Recently Joined</h2>
                  <p className="text-xs text-slate-500">Latest registered users</p>
                </div>
              </div>
              <Link
                href="/admin/users"
                className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
              >
                View all <ArrowRight size={13} />
              </Link>
            </div>

            <div className="divide-y divide-slate-50">
              {recentUsers.map((u) => (
                <div key={u.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm flex-shrink-0">
                    {u.name?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate">{u.name}</p>
                    <p className="text-xs text-slate-400 truncate">{u.email}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                    String(u.role) === "SELLER"
                      ? "bg-teal-50 text-teal-700"
                      : String(u.role) === "ADMIN"
                      ? "bg-purple-50 text-purple-700"
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    {String(u.role)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Quick Action Cards ── */}
        <div>
          <h2 className="text-base font-bold text-slate-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/admin/gigs"
              className="group bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-amber-300 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
                <Clock size={18} className="text-amber-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Review Gigs</h3>
              <p className="text-sm text-slate-500 mb-4">
                {pendingGigs} gig{pendingGigs !== 1 ? "s" : ""} waiting for approval.
              </p>
              <span className="flex items-center gap-1 text-sm font-semibold text-amber-600 group-hover:gap-2 transition-all">
                Go to Gigs <ArrowRight size={14} />
              </span>
            </Link>

            <Link
              href="/admin/users"
              className="group bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                <Users size={18} className="text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Manage Users</h3>
              <p className="text-sm text-slate-500 mb-4">
                {totalUsers} registered users on the platform.
              </p>
              <span className="flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:gap-2 transition-all">
                Go to Users <ArrowRight size={14} />
              </span>
            </Link>

            <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-6 shadow-sm text-white">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                <BarChart3 size={18} className="text-white" />
              </div>
              <h3 className="font-bold mb-1">Platform Health</h3>
              <p className="text-sm text-teal-100 mb-4">
                {activeGigs} active gigs · {totalOrders} total orders
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
                <span className="text-sm font-semibold text-teal-100">All systems operational</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
