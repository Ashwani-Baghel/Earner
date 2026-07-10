"use client";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { SettingsPageTemplate } from "@/components/admin/settings/SettingsPageTemplate";

export default function PaymentSettings() {
  const { settings, loading, saving, handleChange, handleSave } = useAdminSettings();

  return (
    <SettingsPageTemplate title="Payment & Commission" loading={loading} saving={saving} onSave={handleSave}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Platform Commission (%)</label>
            <input type="number" name="platformCommission" value={settings.platformCommission} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:border-teal-500 outline-none" min="0" max="100" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Minimum Withdrawal Amount ($)</label>
            <input type="number" name="minWithdrawalAmount" value={settings.minWithdrawalAmount} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:border-teal-500 outline-none" min="1" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Payment Mode</label>
            <select name="paymentMode" value={settings.paymentMode} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:border-teal-500 outline-none">
              <option value="Test">Test Mode (Sandbox)</option>
              <option value="Live">Live Mode (Production)</option>
            </select>
          </div>
        </div>

        <div className="space-y-4 mt-6">
          <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Enable Withdrawals</h3>
              <p className="text-slate-500 text-xs mt-0.5">Allow sellers to request withdrawals from their available balance.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="enableWithdrawals" checked={settings.enableWithdrawals} onChange={handleChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>
        </div>
      </div>
    </SettingsPageTemplate>
  );
}
