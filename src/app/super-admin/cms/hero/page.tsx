"use client";

import { SettingsPageTemplate } from "@/components/admin/settings/SettingsPageTemplate";
import { FormSection } from "@/components/admin/settings/FormSection";
import { Input } from "@/components/ui/Input";
import { useCmsSettings } from "@/hooks/useCmsSettings";
import { Plus, Trash2, UploadCloud, Loader2 } from "lucide-react";
import { useState } from "react";

const DEFAULT_HERO = {
  headline: "Find the perfect freelance services for your business",
  searchPlaceholder: "Try 'building mobile app'",
  backgroundImageUrl: "",
  popularSearches: [
    "Website Development",
    "Logo Design",
    "SEO",
    "Video Editing"
  ],
  trustedBrands: [
    { name: "Meta", wordmark: "𝗠eta", style: "font-size:15px; font-weight:800; letter-spacing:-0.5px" },
    { name: "Google", wordmark: "Google", style: "font-size:15px; font-weight:600; letter-spacing:-0.3px" },
    { name: "Netflix", wordmark: "NETFLIX", style: "font-size:13px; font-weight:900; letter-spacing:1px" },
    { name: "P&G", wordmark: "P&G", style: "font-size:14px; font-weight:700" },
    { name: "PayPal", wordmark: "PayPal", style: "font-size:14px; font-weight:700; letter-spacing:-0.3px" },
    { name: "Payoneer", wordmark: "◯Payoneer", style: "font-size:13px; font-weight:600" }
  ]
};

export default function HeroCMS() {
  const { data, setData, loading, saving, handleChange, handleSave } = useCmsSettings("HERO", DEFAULT_HERO);
  const [uploading, setUploading] = useState(false);

  const handleMedia = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      return alert("Invalid file type. Only images are allowed.");
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
      alert("Error uploading image.");
    } finally {
      setUploading(false);
    }
  };

  const addPopularSearch = () => {
    setData((prev: any) => ({ ...prev, popularSearches: [...(prev.popularSearches || []), "New Keyword"] }));
  };

  const updatePopularSearch = (idx: number, value: string) => {
    setData((prev: any) => {
      const newSearches = [...prev.popularSearches];
      newSearches[idx] = value;
      return { ...prev, popularSearches: newSearches };
    });
  };

  const removePopularSearch = (idx: number) => {
    setData((prev: any) => ({ ...prev, popularSearches: prev.popularSearches.filter((_: any, i: number) => i !== idx) }));
  };

  const addTrustedBrand = () => {
    setData((prev: any) => ({
      ...prev,
      trustedBrands: [...(prev.trustedBrands || []), { name: "New Brand", wordmark: "Brand", style: "font-size:14px; font-weight:600" }]
    }));
  };

  const updateTrustedBrand = (idx: number, field: string, value: string) => {
    setData((prev: any) => {
      const newBrands = [...prev.trustedBrands];
      newBrands[idx][field] = value;
      return { ...prev, trustedBrands: newBrands };
    });
  };

  const removeTrustedBrand = (idx: number) => {
    setData((prev: any) => ({ ...prev, trustedBrands: prev.trustedBrands.filter((_: any, i: number) => i !== idx) }));
  };

  return (
    <SettingsPageTemplate 
      title="Hero Section" 
      loading={loading} 
      saving={saving} 
      onSave={handleSave}
    >
      <div className="mb-6 pb-6 border-b border-slate-100">
        <p className="text-slate-500 text-sm">Configure the main hero section of the homepage, including background, headline, and popular tags.</p>
      </div>

      <div className="space-y-6">
        <FormSection title="Main Content" description="Headline and background image.">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Headline</label>
              <Input name="headline" value={data.headline || ""} onChange={handleChange} placeholder="Find the perfect freelance services..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Search Placeholder</label>
              <Input name="searchPlaceholder" value={data.searchPlaceholder || ""} onChange={handleChange} placeholder="Try 'building mobile app'" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Background Image</label>
              {data.backgroundImageUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 group w-full h-48">
                  <img src={data.backgroundImageUrl} alt="Hero Background" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-3">
                    <label className="bg-white text-slate-900 px-4 py-2 rounded-xl text-sm font-bold cursor-pointer hover:bg-slate-100">
                      Change Image
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleMedia(e.target.files[0])} />
                    </label>
                    <button type="button" onClick={() => setData((p: any) => ({ ...p, backgroundImageUrl: "" }))} className="text-white hover:text-red-400 text-sm font-bold">Remove</button>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 hover:border-teal-500 transition-colors w-full h-48">
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleMedia(e.target.files[0])} />
                  {uploading ? (
                    <>
                      <Loader2 size={24} className="text-teal-600 animate-spin" />
                      <span className="text-sm font-bold text-slate-600">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud size={24} className="text-slate-400" />
                      <span className="text-sm font-bold text-slate-600">Click to upload background image</span>
                      <span className="text-xs text-slate-500">Recommended size: 1920x1080px</span>
                    </>
                  )}
                </label>
              )}
            </div>
          </div>
        </FormSection>

        <FormSection title="Popular Searches" description="The quick-search pills displayed directly under the search bar.">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              {(data.popularSearches || []).map((search: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-full pl-4 pr-2 py-1">
                  <input 
                    type="text"
                    value={search}
                    onChange={(e) => updatePopularSearch(idx, e.target.value)}
                    className="bg-transparent border-none outline-none text-sm font-medium w-32 focus:w-48 transition-all"
                  />
                  <button onClick={() => removePopularSearch(idx)} className="text-slate-400 hover:text-red-500 p-1 bg-white rounded-full shadow-sm">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              <button 
                onClick={addPopularSearch}
                className="flex items-center gap-1 text-sm font-bold text-teal-600 hover:bg-teal-50 px-4 py-1.5 rounded-full border border-teal-100 transition-colors"
              >
                <Plus size={14} /> Add Keyword
              </button>
            </div>
          </div>
        </FormSection>

        <FormSection title="Trusted By Brands" description="The logos/names displayed at the very bottom of the hero section.">
          <div className="mb-4 text-right">
            <button 
              onClick={addTrustedBrand}
              className="text-sm font-bold text-teal-600 flex items-center gap-1 hover:bg-teal-50 px-3 py-1.5 rounded-lg ml-auto border border-teal-100"
            >
              <Plus size={14} /> Add Brand
            </button>
          </div>
          <div className="space-y-3">
            {(data.trustedBrands || []).map((brand: any, idx: number) => (
              <div key={idx} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-slate-50 border border-slate-200 p-3 rounded-xl relative group">
                <div className="flex-1 w-full md:w-auto">
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Brand Name</label>
                  <Input value={brand.name} onChange={(e) => updateTrustedBrand(idx, "name", e.target.value)} placeholder="e.g. Meta" />
                </div>
                <div className="flex-1 w-full md:w-auto">
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Wordmark Text (HTML allowed)</label>
                  <Input value={brand.wordmark} onChange={(e) => updateTrustedBrand(idx, "wordmark", e.target.value)} placeholder="e.g. 𝗠eta" />
                </div>
                <div className="flex-[1.5] w-full md:w-auto">
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Inline CSS Style</label>
                  <Input value={brand.style} onChange={(e) => updateTrustedBrand(idx, "style", e.target.value)} placeholder="e.g. font-weight:800; letter-spacing:-0.5px" />
                </div>
                <button 
                  onClick={() => removeTrustedBrand(idx)}
                  className="mt-6 text-slate-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2 md:relative md:top-0 md:right-0"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </FormSection>

      </div>
    </SettingsPageTemplate>
  );
}
