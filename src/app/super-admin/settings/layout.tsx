"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Sliders, Palette, Layout, Users, CreditCard, Bell, Shield, Server, HelpCircle, AlertCircle } from "lucide-react";

export const SETTINGS_GROUPS = [
  {
    title: "Core Setup",
    icon: Sliders,
    items: [
      { id: "general", label: "General Settings" },
      { id: "platform-configuration", label: "Platform Configuration" },
      { id: "localization", label: "Localization" }
    ]
  },
  {
    title: "Appearance & Content",
    icon: Palette,
    items: [
      { id: "website-cms", label: "Website CMS" },
      { id: "appearance-theme", label: "Appearance & Theme" },
      { id: "header-settings", label: "Header Settings" },
      { id: "footer-settings", label: "Footer Settings" },
      { id: "homepage-builder", label: "Homepage Builder" },
      { id: "blog-content", label: "Blog & Content Management" }
    ]
  },
  {
    title: "Marketplace",
    icon: Layout,
    items: [
      { id: "category-settings", label: "Category Settings" },
      { id: "gigs", label: "Gig Settings" },
      { id: "orders", label: "Order Settings" },
      { id: "coupons", label: "Coupons & Promotions" }
    ]
  },
  {
    title: "Users",
    icon: Users,
    items: [
      { id: "users", label: "User & Seller Settings" },
      { id: "role-permission", label: "Role & Permission Management" },
      { id: "admin-management", label: "Admin Management" }
    ]
  },
  {
    title: "Finances",
    icon: CreditCard,
    items: [
      { id: "payments", label: "Payment & Commission" },
      { id: "wallet-withdrawals", label: "Wallet & Withdrawals" }
    ]
  },
  {
    title: "Communications",
    icon: Bell,
    items: [
      { id: "email-settings", label: "Email Settings" },
      { id: "sms-settings", label: "SMS Settings" },
      { id: "push-notifications", label: "Push Notifications" }
    ]
  },
  {
    title: "System & Security",
    icon: Shield,
    items: [
      { id: "authentication", label: "Authentication & Security" },
      { id: "media-storage", label: "Media & Storage" },
      { id: "backup-maintenance", label: "Backup & Maintenance" }
    ]
  },
  {
    title: "Advanced",
    icon: Server,
    items: [
      { id: "system-logs", label: "System & Audit Logs" },
      { id: "developer-settings", label: "Developer Settings" },
      { id: "seo-marketing", label: "SEO & Marketing" },
      { id: "api-integrations", label: "API & Integrations" },
      { id: "reports-analytics", label: "Reports & Analytics" }
    ]
  },
  {
    title: "Support & Legal",
    icon: HelpCircle,
    items: [
      { id: "help-center", label: "Help Center & FAQs" },
      { id: "support-system", label: "Support System" },
      { id: "legal", label: "Legal Pages" }
    ]
  }
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-[calc(100vh-69px)] bg-slate-50 relative overflow-hidden flex-col md:flex-row">
      {/* Secondary Sidebar for Settings */}
      <aside className="w-full md:w-72 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col h-full overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings size={20} className="text-teal-600" />
            All Settings
          </h2>
          <p className="text-xs text-slate-500 mt-1">Manage platform configuration</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
          {SETTINGS_GROUPS.map((group, idx) => (
            <div key={idx}>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
                <group.icon size={14} /> {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map(item => {
                  const isActive = pathname === `/super-admin/settings/${item.id}`;
                  return (
                    <Link
                      key={item.id}
                      href={`/super-admin/settings/${item.id}`}
                      className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive 
                          ? "bg-teal-50 text-teal-700 font-semibold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-slate-50">
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto pb-24">
          {children}
        </div>
      </main>
    </div>
  );
}
