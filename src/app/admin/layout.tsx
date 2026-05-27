"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard, Users, Briefcase, ShoppingBag,
  Flag, BarChart3, Loader2, ArrowLeft, ChevronRight,
  Shield, Search, Bell, Menu, CreditCard, Settings,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

const NAV = [
  { href: "/admin",            label: "Dashboard",     icon: LayoutDashboard },
  { href: "/admin/gigs",       label: "Gig Moderation", icon: Briefcase       },
  { href: "/admin/users",      label: "Users",          icon: Users           },
  { href: "/admin/orders",     label: "Orders",         icon: ShoppingBag     },
  { href: "/admin/payments",   label: "Payments",       icon: CreditCard      },
  { href: "/admin/reports",    label: "Reports",        icon: Flag            },
  { href: "/admin/analytics",  label: "Analytics",      icon: BarChart3       },
  { href: "/admin/settings",   label: "Settings",       icon: Settings        },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/"); return; }
    const r = user.role ?? "";
    if (r === "ADMIN" || r === "SUPER_ADMIN") {
      setIsAdmin(true);
    } else {
      router.push("/");
    }
  }, [user, loading, router]);

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-teal-600" size={36} />
          <p className="text-sm text-slate-500 font-medium">Verifying admin access…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-slate-200 flex-shrink-0">

        {/* Brand */}
        <div className="h-[69px] flex items-center gap-3 px-6 border-b border-slate-200">
          <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center flex-shrink-0">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-slate-900">
              Admin<span className="text-teal-600">.</span>
            </span>
            {user?.role === "SUPER_ADMIN" && (
              <p className="text-[10px] text-purple-600 font-bold leading-none mt-0.5">SUPER ADMIN</p>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const exact   = href === "/admin";
            const isActive = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                  isActive
                    ? "bg-teal-50 text-teal-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon
                  size={17}
                  className={isActive ? "text-teal-600" : "text-slate-400 group-hover:text-slate-600"}
                />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight size={14} className="text-teal-400" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 space-y-1">
          <div className="px-4 py-3 rounded-xl bg-slate-50">
            <p className="text-xs font-bold text-slate-800 truncate">{user?.displayName}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            <span className={`inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full ${
              user?.role === "SUPER_ADMIN"
                ? "bg-purple-100 text-purple-700"
                : "bg-teal-100 text-teal-700"
            }`}>
              {user?.role}
            </span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Site
          </Link>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        
        {/* ── Top Navbar ── */}
        <header className="h-[69px] bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 flex-shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <Menu size={20} />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search admin panel..."
                className="pl-9 pr-4 py-2 w-64 bg-slate-100 border-transparent rounded-lg text-sm focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-5">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            
            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-700 leading-none">{user?.displayName || "Admin"}</p>
                <p className="text-[11px] text-teal-600 font-semibold mt-1">{user?.role}</p>
              </div>
              <Avatar src={user?.photoURL} alt="Admin" size="sm" />
            </div>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
