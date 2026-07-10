"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard, Users, Briefcase, ShoppingBag,
  Flag, BarChart3, Loader2, ArrowLeft, ChevronRight,
  Shield, Search, Bell, Menu, CreditCard, Settings, X, LogOut, User
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
];

const SETTINGS_CATEGORIES = [
  { id: "general", label: "General" },
  { id: "authentication", label: "Authentication" },
  { id: "users", label: "Users" },
  { id: "gigs", label: "Gigs" },
  { id: "payments", label: "Payments" },
  { id: "notifications", label: "Notifications" },
  { id: "security", label: "Security" },
  { id: "legal", label: "Legal" },
  { id: "integrations", label: "Integrations" },
  { id: "system", label: "System" }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  // Auto-expand settings dropdown if we are inside settings
  useEffect(() => {
    if (pathname.startsWith("/admin/settings")) {
      setSettingsOpen(true);
    }
  }, [pathname]);

  useEffect(() => {
    if (isLoginPage) return;
    if (loading) return;
    if (!user) { router.push("/admin/login"); return; }
    const r = user.role ?? "";
    if (r === "ADMIN" || r === "SUPER_ADMIN") {
      setIsAdmin(true);
    } else {
      router.push("/admin/login");
    }
  }, [user, loading, router, isLoginPage]);

  if (isLoginPage) {
    return <>{children}</>;
  }

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
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">

      {/* ── Mobile Sidebar Overlay ── */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex-shrink-0 transition-transform duration-300 md:static md:translate-x-0
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>

        {/* Brand */}
        <div className="h-[69px] flex items-center justify-between px-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
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
          <button 
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={20} />
          </button>
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
                onClick={() => setMobileMenuOpen(false)}
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
              </Link>
            );
          })}
          
          {/* Settings Dropdown */}
          <div className="pt-2 mt-2 border-t border-slate-100">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                pathname.startsWith("/admin/settings")
                  ? "text-teal-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Settings
                size={17}
                className={pathname.startsWith("/admin/settings") ? "text-teal-600" : "text-slate-400 group-hover:text-slate-600"}
              />
              <span className="flex-1 text-left">Settings</span>
              <ChevronRight size={14} className={`transition-transform duration-200 ${settingsOpen ? "rotate-90 text-teal-600" : "text-slate-400"}`} />
            </button>
            
            {settingsOpen && (
              <div className="mt-1 ml-4 border-l-2 border-slate-100 pl-3 space-y-0.5 py-1">
                {SETTINGS_CATEGORIES.map(category => (
                  <Link
                    key={category.id}
                    href={`/admin/settings/${category.id}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === `/admin/settings/${category.id}`
                        ? "bg-teal-50 text-teal-700"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    {category.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 relative">
          <button 
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between"
          >
            <div className="min-w-0 pr-2">
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
            <ChevronRight size={16} className={`text-slate-400 transition-transform ${userMenuOpen ? "rotate-90" : ""}`} />
          </button>

          {userMenuOpen && (
            <div className="absolute bottom-full left-3 w-64 mb-2 bg-white border border-slate-200 shadow-xl rounded-xl py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">Admin Options</p>
              </div>
              <div className="py-1">
                <Link
                  href="/admin/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-teal-600 transition-colors"
                >
                  <Settings size={15} /> Settings
                </Link>
              </div>
              <div className="border-t border-slate-100 py-1">
                <button
                  onClick={() => { signOut(); setUserMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-red-500 transition-colors"
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        
        {/* ── Top Navbar ── */}
        <header className="h-[69px] bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 flex-shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
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
