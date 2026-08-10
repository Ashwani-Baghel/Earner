"use client";

import { SettingsPageTemplate } from "@/components/admin/settings/SettingsPageTemplate";
import { FormSection } from "@/components/admin/settings/FormSection";
import { Input } from "@/components/ui/Input";
import { useCmsSettings } from "@/hooks/useCmsSettings";

const DEFAULT_ANNOUNCEMENT = {
  isActive: false,
  message: "Huge Sale! Get 20% off all gigs this weekend.",
  linkUrl: "/explore",
  backgroundColor: "#0d9488", // teal-600
  textColor: "#ffffff",
};

export default function AnnouncementBarCMS() {
  const { data, loading, saving, handleChange, handleSave } = useCmsSettings("announcement-bar", DEFAULT_ANNOUNCEMENT);

  return (
    <SettingsPageTemplate 
      title="Announcement Bar" 
      loading={loading} 
      saving={saving} 
      onSave={handleSave}
    >
      <div className="mb-6 pb-6 border-b border-slate-100">
        <p className="text-slate-500 text-sm">Configure the global announcement banner that appears at the top of every page.</p>
      </div>

      <div className="space-y-6">
        <FormSection title="Bar Status" description="Enable or disable the announcement bar globally.">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input type="checkbox" name="isActive" checked={data.isActive} onChange={handleChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </div>
            <span className="text-sm font-medium text-slate-700">Show Announcement Bar</span>
          </label>
        </FormSection>

        <FormSection title="Content" description="The text message and link for the announcement.">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
              <Input name="message" value={data.message} onChange={handleChange} placeholder="e.g. Huge Sale! 20% off..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Link URL</label>
              <Input name="linkUrl" value={data.linkUrl} onChange={handleChange} placeholder="/explore or https://..." />
            </div>
          </div>
        </FormSection>

        <FormSection title="Appearance" description="Set the background and text colors.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Background Color</label>
              <div className="flex gap-3">
                <input type="color" name="backgroundColor" value={data.backgroundColor} onChange={handleChange} className="h-10 w-14 rounded cursor-pointer border border-slate-200 p-1 bg-white" />
                <Input name="backgroundColor" value={data.backgroundColor} onChange={handleChange} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Text Color</label>
              <div className="flex gap-3">
                <input type="color" name="textColor" value={data.textColor} onChange={handleChange} className="h-10 w-14 rounded cursor-pointer border border-slate-200 p-1 bg-white" />
                <Input name="textColor" value={data.textColor} onChange={handleChange} />
              </div>
            </div>
          </div>
        </FormSection>

        {/* Live Preview */}
        {data.isActive && (
          <div className="mt-8 pt-8 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Live Preview</h3>
            <div className="rounded-xl overflow-hidden border border-slate-200">
              <div 
                className="w-full py-2 px-4 text-center text-sm font-medium"
                style={{ backgroundColor: data.backgroundColor, color: data.textColor }}
              >
                {data.message} <span className="underline cursor-pointer ml-1">Learn More</span>
              </div>
              <div className="h-20 bg-slate-50 flex items-center justify-center">
                <span className="text-slate-400 text-xs">Website Header Area</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </SettingsPageTemplate>
  );
}
