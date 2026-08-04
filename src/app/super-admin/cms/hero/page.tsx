"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, UploadCloud, Trash2, Image as ImageIcon, Video } from "lucide-react";
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
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleMedia = async (file: File) => {
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    
    if (!isVideo && !isImage) {
      return alert("Invalid file type. Only images and videos are allowed.");
    }
    
    // 2MB for images, 5MB for videos
    const maxSizeBytes = isVideo ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
    
    if (file.size > maxSizeBytes) {
      return alert(`File is too large. Maximum size is ${isVideo ? "5MB" : "2MB"}.`);
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (json.url) {
        setData((prev: any) => ({ ...prev, backgroundImageUrl: json.url }));
      } else {
        alert(json.error || "Failed to upload.");
      }
    } catch (e) {
      alert("Error uploading media");
    } finally {
      setUploading(false);
    }
  };

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
            <label className="block text-sm font-bold text-slate-700 mb-2">Background Image/Video (Optional)</label>
            <div 
              className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors ${dragActive ? 'border-teal-500 bg-teal-50' : 'border-slate-300 hover:border-slate-400'}`}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleMedia(e.dataTransfer.files[0]);
                }
              }}
            >
              <input 
                type="file" 
                accept="image/*,video/mp4,video/webm,video/ogg"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleMedia(e.target.files[0]);
                  }
                }}
              />
              {uploading ? (
                <Loader2 className="animate-spin text-teal-600 mb-2" size={24} />
              ) : data.backgroundImageUrl ? (
                <div className="relative w-full h-24 flex items-center justify-center bg-slate-50 rounded-lg mb-2 overflow-hidden">
                  {data.backgroundImageUrl.startsWith("data:video") || data.backgroundImageUrl.match(/\\.(mp4|webm|ogg)$/i) ? (
                    <video src={data.backgroundImageUrl} className="max-h-full max-w-full object-contain" autoPlay muted loop playsInline />
                  ) : (
                    <img src={data.backgroundImageUrl} alt="Background Preview" className="max-h-full max-w-full object-contain" />
                  )}
                </div>
              ) : (
                <UploadCloud className="text-slate-400 mb-2" size={24} />
              )}
              <div className="text-sm font-semibold text-teal-600">
                {uploading ? "Uploading..." : data.backgroundImageUrl ? "Click or drag to replace" : "Click or drag to upload media"}
              </div>
              <p className="text-xs text-slate-500 mt-1">Image up to 2MB, Video up to 5MB</p>
            </div>
            {data.backgroundImageUrl && (
              <div className="mt-2 text-right">
                <button 
                  onClick={() => setData({ ...data, backgroundImageUrl: "" })}
                  className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center justify-end gap-1 w-full"
                >
                  <Trash2 size={12} /> Remove Media
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
