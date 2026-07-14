"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Settings, Save, AlertTriangle, Globe, Percent, Mail, Loader2, Check } from "lucide-react";

export default function AdminSettingsPage() {
  const { user } = useAuth();
  
  const [feePct, setFeePct] = useState<number>(5.0);
  const [maintenance, setMaintenance] = useState(false);
  const [contactEmail, setContactEmail] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/admin/settings", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setFeePct(data.settings.feePct);
          setMaintenance(data.settings.maintenance);
          setContactEmail(data.settings.contactEmail);
        }
      } catch (err) {
        console.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          feePct: Number(feePct),
          maintenance,
          contactEmail
        }),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      setMessage({ type: "success", text: "Settings saved successfully!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
        <Loader2 className="animate-spin text-teal-600" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center">
          <Settings size={20} className="text-slate-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage global configuration for Earner.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden mb-6">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Globe size={18} className="text-teal-600" /> General Preferences
          </h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Service Fee */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="block text-sm font-bold text-slate-900 mb-1">Platform Fee</label>
              <p className="text-xs text-slate-500">The percentage charged to buyers on each transaction.</p>
            </div>
            <div className="md:col-span-2 relative">
              <Percent size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={feePct}
                onChange={(e) => setFeePct(parseFloat(e.target.value))}
                className="w-full max-w-xs pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Contact Email */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="block text-sm font-bold text-slate-900 mb-1">Support Email</label>
              <p className="text-xs text-slate-500">Public email address for customer support inquiries.</p>
            </div>
            <div className="md:col-span-2 relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full max-w-xs pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Maintenance Mode */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-1">
              <label className="block text-sm font-bold text-slate-900 mb-1">Maintenance Mode</label>
              <p className="text-xs text-slate-500">Disable marketplace access for regular users.</p>
            </div>
            <div className="md:col-span-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={maintenance}
                  onChange={(e) => setMaintenance(e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                <span className="ml-3 text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  {maintenance ? (
                    <><AlertTriangle size={14} className="text-red-500" /> Active</>
                  ) : (
                    "Disabled"
                  )}
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div>
            {message && (
              <span className={`text-sm font-medium flex items-center gap-1.5 ${message.type === "success" ? "text-teal-600" : "text-red-500"}`}>
                {message.type === "success" && <Check size={16} />}
                {message.text}
              </span>
            )}
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-xl font-bold shadow-sm hover:bg-teal-700 transition-colors disabled:opacity-70"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save Settings</>}
          </button>
        </div>
      </div>
    </div>
  );
}
