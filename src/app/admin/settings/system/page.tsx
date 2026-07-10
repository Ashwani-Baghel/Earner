"use client";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { SettingsPageTemplate } from "@/components/admin/settings/SettingsPageTemplate";

export default function SystemSettings() {
  const { loading, saving, handleSave } = useAdminSettings();

  return (
    <SettingsPageTemplate title="System Settings" loading={loading} saving={saving} onSave={handleSave}>
      <div className="space-y-6 text-center py-20">
        <h2 className="text-xl font-bold text-slate-800 mb-2">System Settings</h2>
        <p className="text-slate-500">This section is currently under development.</p>
      </div>
    </SettingsPageTemplate>
  );
}
