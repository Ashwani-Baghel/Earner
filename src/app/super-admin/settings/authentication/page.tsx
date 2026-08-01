"use client";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { SettingsPageTemplate } from "@/components/admin/settings/SettingsPageTemplate";

export default function AuthenticationSettings() {
  const { settings, loading, saving, handleChange, handleSave } = useAdminSettings();

  return (
    <SettingsPageTemplate title="Authentication Settings" loading={loading} saving={saving} onSave={handleSave}>
      <div className="space-y-4">
        {[
          { name: "enableGoogleLogin", label: "Enable Google Login", desc: "Allow users to sign in using their Google accounts." },
          { name: "enableLinkedinLogin", label: "Enable LinkedIn Login", desc: "Allow users to sign in using their LinkedIn accounts." },
          { name: "requireEmailVerification", label: "Require Email Verification", desc: "Users must verify their email before using the platform." },
          { name: "allowBuyerRegistration", label: "Allow Buyer Registration", desc: "Enable new users to sign up as buyers." },
          { name: "allowSellerRegistration", label: "Allow Seller Registration", desc: "Enable users to apply to become sellers." },
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
