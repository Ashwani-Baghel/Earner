"use client";

import { SettingsPageTemplate } from "@/components/admin/settings/SettingsPageTemplate";
import { FormSection } from "@/components/admin/settings/FormSection";
import { Input } from "@/components/ui/Input";
import { useCmsSettings } from "@/hooks/useCmsSettings";
import { Share2, MessageCircle, Camera, Briefcase, PlayCircle, Code, Plus, Trash2, Link as LinkIcon, UploadCloud, Loader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const DEFAULT_PREDEFINED = [
  { id: "facebook", label: "Facebook", icon: Share2, color: "text-blue-600" },
  { id: "twitter", label: "Twitter / X", icon: MessageCircle, color: "text-sky-500" },
  { id: "instagram", label: "Instagram", icon: Camera, color: "text-pink-600" },
  { id: "linkedin", label: "LinkedIn", icon: Briefcase, color: "text-blue-700" },
  { id: "youtube", label: "YouTube", icon: PlayCircle, color: "text-red-600" },
  { id: "github", label: "GitHub", icon: Code, color: "text-slate-800" },
];

const DEFAULT_SOCIALS = {
  links: []
};

export default function SocialLinksCMS() {
  const { data, setData, loading, saving, handleSave } = useCmsSettings("social-links", DEFAULT_SOCIALS);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  
  // Normalize data: support { links: [...] } and legacy { facebook: "url" }
  const rawData = data || {};
  let socialLinks: any[] = [];
  
  if (Array.isArray(rawData.links)) {
    socialLinks = rawData.links;
  } else {
    // Migrate legacy data
    const legacyKeys = Object.keys(rawData).filter(k => k !== "links" && typeof rawData[k] === "string");
    if (legacyKeys.length > 0) {
      socialLinks = legacyKeys.map(key => ({
        id: key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
        url: rawData[key],
        iconUrl: ""
      }));
    }
  }

  const updateLinks = (newLinks: any[]) => {
    setData({ links: newLinks });
  };

  const handleAddPredefined = (platformId: string) => {
    if (!platformId) return;
    const meta = DEFAULT_PREDEFINED.find(p => p.id === platformId);
    if (!meta) return;
    
    updateLinks([...socialLinks, {
      id: meta.id,
      label: meta.label,
      url: "",
      iconUrl: ""
    }]);
  };

  const handleAddCustom = () => {
    const newId = "custom-" + Date.now();
    updateLinks([...socialLinks, {
      id: newId,
      label: "Custom Link",
      url: "",
      iconUrl: ""
    }]);
  };

  const handleRemove = (id: string) => {
    updateLinks(socialLinks.filter(l => l.id !== id));
  };

  const handleChangeField = (id: string, field: string, value: string) => {
    updateLinks(socialLinks.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const handleUploadImage = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    
    setUploadingId(id);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (res.ok && json.url) {
        handleChangeField(id, "iconUrl", json.url);
      } else {
        toast.error(json.error || "Failed to upload logo.");
      }
    } catch (error) {
      toast.error("Error uploading image.");
    } finally {
      setUploadingId(null);
    }
  };

  const activeIds = socialLinks.map(l => l.id);
  const availablePredefined = DEFAULT_PREDEFINED.filter(p => !activeIds.includes(p.id));

  return (
    <SettingsPageTemplate 
      title="Social Links" 
      loading={loading} 
      saving={saving} 
      onSave={handleSave}
    >
      <div className="mb-6 pb-6 border-b border-slate-100">
        <p className="text-slate-500 text-sm">Manage the official social media profiles linked in the footer. You can upload custom logos for any link.</p>
      </div>

      <div className="space-y-6">
        <FormSection title="Active Social Links" description="These links will be displayed in the platform footer.">
          <div className="space-y-4">
            {socialLinks.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No social links added yet. Add one below.</p>
            ) : (
              socialLinks.map(link => {
                const isCustom = link.id.startsWith("custom-");
                const predefinedMeta = DEFAULT_PREDEFINED.find(p => p.id === link.id);
                const Icon = predefinedMeta ? predefinedMeta.icon : LinkIcon;
                const iconColor = predefinedMeta ? predefinedMeta.color : "text-slate-700";
                
                return (
                  <div key={link.id} className="flex flex-col md:flex-row gap-4 p-5 border border-slate-200 rounded-xl bg-slate-50/50 shadow-sm">
                    {/* Logo Upload Section */}
                    <div className="w-full md:w-32 flex-shrink-0 flex flex-col gap-2">
                      <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 bg-white flex items-center justify-center relative overflow-hidden group hover:border-teal-400 transition-colors mx-auto md:mx-0">
                        {link.iconUrl ? (
                          <img src={link.iconUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                        ) : (
                          <Icon size={24} className={`opacity-40 group-hover:opacity-100 transition-opacity ${iconColor}`} />
                        )}
                        
                        <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                          {uploadingId === link.id ? (
                            <Loader2 size={16} className="text-white animate-spin" />
                          ) : (
                            <UploadCloud size={16} className="text-white" />
                          )}
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUploadImage(link.id, e)} disabled={uploadingId === link.id} />
                        </label>
                      </div>
                      <p className="text-[10px] text-center md:text-left text-slate-400 font-medium">Custom Logo (Opt)</p>
                    </div>

                    {/* Inputs Section */}
                    <div className="flex-grow space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">Display Label</label>
                        <Input 
                          value={link.label} 
                          onChange={(e) => handleChangeField(link.id, "label", e.target.value)} 
                          placeholder={isCustom ? "e.g. My Website" : `${predefinedMeta?.label}`} 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">Link URL</label>
                        <Input 
                          value={link.url || ""} 
                          onChange={(e) => handleChangeField(link.id, "url", e.target.value)} 
                          placeholder="https://..." 
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-6">
                      <button 
                        onClick={() => handleRemove(link.id)}
                        className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-slate-200 hover:border-red-200 bg-white shadow-sm"
                        title="Remove this link"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}

            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row gap-4">
              <div className="flex-grow flex gap-2">
                <select 
                  id="new-platform-select"
                  className="flex-grow h-[42px] px-3 rounded-lg border border-slate-200 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                  defaultValue=""
                >
                  <option value="" disabled>Select predefined platform...</option>
                  {availablePredefined.map(p => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
                <button 
                  onClick={() => {
                    const select = document.getElementById("new-platform-select") as HTMLSelectElement;
                    if (select && select.value) {
                      handleAddPredefined(select.value);
                      select.value = "";
                    }
                  }}
                  disabled={availablePredefined.length === 0}
                  className="h-[42px] px-4 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-medium rounded-lg text-sm transition-colors flex items-center gap-2"
                >
                  <Plus size={16} /> Add 
                </button>
              </div>
              
              <div className="flex items-center px-4 text-slate-300 font-medium text-sm">OR</div>
              
              <button 
                onClick={handleAddCustom}
                className="h-[42px] px-6 bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold rounded-lg text-sm transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <Plus size={16} /> Add Custom Link
              </button>
            </div>
          </div>
        </FormSection>
      </div>
    </SettingsPageTemplate>
  );
}
