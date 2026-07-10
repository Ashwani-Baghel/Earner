"use client";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { SettingsPageTemplate } from "@/components/admin/settings/SettingsPageTemplate";

export default function GeneralSettings() {
  const { settings, loading, saving, handleChange, handleSave } = useAdminSettings();

  return (
    <SettingsPageTemplate title="General Settings" loading={loading} saving={saving} onSave={handleSave}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Website Name</label>
          <input type="text" name="websiteName" value={settings.websiteName} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:border-teal-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Default Currency</label>
          <select name="defaultCurrency" value={settings.defaultCurrency} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:border-teal-500 outline-none">
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="INR">INR (₹)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Support Email</label>
          <input type="email" name="supportEmail" value={settings.supportEmail} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:border-teal-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Support Phone</label>
          <input type="text" name="supportPhone" value={settings.supportPhone} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:border-teal-500 outline-none" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Website Logo URL</label>
          <input type="text" name="websiteLogo" value={settings.websiteLogo} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:border-teal-500 outline-none" placeholder="https://..." />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Favicon URL</label>
          <input type="text" name="favicon" value={settings.favicon} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:border-teal-500 outline-none" placeholder="https://..." />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Default Timezone</label>
          <input type="text" name="defaultTimezone" value={settings.defaultTimezone} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:border-teal-500 outline-none" />
        </div>
        <div className="md:col-span-2 flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-lg mt-4">
          <div>
            <h3 className="font-bold text-red-700 text-sm">Maintenance Mode</h3>
            <p className="text-red-600/80 text-xs mt-0.5">When enabled, the site will show a maintenance page to all regular users.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" name="maintenanceMode" checked={settings.maintenanceMode} onChange={handleChange} className="sr-only peer" />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
          </label>
        </div>
      </div>
    </SettingsPageTemplate>
  );
}
