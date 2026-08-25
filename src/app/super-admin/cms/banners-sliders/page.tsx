"use client";

import { useState } from "react";
import { SettingsPageTemplate } from "@/components/admin/settings/SettingsPageTemplate";
import { FormSection } from "@/components/admin/settings/FormSection";
import { Input } from "@/components/ui/Input";
import { useCmsSettings } from "@/hooks/useCmsSettings";
import { Plus, Trash2, UploadCloud, Loader2, Calendar } from "lucide-react";

type Banner = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  ctaUrl: string;
  startDate: string; // ISO string YYYY-MM-DD
  endDate: string; // ISO string YYYY-MM-DD
  isActive: boolean;
  placements: string[];
};

const PLACEMENT_OPTIONS = [
  { id: "HOMEPAGE", label: "Homepage" },
  { id: "CATEGORY", label: "Category Pages" },
  { id: "SELLER", label: "Seller Dashboard" },
  { id: "SEARCH", label: "Search Results" },
  { id: "LANDING_PAGE", label: "Promotions Landing Page" }
];

const DEFAULT_BANNERS = {
  items: [
    {
      id: "1",
      title: "Black Friday Sale!",
      description: "Get 50% off all Website Development gigs this week.",
      imageUrl: "",
      ctaText: "Shop Now",
      ctaUrl: "/search?q=website",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      isActive: true,
      placements: ["HOMEPAGE", "LANDING_PAGE"]
    }
  ] as Banner[]
};

export default function BannersCMS() {
  const { data, setData, loading, saving, handleSave } = useCmsSettings("BANNERS", DEFAULT_BANNERS);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const banners: Banner[] = data.items || [];

  const addBanner = () => {
    setData({
      items: [
        {
          id: Math.random().toString(36).substring(7),
          title: "New Promotion",
          description: "Details about this promotion.",
          imageUrl: "",
          ctaText: "Learn More",
          ctaUrl: "/",
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          isActive: false,
          placements: []
        },
        ...banners
      ]
    });
  };

  const removeBanner = (id: string) => {
    setData({ items: banners.filter(b => b.id !== id) });
  };

  const updateBanner = (id: string, field: keyof Banner, value: any) => {
    setData({ items: banners.map(b => b.id === id ? { ...b, [field]: value } : b) });
  };

  const togglePlacement = (id: string, placementId: string) => {
    const banner = banners.find(b => b.id === id);
    if (!banner) return;
    const hasPlacement = banner.placements.includes(placementId);
    const newPlacements = hasPlacement 
      ? banner.placements.filter(p => p !== placementId)
      : [...banner.placements, placementId];
    updateBanner(id, "placements", newPlacements);
  };

  const handleMedia = async (file: File, id: string) => {
    if (!file.type.startsWith("image/")) return alert("Only images allowed.");
    setUploadingId(id);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (json.url) updateBanner(id, "imageUrl", json.url);
      else alert(json.error || "Failed to upload.");
    } catch (e) {
      alert("Error uploading image.");
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <SettingsPageTemplate 
      title="Promotional Banners & Sliders" 
      loading={loading} 
      saving={saving} 
      onSave={handleSave}
    >
      <div className="mb-6 pb-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
        <p className="text-slate-500 text-sm">Schedule and manage promotional banners across different sections of the platform.</p>
        <button 
          onClick={addBanner}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> Create Banner
        </button>
      </div>

      <div className="space-y-8">
        {banners.length === 0 && (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <p className="text-slate-500 font-medium">No promotional banners created yet.</p>
          </div>
        )}

        {banners.map((banner, index) => (
          <FormSection key={banner.id} title={`Banner #${banners.length - index}`}>
            <div className="flex flex-col lg:flex-row gap-8">
              
              {/* Left Column: Image Upload & Basics */}
              <div className="lg:w-1/3 space-y-4">
                <div className="aspect-[21/9] w-full rounded-2xl border-2 border-slate-200 overflow-hidden relative group bg-slate-50">
                  {banner.imageUrl ? (
                    <>
                      <img src={banner.imageUrl} alt="Banner" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <label className="bg-white text-slate-900 px-3 py-1.5 rounded-lg text-sm font-bold cursor-pointer hover:bg-slate-100">
                          Change
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleMedia(e.target.files[0], banner.id)} />
                        </label>
                      </div>
                    </>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors p-4 text-center">
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleMedia(e.target.files[0], banner.id)} />
                      {uploadingId === banner.id ? (
                        <Loader2 size={24} className="text-teal-600 animate-spin" />
                      ) : (
                        <>
                          <UploadCloud size={24} className="text-slate-400 mb-2" />
                          <span className="text-sm font-bold text-slate-600">Upload Graphic</span>
                          <span className="text-xs text-slate-400 mt-1">Recommended: 1200x500px</span>
                        </>
                      )}
                    </label>
                  )}
                </div>

                <label className="flex items-center gap-3 cursor-pointer p-3 border border-slate-200 rounded-xl bg-white hover:border-slate-300 transition-colors">
                  <div className="relative">
                    <input type="checkbox" checked={banner.isActive} onChange={(e) => updateBanner(banner.id, "isActive", e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">Banner Status</span>
                    <span className="text-xs font-medium text-slate-500 block">{banner.isActive ? 'Active (Live)' : 'Paused'}</span>
                  </div>
                </label>
                
                <button onClick={() => removeBanner(banner.id)} className="w-full py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl flex items-center justify-center gap-2 transition-colors">
                  <Trash2 size={16} /> Delete Banner
                </button>
              </div>

              {/* Right Column: Details, Scheduling, Placement */}
              <div className="lg:w-2/3 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Campaign Title (e.g. Festival Sale)</label>
                    <Input value={banner.title} onChange={(e) => updateBanner(banner.id, "title", e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description / Subtitle</label>
                    <textarea 
                      value={banner.description} 
                      onChange={(e) => updateBanner(banner.id, "description", e.target.value)} 
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm resize-y"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Button Text</label>
                    <Input value={banner.ctaText} onChange={(e) => updateBanner(banner.id, "ctaText", e.target.value)} placeholder="e.g. Shop Now" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Button URL</label>
                    <Input value={banner.ctaUrl} onChange={(e) => updateBanner(banner.id, "ctaUrl", e.target.value)} placeholder="/explore" />
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><Calendar size={16} className="text-teal-600"/> Scheduling</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Start Date</label>
                      <Input type="date" value={banner.startDate} onChange={(e) => updateBanner(banner.id, "startDate", e.target.value)} className="bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">End Date</label>
                      <Input type="date" value={banner.endDate} onChange={(e) => updateBanner(banner.id, "endDate", e.target.value)} className="bg-white" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">The banner will automatically disappear after the End Date.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Display Placements</label>
                  <p className="text-xs text-slate-500 mb-3">Select exactly which pages this banner should appear on.</p>
                  <div className="flex flex-wrap gap-2">
                    {PLACEMENT_OPTIONS.map(opt => {
                      const isSelected = banner.placements.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          onClick={() => togglePlacement(banner.id, opt.id)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all ${
                            isSelected 
                              ? "bg-teal-50 border-teal-200 text-teal-700" 
                              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          </FormSection>
        ))}
      </div>
    </SettingsPageTemplate>
  );
}
