"use client";

import { use } from "react";
import { usePathname } from "next/navigation";
import { SettingsPageTemplate } from "@/components/admin/settings/SettingsPageTemplate";

// Map of slug to Page Details
const SETTING_PAGES_DATA: Record<string, { title: string, description: string, subPoints: string[] }> = {
  "platform-configuration": {
    title: "Platform Configuration",
    description: "Manage global platform operational modes and strict constraints.",
    subPoints: ["Maintenance Mode", "Debug Mode", "Max Upload Sizes", "Allowed File Types", "API Rate Limiting"]
  },
  "localization": {
    title: "Localization",
    description: "Language, Currency, and Timezone settings.",
    subPoints: ["Default Language", "Supported Languages", "Default Currency", "Supported Currencies", "System Timezone"]
  },
  "website-cms": {
    title: "Website CMS",
    description: "Global Content Management settings for static pages.",
    subPoints: ["About Us Page", "Terms & Conditions", "Privacy Policy", "Contact Us Structure"]
  },
  "appearance-theme": {
    title: "Appearance & Theme",
    description: "Customize the platform's visual identity.",
    subPoints: ["Primary Colors", "Brand Logos", "Typography & Fonts", "Dark Mode Settings"]
  },
  "header-settings": {
    title: "Header Settings",
    description: "Manage top navigation bar items.",
    subPoints: ["Top Bar Notice", "Navigation Links", "Search Bar Behavior"]
  },
  "footer-settings": {
    title: "Footer Settings",
    description: "Manage footer sections and social links.",
    subPoints: ["Footer Columns", "Social Media Icons", "Copyright Text", "Newsletter Widget"]
  },
  "homepage-builder": {
    title: "Homepage Builder",
    description: "Configure homepage sections order and visibility.",
    subPoints: ["Hero Section", "Featured Categories", "Top Rated Freelancers", "Testimonials"]
  },
  "blog-content": {
    title: "Blog & Content Management",
    description: "Manage blog posts and articles.",
    subPoints: ["Enable/Disable Blog", "Comments Moderation", "Author Profiles", "Blog Categories"]
  },
  "category-settings": {
    title: "Category Settings",
    description: "Configure rules for categories and subcategories.",
    subPoints: ["Max Categories per Gig", "Category Icons", "Custom Attributes per Category"]
  },
  "orders": {
    title: "Order Settings",
    description: "Configure how orders behave in the marketplace.",
    subPoints: ["Auto-Complete Duration", "Cancellation Policies", "Dispute Resolution Time", "Revisions Limit"]
  },
  "coupons": {
    title: "Coupons & Promotions",
    description: "Manage discount codes and promotional campaigns.",
    subPoints: ["Create Promo Code", "First-Time User Discount", "Seasonal Sales", "Referral Bonuses"]
  },
  "role-permission": {
    title: "Role & Permission Management",
    description: "Configure granular access control.",
    subPoints: ["Define Custom Roles", "Assign Permissions", "Role Hierarchy"]
  },
  "admin-management": {
    title: "Admin Management",
    description: "Manage admin users and their access.",
    subPoints: ["Invite New Admin", "Revoke Access", "Admin Activity Log"]
  },
  "wallet-withdrawals": {
    title: "Wallet & Withdrawals",
    description: "Manage seller wallets and payout rules.",
    subPoints: ["Minimum Withdrawal Amount", "Payout Methods", "Clearance Period", "Auto-Payouts"]
  },
  "email-settings": {
    title: "Email Settings",
    description: "Configure SMTP and email templates.",
    subPoints: ["SMTP Configuration", "Welcome Email Template", "Order Notification Emails", "Password Reset Email"]
  },
  "sms-settings": {
    title: "SMS Settings",
    description: "Configure SMS gateways.",
    subPoints: ["Twilio/Gateway API Keys", "OTP Settings", "Order Alert SMS"]
  },
  "push-notifications": {
    title: "Push Notifications",
    description: "Web and App push notification settings.",
    subPoints: ["FCM Server Key", "Enable Web Push", "Automated Triggers"]
  },
  "media-storage": {
    title: "Media & Storage",
    description: "Configure cloud storage for assets.",
    subPoints: ["AWS S3 Credentials", "Cloudinary Setup", "Image Compression Settings"]
  },
  "backup-maintenance": {
    title: "Backup & Maintenance",
    description: "Database backups and routine maintenance.",
    subPoints: ["Automated Backups", "Download Backup", "Database Cleanup"]
  },
  "system-logs": {
    title: "System Logs & Audit Logs",
    description: "View and configure system logging.",
    subPoints: ["Error Logs", "User Activity Logs", "Admin Actions Log", "Log Retention Period"]
  },
  "developer-settings": {
    title: "Developer Settings",
    description: "Advanced developer configurations.",
    subPoints: ["Webhooks", "Custom CSS/JS", "Sandbox Mode"]
  },
  "seo-marketing": {
    title: "SEO & Marketing",
    description: "Global SEO tags and marketing integrations.",
    subPoints: ["Meta Tags Configuration", "Google Analytics ID", "Facebook Pixel", "Sitemap Generation"]
  },
  "api-integrations": {
    title: "API & Integrations",
    description: "Manage 3rd party API keys.",
    subPoints: ["Google Auth Config", "Stripe API Keys", "PayPal Config", "OpenAI Keys"]
  },
  "reports-analytics": {
    title: "Reports & Analytics",
    description: "Configure data tracking and reporting.",
    subPoints: ["Sales Reports", "User Growth", "Earnings Overview", "Export Data"]
  },
  "help-center": {
    title: "Help Center & FAQs",
    description: "Manage FAQs and knowledge base.",
    subPoints: ["FAQ Categories", "Create Article", "Popular Questions"]
  },
  "support-system": {
    title: "Support System",
    description: "Manage customer support settings.",
    subPoints: ["Ticket Categories", "Support Email Address", "Auto-Responders"]
  }
};

