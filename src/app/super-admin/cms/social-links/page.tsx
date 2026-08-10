"use client";

import { SettingsPageTemplate } from "@/components/admin/settings/SettingsPageTemplate";
import { FormSection } from "@/components/admin/settings/FormSection";
import { Input } from "@/components/ui/Input";
import { useCmsSettings } from "@/hooks/useCmsSettings";
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Github } from "lucide-react";

const DEFAULT_SOCIALS = {
  facebook: "https://facebook.com/earner",
  twitter: "https://twitter.com/earner",
  instagram: "https://instagram.com/earner",
  linkedin: "https://linkedin.com/company/earner",
  youtube: "",
  github: "",
};

export default function SocialLinksCMS() {
  const { data, loading, saving, handleChange, handleSave } = useCmsSettings("social-links", DEFAULT_SOCIALS);

  return (
    <SettingsPageTemplate 
      title="Social Links" 
      loading={loading} 
      saving={saving} 
      onSave={handleSave}
    >
      <div className="mb-6 pb-6 border-b border-slate-100">
        <p className="text-slate-500 text-sm">Manage the official social media profiles linked in the footer and emails. Leave empty to hide.</p>
      </div>

      <div className="space-y-6">
        <FormSection title="Primary Networks" description="Main social platforms for your brand.">
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1"><Facebook size={16} className="text-blue-600"/> Facebook URL</label>
              <Input name="facebook" value={data.facebook} onChange={handleChange} placeholder="https://facebook.com/..." />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1"><Twitter size={16} className="text-sky-500"/> Twitter / X URL</label>
              <Input name="twitter" value={data.twitter} onChange={handleChange} placeholder="https://twitter.com/..." />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1"><Instagram size={16} className="text-pink-600"/> Instagram URL</label>
              <Input name="instagram" value={data.instagram} onChange={handleChange} placeholder="https://instagram.com/..." />
            </div>
          </div>
        </FormSection>

        <FormSection title="Professional & Media" description="Professional networks and video platforms.">
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1"><Linkedin size={16} className="text-blue-700"/> LinkedIn URL</label>
              <Input name="linkedin" value={data.linkedin} onChange={handleChange} placeholder="https://linkedin.com/company/..." />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1"><Youtube size={16} className="text-red-600"/> YouTube URL</label>
              <Input name="youtube" value={data.youtube} onChange={handleChange} placeholder="https://youtube.com/c/..." />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1"><Github size={16} className="text-slate-800"/> GitHub URL</label>
              <Input name="github" value={data.github} onChange={handleChange} placeholder="https://github.com/..." />
            </div>
          </div>
        </FormSection>
      </div>
    </SettingsPageTemplate>
  );
}
