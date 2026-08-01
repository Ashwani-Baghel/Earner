"use client";

import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function HeroCMS() {
  const router = useRouter();
  const [data, setData] = useState<any>({
    headline: "Find the perfect freelance services for your business",
    subheadline: "Millions of people use Earner to turn their ideas into reality.",
    searchPlaceholder: "Try 'building mobile app'",
    backgroundImageUrl: ""
  });
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/cms/config?key=HERO", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (Object.keys(json).length > 0) {
        setData({
          headline: json.headline || "Find the perfect freelance services for your business",
          backgroundImageUrl: json.backgroundImageUrl || "",
          searchPlaceholder: json.searchPlaceholder || "Search for any service..."
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/cms/config", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ key: "HERO", data })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }
      router.refresh();
      alert("Saved successfully!");
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-teal-600" /></div>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Hero Section</h1>
          <p className="text-slate-500 mt-1">Configure the main homepage banner.</p>
        </div>
        <button onClick={save} disabled={saving} className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Headline</label>
          <input 
            type="text" 
            value={data.headline} 
            onChange={e => setData({...data, headline: e.target.value})}
            className="w-full border border-slate-300 rounded-lg px-4 py-2 font-bold text-lg focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Subheadline</label>
          <textarea 
            value={data.subheadline} 
            onChange={e => setData({...data, subheadline: e.target.value})}
            className="w-full border border-slate-300 rounded-lg px-4 py-3 h-24 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Search Input Placeholder</label>
            <input 
              type="text" 
              value={data.searchPlaceholder} 
              onChange={e => setData({...data, searchPlaceholder: e.target.value})}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Background Image URL (Optional)</label>
            <input 
              type="text" 
              value={data.backgroundImageUrl} 
              placeholder="https://..."
              onChange={e => setData({...data, backgroundImageUrl: e.target.value})}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
