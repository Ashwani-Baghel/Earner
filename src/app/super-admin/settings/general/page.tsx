"use client";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { SettingsPageTemplate } from "@/components/admin/settings/SettingsPageTemplate";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

const CURRENCIES = [
  { value: "USD", label: "USD - US Dollar ($)" },
  { value: "EUR", label: "EUR - Euro (€)" },
  { value: "GBP", label: "GBP - British Pound (£)" },
  { value: "INR", label: "INR - Indian Rupee (₹)" },
  { value: "AUD", label: "AUD - Australian Dollar (A$)" },
  { value: "CAD", label: "CAD - Canadian Dollar (C$)" },
  { value: "SGD", label: "SGD - Singapore Dollar (S$)" },
  { value: "AED", label: "AED - UAE Dirham (د.إ)" },
  { value: "JPY", label: "JPY - Japanese Yen (¥)" },
  { value: "CHF", label: "CHF - Swiss Franc (Fr)" },
];

const TIMEZONES = [
  { value: "UTC", label: "UTC - Coordinated Universal Time" },
  { value: "America/New_York", label: "America/New_York (EST/EDT)" },
  { value: "America/Chicago", label: "America/Chicago (CST/CDT)" },
  { value: "America/Denver", label: "America/Denver (MST/MDT)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (PST/PDT)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST)" },
  { value: "Europe/Paris", label: "Europe/Paris (CET/CEST)" },
  { value: "Europe/Berlin", label: "Europe/Berlin (CET/CEST)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (GST)" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (SGT)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (JST)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (AEST/AEDT)" },
  { value: "Pacific/Auckland", label: "Pacific/Auckland (NZST/NZDT)" },
];

export default function GeneralSettings() {
  const { settings, loading, saving, handleChange, handleSave } = useAdminSettings();

  return (
    <SettingsPageTemplate title="General Settings" loading={loading} saving={saving} onSave={handleSave}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Website Name</label>
          <input type="text" name="websiteName" value={settings.websiteName} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:border-teal-500 outline-none" />
        </div>
        <div className="relative z-20">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Default Currency</label>
          <SearchableSelect 
            name="defaultCurrency" 
            value={settings.defaultCurrency} 
            onChange={handleChange} 
            options={CURRENCIES}
            placeholder="Search currency..."
          />
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
        <div className="md:col-span-2 relative z-10">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Default Timezone</label>
          <SearchableSelect 
            name="defaultTimezone" 
            value={settings.defaultTimezone} 
            onChange={handleChange} 
            options={TIMEZONES}
            placeholder="Search timezone..."
          />
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
