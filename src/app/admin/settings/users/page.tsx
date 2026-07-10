"use client";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { SettingsPageTemplate } from "@/components/admin/settings/SettingsPageTemplate";

export default function UserSettings() {
  const { settings, loading, saving, handleChange, handleSave } = useAdminSettings();

  return (
    <SettingsPageTemplate title="User Settings" loading={loading} saving={saving} onSave={handleSave}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Maximum Gigs per Seller</label>
            <input type="number" name="maxGigsPerSeller" value={settings.maxGigsPerSeller} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:border-teal-500 outline-none" min="1" max="100" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Default User Role on Sign Up</label>
            <select name="defaultUserRole" value={settings.defaultUserRole} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:border-teal-500 outline-none">
              <option value="BUYER">Buyer</option>
              <option value="SELLER">Seller</option>
            </select>
          </div>
        </div>

        <div className="space-y-4 mt-6">
          {[
            { name: "autoApproveSellers", label: "Auto-Approve Sellers", desc: "Automatically approve new seller applications without manual review." },
            { name: "requireSellerVerification", label: "Require Identity Verification", desc: "Sellers must verify their identity before accepting orders." },
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
      </div>
    </SettingsPageTemplate>
  );
}
