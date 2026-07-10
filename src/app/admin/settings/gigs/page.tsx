"use client";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { SettingsPageTemplate } from "@/components/admin/settings/SettingsPageTemplate";

export default function GigSettings() {
  const { settings, loading, saving, handleChange, handleSave } = useAdminSettings();

  return (
    <SettingsPageTemplate title="Gig Settings" loading={loading} saving={saving} onSave={handleSave}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Minimum Gig Price ($)</label>
            <input type="number" name="minGigPrice" value={settings.minGigPrice} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:border-teal-500 outline-none" min="1" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Maximum Gig Price ($)</label>
            <input type="number" name="maxGigPrice" value={settings.maxGigPrice} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:border-teal-500 outline-none" min="1" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Maximum Images per Gig</label>
            <input type="number" name="maxImagesPerGig" value={settings.maxImagesPerGig} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:border-teal-500 outline-none" min="1" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Maximum Video Size (MB)</label>
            <input type="number" name="maxVideoSize" value={settings.maxVideoSize} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:border-teal-500 outline-none" min="1" />
          </div>
        </div>

        <div className="space-y-4 mt-6">
          <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Auto-Approve Gigs</h3>
              <p className="text-slate-500 text-xs mt-0.5">Automatically approve newly created gigs without manual review.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="autoApproveGigs" checked={settings.autoApproveGigs} onChange={handleChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>
        </div>
      </div>
    </SettingsPageTemplate>
  );
}
