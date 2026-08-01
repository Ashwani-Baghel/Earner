"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function FooterCMS() {
  const router = useRouter();
  const [data, setData] = useState<any>({
    copyright: "© 2026 Earner International Ltd.",
    columns: [
      {
        title: "Categories",
        links: [
          { label: "Graphics & Design", url: "#" },
          { label: "Digital Marketing", url: "#" },
          { label: "Writing & Translation", url: "#" }
        ]
      },
      {
        title: "About",
        links: [
          { label: "Careers", url: "#" },
          { label: "Press & News", url: "#" },
          { label: "Partnerships", url: "#" }
        ]
      }
    ],
    social: {
      twitter: "",
      facebook: "",
      instagram: "",
      linkedin: ""
    }
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
      const res = await fetch("/api/admin/cms/config?key=FOOTER", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (Object.keys(json).length > 0) {
        setData({
          copyright: json.copyright || "© 2026 Earner International Ltd.",
          social: json.social || { twitter: "", facebook: "", instagram: "", linkedin: "" },
          columns: json.columns || []
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
        body: JSON.stringify({ key: "FOOTER", data })
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
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Footer</h1>
          <p className="text-slate-500 mt-1">Configure the website footer links and social profiles.</p>
        </div>
        <button onClick={save} disabled={saving} className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">General</h2>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Copyright Text</label>
          <input 
            type="text" 
            value={data.copyright} 
            onChange={e => setData({...data, copyright: e.target.value})}
            className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>
        
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mt-8">Social Links</h2>
        <div className="grid grid-cols-2 gap-4">
          {Object.keys(data.social || {}).map(key => (
            <div key={key}>
              <label className="block text-sm font-bold text-slate-700 mb-2 capitalize">{key}</label>
              <input 
                type="text" 
                value={data.social[key]} 
                placeholder="https://..."
                onChange={e => setData({...data, social: {...data.social, [key]: e.target.value}})}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-lg font-bold text-slate-900">Footer Columns</h2>
          <button 
            onClick={() => setData({...data, columns: [...(data.columns || []), { title: "", links: [] }]})}
            className="text-sm font-bold text-teal-600 flex items-center gap-1 hover:bg-teal-50 px-2 py-1 rounded"
          >
            <Plus size={14} /> Add Column
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(data.columns || []).map((col: any, colIdx: number) => (
            <div key={colIdx} className="border border-slate-200 rounded-xl p-4 bg-slate-50 relative">
              <button 
                onClick={() => setData({...data, columns: data.columns.filter((_: any, i: number) => i !== colIdx)})}
                className="absolute top-4 right-4 text-slate-400 hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>
              
              <input 
                type="text" 
                value={col.title} 
                onChange={e => {
                  const newCols = [...data.columns];
                  newCols[colIdx].title = e.target.value;
                  setData({...data, columns: newCols});
                }}
                className="font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-teal-500 outline-none pb-1 mb-4 w-3/4"
              />
              
              <div className="space-y-2">
                {(col.links || []).map((link: any, linkIdx: number) => (
                  <div key={linkIdx} className="flex items-center gap-2">
                    <input 
                      type="text" 
                      placeholder="Label"
                      value={link.label}
                      onChange={e => {
                        const newCols = [...data.columns];
                        newCols[colIdx].links[linkIdx].label = e.target.value;
                        setData({...data, columns: newCols});
                      }}
                      className="flex-1 border border-slate-200 rounded px-2 py-1 text-sm focus:border-teal-500 outline-none"
                    />
                    <input 
                      type="text" 
                      placeholder="URL"
                      value={link.url}
                      onChange={e => {
                        const newCols = [...data.columns];
                        newCols[colIdx].links[linkIdx].url = e.target.value;
                        setData({...data, columns: newCols});
                      }}
                      className="flex-1 border border-slate-200 rounded px-2 py-1 text-sm focus:border-teal-500 outline-none"
                    />
                    <button 
                      onClick={() => {
                        const newCols = [...data.columns];
                        newCols[colIdx].links = newCols[colIdx].links.filter((_: any, i: number) => i !== linkIdx);
                        setData({...data, columns: newCols});
                      }}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                
                <button 
                  onClick={() => {
                    const newCols = [...data.columns];
                    newCols[colIdx].links.push({ label: "", url: "" });
                    setData({...data, columns: newCols});
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-teal-600 mt-2 block"
                >
                  + Add Link
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