export default function DynamicSettingPage({ params }: { params: Promise<{ section: string }> }) {
  const { section: sectionKey } = use(params);
  
  // If we have data for this route, use it. Otherwise, show a generic placeholder.
  const data = SETTING_PAGES_DATA[sectionKey] || {
    title: sectionKey.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    description: "This settings module is currently under development. Settings are not yet available.",
    subPoints: []
  };

  return (
    <SettingsPageTemplate 
      title={data.title} 
      loading={false} 
      saving={false} 
      onSave={() => alert("This is a placeholder page. Backend wiring is required.")}
    >
      <div className="mb-6 pb-6 border-b border-slate-100">
        <p className="text-slate-500 text-sm">{data.description}</p>
      </div>

      {data.subPoints.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.subPoints.map((point, idx) => (
            <div key={idx} className="bg-slate-50 rounded-xl p-5 border border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 mb-3">{point}</h3>
              
              {/* Generic placeholder input depending on index to look varied */}
              {idx % 3 === 0 ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-6 bg-slate-200 rounded-full flex items-center p-1 cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                  </div>
                  <span className="text-xs font-medium text-slate-500">Disabled</span>
                </div>
              ) : idx % 3 === 1 ? (
                <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white" placeholder="Value..." disabled />
              ) : (
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white" disabled>
                  <option>Select Option...</option>
                </select>
              )}
              <p className="text-[11px] text-slate-400 mt-2 mt-2">Configure the {point.toLowerCase()} for the platform.</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
             <span className="text-2xl">🚧</span>
          </div>
          <h2 className="text-lg font-bold text-slate-800">Coming Soon</h2>
          <p className="text-slate-500 text-sm mt-2">This configuration module is not yet available.</p>
        </div>
      )}
    </SettingsPageTemplate>
  );
}
