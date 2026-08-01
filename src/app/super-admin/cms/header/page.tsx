"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function HeaderCMS() {
  const router = useRouter();
  const [data, setData] = useState<any>({
    logoText: "Earner.",
    logoImageUrl: "",
    links: [
      { label: "Explore", url: "/explore" },
      { label: "Become a Seller", url: "/seller/onboarding" }
    ]
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
      const res = await fetch("/api/admin/cms/config?key=HEADER", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (Object.keys(json).length > 0) {
        setData({
          logoText: json.logoText || "Earner.",
          logoImageUrl: json.logoImageUrl || "",
          links: json.links || []
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
        body: JSON.stringify({ key: "HEADER", data })
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
          <h1 className="text-2xl font-black text-slate-900">Header & Nav</h1>
          <p className="text-slate-500 mt-1">Configure the main website header and navigation links.</p>
        </div>
        <button onClick={save} disabled={saving} className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Branding</h2>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Logo Text</label>
            <input 
              type="text" 
              value={data.logoText} 
              onChange={e => setData({...data, logoText: e.target.value})}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Logo Image URL (Optional)</label>
            <input 
              type="text" 
              value={data.logoImageUrl} 
              placeholder="https://..."
              onChange={e => setData({...data, logoImageUrl: e.target.value})}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-lg font-bold text-slate-900">Navigation Links</h2>
          <button 
            onClick={() => setData({...data, links: [...(data.links || []), { label: "", url: "" }]})}
            className="text-sm font-bold text-teal-600 flex items-center gap-1 hover:bg-teal-50 px-2 py-1 rounded"
          >
            <Plus size={14} /> Add Link
          </button>
        </div>
        
        <div className="space-y-3">
          {(data.links || []).map((link: any, i: number) => (
            <div key={i} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <input 
                type="text" 
                placeholder="Label (e.g. Explore)"
                value={link.label}
                onChange={e => {
                  const newLinks = [...data.links];
                  newLinks[i].label = e.target.value;
                  setData({...data, links: newLinks});
                }}
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
              />
              <input 
                type="text" 
                placeholder="URL (e.g. /explore)"
                value={link.url}
                onChange={e => {
                  const newLinks = [...data.links];
                  newLinks[i].url = e.target.value;
                  setData({...data, links: newLinks});
                }}
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
              />
              <button 
                onClick={() => setData({...data, links: data.links.filter((_: any, idx: number) => idx !== i)})}
                className="text-slate-400 hover:text-red-500 p-2"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {data.links.length === 0 && <p className="text-slate-400 text-sm italic">No links added.</p>}
        </div>
      </div>
    </div>
  );
}
