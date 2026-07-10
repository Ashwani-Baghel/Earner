"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Search, Bell, MessageSquare, ShoppingCart,
  ChevronDown, Globe, LogOut, User,
  BarChart2, Heart, Menu, X, ChevronLeft, ChevronRight
} from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { LoginModal } from "../auth/LoginModal";
import { RegisterModal } from "../auth/RegisterModal";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { useCart } from "../../context/CartContext";
import { useFavorites } from "../../context/FavoritesContext";
import { CategorySlider } from "./CategorySlider";
import { CATEGORIES } from "@/lib/mock-data/categories";

function LoginQueryListener({ setLoginOpen, user }: { setLoginOpen: (v: boolean) => void, user: any }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("login") === "true" && !user) {
      setLoginOpen(true);
    }
  }, [searchParams, user, setLoginOpen]);
  return null;
}

// Add global overflow-hidden style to body when mobile menu is open
function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (isLocked) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isLocked]);
}

export function Navbar() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const { unreadCount } = useNotification();
  const { totalItems } = useCart();
  const { favoriteIds } = useFavorites();
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const [query, setQuery] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileBusinessOpen, setMobileBusinessOpen] = useState(false);
  const [mobileGrowthOpen, setMobileGrowthOpen] = useState(false);
  const [selectedMobileCategory, setSelectedMobileCategory] = useState<string | null>(null);
  const [selectedMegaGroupTitle, setSelectedMegaGroupTitle] = useState<string | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useBodyScrollLock(mobileMenuOpen);

  const isSellerView = user?.role === "SELLER" && pathname.startsWith("/seller");
  const dashboardHref =
    user?.role === "SELLER"
      ? "/seller/dashboard"
      : user?.role === "BUYER"
      ? "/buyer/dashboard"
      : "/";

  const logoHref = !user
    ? "/"
    : user.role === "SELLER"
    ? "/seller/dashboard"
    : "/buyer/dashboard";

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleSwitchRole = async (newRole: "BUYER" | "SELLER") => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: newRole,
          name: user.displayName ?? "Anonymous",
          email: user.email ?? "",
          avatar: user.photoURL ?? null,
        }),
      });
      localStorage.setItem(`earner_role_${user.uid}`, newRole);
      if (newRole === "SELLER") {
        window.open("/seller/dashboard", "_blank");
      } else {
        window.location.href = "/buyer/dashboard";
      }
    } catch (err) {
      console.error("Failed to switch role", err);
    }
  };

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════
          HEADER — sticky wrapper that holds BOTH rows
      ═══════════════════════════════════════════════════════════ */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">

        {/* ── ROW 1: Logo · Search · User Actions ── */}
        <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center h-16 lg:h-[68px] gap-4 lg:gap-8">

            {/* Logo */}
            <div className="flex items-center shrink-0">
              <Link href={logoHref}>
                <span className="text-2xl lg:text-[28px] font-black tracking-tight text-slate-900">
                  Earner<span className="text-teal-600">.</span>
                </span>
              </Link>
            </div>

            {/* Center: Seller nav links OR Buyer search bar */}
            <div className="flex-1 flex items-center justify-start lg:justify-center min-w-0">
              {isSellerView ? (
                /* ── Seller centre nav ── */
                <nav className="hidden lg:flex items-center gap-7 text-[13px] font-semibold text-slate-600">
                  <Link
                    href="/seller/dashboard"
                    className="hover:text-teal-600 transition-colors"
                  >
                    Dashboard
                  </Link>

                  {/* My Business dropdown */}
                  <div className="relative group cursor-pointer py-5">
                    <span className="flex items-center gap-1 hover:text-teal-600 transition-colors">
                      My Business
                      <ChevronDown size={13} className="group-hover:rotate-180 transition-transform duration-200" />
                    </span>
                    <div className="absolute top-full left-0 bg-white border border-slate-200 shadow-xl rounded-xl py-2 w-52 hidden group-hover:block z-50 text-slate-800 font-medium text-[13px]">
                      <Link href="/seller/orders"   className="block px-4 py-2.5 hover:bg-slate-50 hover:text-teal-600 transition-colors">Manage Orders</Link>
                      <Link href="/seller/gigs"     className="block px-4 py-2.5 hover:bg-slate-50 hover:text-teal-600 transition-colors">My Gigs</Link>
                      <Link href="/seller/dashboard" className="block px-4 py-2.5 hover:bg-slate-50 hover:text-teal-600 transition-colors">Earnings</Link>
                    </div>
                  </div>

                  {/* Growth dropdown */}
                  <div className="relative group cursor-pointer py-5">
                    <span className="flex items-center gap-1 hover:text-teal-600 transition-colors">
                      Growth &amp; Analytics
                      <ChevronDown size={13} className="group-hover:rotate-180 transition-transform duration-200" />
                    </span>
                    <div className="absolute top-full left-0 bg-white border border-slate-200 shadow-xl rounded-xl py-2 w-52 hidden group-hover:block z-50 text-slate-800 font-medium text-[13px]">
                      <Link href="/seller/dashboard" className="block px-4 py-2.5 hover:bg-slate-50 hover:text-teal-600 transition-colors">Scale Your Business</Link>
                      <Link href="/seller/dashboard" className="block px-4 py-2.5 hover:bg-slate-50 hover:text-teal-600 transition-colors">Performance</Link>
                    </div>
                  </div>
                </nav>
              ) : (
                /* ── Buyer search bar ── */
                <form
                  onSubmit={handleSearch}
                  className="hidden md:flex w-full max-w-2xl border border-slate-300 rounded-full overflow-hidden bg-slate-50 hover:bg-white focus-within:bg-white focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-600/20 transition-all h-10 lg:h-[42px]"
                >
                  <div className="pl-4 flex items-center text-slate-400 flex-shrink-0">
                    <Search size={17} />
                  </div>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="What service are you looking for today?"
                    className="flex-1 px-3 text-sm text-slate-800 bg-transparent outline-none placeholder-slate-400 font-medium min-w-0"
                  />
                  <button
                    type="submit"
                    className="bg-teal-600 hover:bg-teal-700 transition-colors text-white font-semibold text-sm px-6 lg:px-8 flex-shrink-0 rounded-r-full"
                  >
                    Search
                  </button>
                </form>
              )}
            </div>

            {/* Right: icons + auth actions */}
            <div className="flex items-center shrink-0">
              <div className="hidden lg:flex items-center gap-5 text-[13px] font-semibold text-slate-600">

                {/* Country/Currency Selector (buyer only) */}
                {!isSellerView && (
                  <button className="flex items-center gap-1.5 hover:text-teal-600 transition-colors">
                    <Globe size={16} /> English - USD
                  </button>
                )}

                {/* Not logged in */}
                {!user ? (
                  <div className="flex items-center gap-4 border-l border-slate-200 pl-4">
                    <button onClick={() => setLoginOpen(true)} className="hover:text-teal-600 transition-colors">
                      Log In
                    </button>
                    <button
                      onClick={() => setRegisterOpen(true)}
                      className="bg-teal-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-teal-700 hover:shadow-md transition-all"
                    >
                      Sign Up
                    </button>
                  </div>
                ) : (
                  /* Logged in */
                  <div className="flex items-center gap-4 border-l border-slate-200 pl-4">
                    {/* Notifications */}
                    <button 
                      onClick={() => toast("Notifications will be integrated soon", { icon: "🔔" })}
                      className="text-slate-500 hover:text-teal-600 transition-colors"
                    >
                      <Bell size={20} />
                    </button>

                    {/* Cart */}
                    {!isSellerView && (
                      <Link href="/cart" className="relative text-slate-500 hover:text-teal-600 transition-colors">
                        <ShoppingCart size={20} />
                        {totalItems > 0 && (
                          <span className="absolute -top-1.5 -right-2 bg-[#1dbf73] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                            {totalItems > 99 ? "99+" : totalItems}
                          </span>
                        )}
                      </Link>
                    )}

                    {/* Messages */}
                    <Link href="/messages" className="relative text-slate-500 hover:text-teal-600 transition-colors">
                      <MessageSquare size={20} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </Link>

                    {/* Saved (buyer only) */}
                    {!isSellerView && (
                      <Link href="/wishlist" className="relative text-slate-500 hover:text-teal-600 transition-colors">
                        <Heart size={20} />
                        {favoriteIds.length > 0 && (
                          <span className="absolute -top-1.5 -right-2 bg-pink-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                            {favoriteIds.length > 99 ? "99+" : favoriteIds.length}
                          </span>
                        )}
                      </Link>
                    )}

                    {/* Role switch */}
                    {!isSellerView ? (
                      <button
                        onClick={() => handleSwitchRole("SELLER")}
                        className="font-semibold hover:text-teal-600 transition-colors"
                      >
                        Switch to Selling
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSwitchRole("BUYER")}
                        className="font-semibold hover:text-teal-600 transition-colors"
                      >
                        Switch to Buying
                      </button>
                    )}

                    {/* Avatar + dropdown */}
                    <div className="relative" ref={userMenuRef}>
                      <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="flex items-center ring-2 ring-transparent hover:ring-teal-100 rounded-full transition-all"
                      >
                        <Avatar
                          src={user.photoURL}
                          alt={user.displayName || "U"}
                          size="sm"
                          initials={user.displayName?.[0]}
                        />
                      </button>

                      {userMenuOpen && (
                        <div className="absolute right-0 top-full mt-3 w-64 bg-white border border-slate-200 shadow-2xl rounded-xl py-2 z-50">
                          {/* User info */}
                          <div className="px-5 py-3 border-b border-slate-100">
                            <p className="font-bold text-sm text-slate-900 truncate">{user.displayName}</p>
                            <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                          </div>

                          {/* Menu links */}
                          <div className="py-2">
                            <Link
                              href="/profile"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-teal-600 transition-colors"
                            >
                              <User size={15} /> Profile
                            </Link>
                             <Link
                              href={dashboardHref}
                              target={user?.role === "SELLER" ? "_blank" : undefined}
                              rel={user?.role === "SELLER" ? "noopener noreferrer" : undefined}
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-teal-600 transition-colors"
                            >
                              <BarChart2 size={15} /> Dashboard
                            </Link>
                            {user.role === "ADMIN" && (
                              <Link
                                href="/admin"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-teal-600 transition-colors"
                              >
                                <User size={15} /> Admin Panel
                              </Link>
                            )}
                          </div>

                          {/* Sign out */}
                          <div className="border-t border-slate-100 py-2">
                            <button
                              onClick={() => { signOut(); setUserMenuOpen(false); }}
                              className="w-full flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-red-500 transition-colors"
                            >
                              <LogOut size={15} /> Sign Out
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Icons (shown on top for small screens) */}
              {user && (
                <div className="flex lg:hidden items-center gap-4 mr-2">
                  <Link href="/messages" className="relative text-slate-500 hover:text-teal-600 transition-colors">
                    <MessageSquare size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </Link>

                  {!isSellerView && !isAdmin && (
                    <>
                      <Link href="/wishlist" className="relative text-slate-500 hover:text-teal-600 transition-colors">
                        <Heart size={20} />
                        {favoriteIds.length > 0 && (
                          <span className="absolute -top-1.5 -right-2 bg-pink-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                            {favoriteIds.length > 99 ? "99+" : favoriteIds.length}
                          </span>
                        )}
                      </Link>
                      <Link href="/cart" className="relative text-slate-500 hover:text-teal-600 transition-colors">
                        <ShoppingCart size={20} />
                        {totalItems > 0 && (
                          <span className="absolute -top-1.5 -right-2 bg-[#1dbf73] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                            {totalItems > 99 ? "99+" : totalItems}
                          </span>
                        )}
                      </Link>
                    </>
                  )}
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* ── Mobile search bar (below main row on small screens) ── */}
          {!isSellerView && (
            <div className="md:hidden pb-3">
              <form onSubmit={handleSearch} className="flex border border-slate-300 rounded-lg overflow-hidden bg-white h-10">
                <div className="pl-3 flex items-center text-slate-400">
                  <Search size={17} />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for services..."
                  className="flex-1 px-3 text-sm outline-none bg-transparent text-slate-800 placeholder-slate-400"
                />
                <button type="submit" className="bg-teal-600 px-4 flex items-center hover:bg-teal-700 transition-colors">
                  <Search size={15} className="text-white" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* ── ROW 2 (Buyer only): Category Slider — sits flush below Row 1 ── */}
        {!isSellerView && (
          <div className="hidden lg:block border-t border-slate-100 bg-white">
            <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
              <CategorySlider />
            </div>
          </div>
        )}

        {/* ── Mobile dropdown menu ── */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white py-4 px-6 space-y-1 max-h-[80vh] overflow-y-auto">
            {!user ? (
              <>
                <button
                  onClick={() => { setLoginOpen(true); setMobileMenuOpen(false); }}
                  className="block w-full text-left text-sm font-semibold text-slate-700 py-2.5"
                >
                  Log In
                </button>
                <button
                  onClick={() => { setRegisterOpen(true); setMobileMenuOpen(false); }}
                  className="block w-full text-left text-sm font-semibold text-teal-600 py-2.5"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 pb-3 mb-1 border-b border-slate-100">
                  <Avatar src={user.photoURL} alt={user.displayName || "U"} size="md" initials={user.displayName?.[0]} />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-900 truncate">{user.displayName}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
                {isSellerView ? (
                  <>
                    <Link href="/seller/dashboard" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-bold text-slate-800 py-3 hover:text-teal-600 border-b border-slate-50">Dashboard</Link>
                    
                    <div className="border-b border-slate-50">
                      <button 
                        onClick={() => setMobileBusinessOpen(!mobileBusinessOpen)}
                        className="flex items-center justify-between w-full text-left text-sm font-bold text-slate-800 py-3 hover:text-teal-600 transition-colors"
                      >
                        My Business <ChevronDown size={16} className={`text-slate-400 transition-transform ${mobileBusinessOpen ? "rotate-180" : ""}`} />
                      </button>
                      {mobileBusinessOpen && (
                        <div className="pl-4 pb-2 space-y-1">
                          <Link href="/seller/orders" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-slate-600 py-2 hover:text-teal-600">Manage Orders</Link>
                          <Link href="/seller/gigs" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-slate-600 py-2 hover:text-teal-600">My Gigs</Link>
                          <Link href="/seller/dashboard" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-slate-600 py-2 hover:text-teal-600">Earnings</Link>
                        </div>
                      )}
                    </div>

                    <div className="border-b border-slate-50">
                      <button 
                        onClick={() => setMobileGrowthOpen(!mobileGrowthOpen)}
                        className="flex items-center justify-between w-full text-left text-sm font-bold text-slate-800 py-3 hover:text-teal-600 transition-colors"
                      >
                        Growth & Analytics <ChevronDown size={16} className={`text-slate-400 transition-transform ${mobileGrowthOpen ? "rotate-180" : ""}`} />
                      </button>
                      {mobileGrowthOpen && (
                        <div className="pl-4 pb-2 space-y-1">
                          <Link href="/seller/dashboard" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-slate-600 py-2 hover:text-teal-600">Scale Your Business</Link>
                          <Link href="/seller/dashboard" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-slate-600 py-2 hover:text-teal-600">Performance</Link>
                        </div>
                      )}
                    </div>
                    
                    <Link href="/settings" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-bold text-slate-800 py-3 hover:text-teal-600">Settings</Link>
                  </>
                ) : (
                  [
                    { href: dashboardHref, label: "Dashboard" },
                    { href: "/orders",     label: "My Orders" },
                    { href: "/settings",   label: "Settings" },
                  ].map(({ href, label }) => (
                    <Link
                      key={label}
                      href={href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-sm font-bold text-slate-700 py-3 hover:text-teal-600 transition-colors border-b border-slate-50"
                    >
                      {label}
                    </Link>
                  ))
                )}
                <button
                  onClick={() => { signOut(); setMobileMenuOpen(false); }}
                  className="block w-full text-left text-sm font-medium text-red-500 py-2.5 mt-1 border-t border-slate-100 pt-3"
                >
                  Sign Out
                </button>
              </>
            )}
            
            {/* ── Mobile Categories (Buyer View Only) ── */}
            {!isSellerView && !isAdmin && (
              <div className="pt-4 mt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Categories</p>
                {CATEGORIES.map(cat => (
                  <div key={cat.id} className="border-b border-slate-50">
                    <button
                      onClick={() => {
                        setSelectedMobileCategory(selectedMobileCategory === cat.id ? null : cat.id);
                        setSelectedMegaGroupTitle(null);
                      }}
                      className="flex items-center justify-between w-full text-left text-sm font-bold text-slate-800 py-3 hover:text-teal-600 transition-colors"
                    >
                      <span className="flex items-center gap-2">{cat.icon} {cat.name}</span>
                      <ChevronDown size={16} className={`text-slate-400 transition-transform ${selectedMobileCategory === cat.id ? "rotate-180" : ""}`} />
                    </button>
                    {selectedMobileCategory === cat.id && (
                      <div className="pl-6 pb-2 space-y-1 border-l-2 border-slate-100 ml-2">
                        {cat.megaGroups && cat.megaGroups.length > 0 ? (
                          cat.megaGroups.map(group => (
                            <div key={group.title} className="py-1">
                              <button
                                onClick={() => setSelectedMegaGroupTitle(selectedMegaGroupTitle === group.title ? null : group.title)}
                                className="flex items-center justify-between w-full text-left text-xs font-bold text-slate-500 uppercase tracking-wider py-2 hover:text-teal-600 transition-colors"
                              >
                                {group.title}
                                <ChevronDown size={14} className={`text-slate-400 transition-transform ${selectedMegaGroupTitle === group.title ? "rotate-180" : ""}`} />
                              </button>
                              {selectedMegaGroupTitle === group.title && (
                                <div className="pl-4 pt-1 pb-2 space-y-1 border-l-2 border-slate-100 ml-1">
                                  {group.links.map(link => (
                                    <Link
                                      key={link.slug}
                                      href={`/search?category=${cat.name}&subcategory=${link.name}`}
                                      onClick={() => { setMobileMenuOpen(false); setSelectedMobileCategory(null); setSelectedMegaGroupTitle(null); }}
                                      className="flex items-center gap-2 text-sm font-medium text-slate-600 py-1.5 hover:text-teal-600 transition-all"
                                    >
                                      {link.name}
                                      {link.isNew && <span className="text-[9px] bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded font-bold uppercase">New</span>}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          cat.subcategories.map(sub => (
                            <Link
                              key={sub.id}
                              href={`/search?category=${cat.name}&subcategory=${sub.name}`}
                              onClick={() => { setMobileMenuOpen(false); setSelectedMobileCategory(null); }}
                              className="block text-sm font-medium text-slate-600 py-2 hover:text-teal-600 transition-all"
                            >
                              {sub.name}
                            </Link>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </header>

      {/* Modals */}
      <Suspense fallback={null}>
        <LoginQueryListener setLoginOpen={setLoginOpen} user={user} />
      </Suspense>
      <LoginModal    open={loginOpen}    onClose={() => setLoginOpen(false)}    onSwitchToRegister={() => { setLoginOpen(false); setRegisterOpen(true); }} />
      <RegisterModal open={registerOpen} onClose={() => setRegisterOpen(false)} onSwitchToLogin={() => { setRegisterOpen(false); setLoginOpen(true); }} />
    </>
  );
}
