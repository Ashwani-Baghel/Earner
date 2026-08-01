"use client";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { SettingsPageTemplate } from "@/components/admin/settings/SettingsPageTemplate";

export default function NotificationsSettings() {
  const { settings, loading, saving, handleChange, handleSave } = useAdminSettings();

  return (
    <SettingsPageTemplate title="Notifications Settings" loading={loading} saving={saving} onSave={handleSave}>
      <div className="space-y-4">
        {[
          { name: "emailNotifications", label: "Email Notifications", desc: "Send critical system notifications via email." },
          { name: "adminNotifications", label: "Admin Notifications", desc: "Receive alerts for new users, gigs, and system issues." },
          { name: "buyerNotifications", label: "Buyer Notifications", desc: "Notify buyers about order updates and messages." },
          { name: "sellerNotifications", label: "Seller Notifications", desc: "Notify sellers about new orders and payouts." },
        ].map((item) => (
          <div key={item.name} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">{item.label}</h3>
              <p className="text-slate-500 text-xs mt-0.5">{item.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name={item.name} checked={settings[item.name as keyof typeof settings] as boolean} onChange={handleChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>
        ))}
      </div>
    </SettingsPageTemplate>
  );
}
