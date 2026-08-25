"use client";

import { useState } from "react";
import { SettingsPageTemplate } from "@/components/admin/settings/SettingsPageTemplate";
import { FormSection } from "@/components/admin/settings/FormSection";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useCmsSettings } from "@/hooks/useCmsSettings";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

const DEFAULT_PAGES = {
  about: { title: "About Us", content: "" },
  terms: { title: "Terms of Service", content: "" },
  privacy: { title: "Privacy Policy", content: "" }
};

const TABS = [
  { id: "about", label: "About Us" },
  { id: "terms", label: "Terms of Service" },
  { id: "privacy", label: "Privacy Policy" }
];

export default function StaticPagesCMS() {
  const { data, setData, loading, saving, handleSave } = useCmsSettings("STATIC_PAGES", DEFAULT_PAGES);
  const [activeTab, setActiveTab] = useState<keyof typeof DEFAULT_PAGES>("about");

  const handleChange = (field: "title" | "content", value: string) => {
    setData((prev: any) => ({
      ...prev,
      [activeTab]: {
        ...(prev[activeTab] || {}),
        [field]: value
      }
    }));
  };

  const currentData = data[activeTab] || DEFAULT_PAGES[activeTab];

  return (
    <SettingsPageTemplate 
      title="Static Pages" 
      loading={loading} 
      saving={saving} 
      onSave={handleSave}
    >
      <div className="mb-6 pb-6 border-b border-slate-100">
        <p className="text-slate-500 text-sm">Edit the content of your platform's static policies and pages.</p>
      </div>

      <div className="space-y-6">
        <FormSection title="Select Page to Edit" description="Choose which static page content you want to modify.">
          <div className="flex flex-wrap gap-2">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-colors ${
                  activeTab === tab.id 
                    ? "bg-teal-50 border-teal-200 text-teal-700" 
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </FormSection>

        <FormSection title={`Edit ${TABS.find(t => t.id === activeTab)?.label}`} description="Update the title and content. HTML is supported in the content field.">
          <div className="space-y-4 max-w-4xl">
            <div className="space-y-1.5">
              <Label htmlFor="title">Page Title</Label>
              <Input 
                id="title"
                value={currentData.title || ""} 
                onChange={(e) => handleChange("title", e.target.value)} 
                placeholder="e.g. About Us" 
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="content">Page Content</Label>
              <RichTextEditor 
                value={currentData.content || ""} 
                onChange={(value) => handleChange("content", value)} 
                placeholder="Write your page content here... Try pasting from Word or Google Docs!"
              />
            </div>
          </div>
        </FormSection>
      </div>
    </SettingsPageTemplate>
  );
}
