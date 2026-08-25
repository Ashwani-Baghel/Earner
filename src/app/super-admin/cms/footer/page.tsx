"use client";

import { useState, useEffect } from "react";
import { SettingsPageTemplate } from "@/components/admin/settings/SettingsPageTemplate";
import { FormSection } from "@/components/admin/settings/FormSection";
import { Input } from "@/components/ui/Input";
import { useCmsSettings } from "@/hooks/useCmsSettings";
import { Plus, Trash2 } from "lucide-react";

const DEFAULT_FOOTER = {
  logoUrl: "",
  description: "Find the perfect freelance services for your business.",
  copyright: "© 2026 Earner International Ltd.",
  showNewsletter: true,
  newsletterTitle: "Subscribe to Newsletter",
  newsletterDesc: "Get the latest updates and offers directly in your inbox.",
  columns: [
    {
      title: "Categories",
      links: [
        { label: "Graphics & Design", url: "#" },
        { label: "Digital Marketing", url: "#" },
      ]
    },
    {
      title: "About",
      links: [
        { label: "Careers", url: "#" },
        { label: "Press & News", url: "#" },
      ]
    }
  ]
};

export default function FooterCMS() {
  const { data, setData, loading, saving, handleChange, handleSave } = useCmsSettings("FOOTER", DEFAULT_FOOTER);

  // Helper for deeply nested state updates
  const setSocial = (key: string, value: string) => {
    setData((prev: any) => ({ ...prev, social: { ...(prev.social || {}), [key]: value } }));
  };

  const addColumn = () => {
    setData((prev: any) => ({ ...prev, columns: [...(prev.columns || []), { title: "", links: [] }] }));
  };

  const removeColumn = (colIdx: number) => {
    setData((prev: any) => ({ ...prev, columns: prev.columns.filter((_: any, i: number) => i !== colIdx) }));
  };

  const updateColumnTitle = (colIdx: number, title: string) => {
    setData((prev: any) => {
      const newCols = [...prev.columns];
      newCols[colIdx].title = title;
      return { ...prev, columns: newCols };
    });
  };

  const addLink = (colIdx: number) => {
    setData((prev: any) => {
      const newCols = [...prev.columns];
      newCols[colIdx].links.push({ label: "", url: "" });
      return { ...prev, columns: newCols };
    });
  };

  const updateLink = (colIdx: number, linkIdx: number, field: "label" | "url", value: string) => {
    setData((prev: any) => {
      const newCols = [...prev.columns];
      newCols[colIdx].links[linkIdx][field] = value;
      return { ...prev, columns: newCols };
    });
  };

  const removeLink = (colIdx: number, linkIdx: number) => {
    setData((prev: any) => {
      const newCols = [...prev.columns];
      newCols[colIdx].links = newCols[colIdx].links.filter((_: any, i: number) => i !== linkIdx);
      return { ...prev, columns: newCols };
    });
  };

  return (
    <SettingsPageTemplate 
      title="Footer Builder" 
      loading={loading} 
      saving={saving} 
      onSave={handleSave}
    >
      <div className="mb-6 pb-6 border-b border-slate-100">
        <p className="text-slate-500 text-sm">Configure the website footer links, logo, newsletter, and social profiles.</p>
      </div>

      <div className="space-y-6">
        <FormSection title="Brand Identity" description="Logo, description, and copyright text.">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Footer Logo URL</label>
              <Input name="logoUrl" value={data.logoUrl || ""} onChange={handleChange} placeholder="https://..." />
              <p className="text-xs text-slate-500 mt-1">Leave empty to use the main site logo.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Footer Description</label>
              <textarea 
                name="description" 
                value={data.description || ""} 
                onChange={handleChange as any} 
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm resize-y"
                rows={3}
                placeholder="Short bio about the platform..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Copyright Text</label>
              <Input name="copyright" value={data.copyright || ""} onChange={handleChange} />
            </div>
          </div>
        </FormSection>

        <FormSection title="Newsletter Widget" description="Enable a newsletter subscription box in the footer.">
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input type="checkbox" name="showNewsletter" checked={data.showNewsletter || false} onChange={handleChange} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              </div>
              <span className="text-sm font-medium text-slate-700">Show Newsletter Subscribe Form</span>
            </label>
            
            {data.showNewsletter && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Newsletter Title</label>
                  <Input name="newsletterTitle" value={data.newsletterTitle || ""} onChange={handleChange} placeholder="Subscribe to Newsletter" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Newsletter Description</label>
                  <Input name="newsletterDesc" value={data.newsletterDesc || ""} onChange={handleChange} placeholder="Get the latest updates..." />
                </div>
              </div>
            )}
          </div>
        </FormSection>

        <FormSection title="Footer Columns & Links" description="Organize your links into columns.">
          <div className="mb-4 text-right">
            <button 
              onClick={addColumn}
              className="text-sm font-bold text-teal-600 flex items-center gap-1 hover:bg-teal-50 px-3 py-1.5 rounded-lg ml-auto"
            >
              <Plus size={14} /> Add Column
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(data.columns || []).map((col: any, colIdx: number) => (
              <div key={colIdx} className="border border-slate-200 rounded-xl p-4 bg-slate-50 relative group">
                <button 
                  onClick={() => removeColumn(colIdx)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove Column"
                >
                  <Trash2 size={16} />
                </button>
                
                <input 
                  type="text" 
                  value={col.title} 
                  onChange={e => updateColumnTitle(colIdx, e.target.value)}
                  placeholder="Column Title (e.g. Categories)"
                  className="font-bold text-slate-900 bg-transparent border-b border-slate-300 focus:border-teal-500 outline-none pb-1 mb-4 w-[85%] text-lg"
                />
                
                <div className="space-y-2">
                  {(col.links || []).map((link: any, linkIdx: number) => (
                    <div key={linkIdx} className="flex items-center gap-2">
                      <input 
                        type="text" 
                        placeholder="Label"
                        value={link.label}
                        onChange={e => updateLink(colIdx, linkIdx, "label", e.target.value)}
                        className="w-1/2 border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:border-teal-500 outline-none"
                      />
                      <input 
                        type="text" 
                        placeholder="URL"
                        value={link.url}
                        onChange={e => updateLink(colIdx, linkIdx, "url", e.target.value)}
                        className="w-1/2 border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:border-teal-500 outline-none"
                      />
                      <button 
                        onClick={() => removeLink(colIdx, linkIdx)}
                        className="text-slate-400 hover:text-red-500 p-1 flex-shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  
                  <button 
                    onClick={() => addLink(colIdx)}
                    className="text-xs font-bold text-slate-500 hover:text-teal-600 mt-2 flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Link
                  </button>
                </div>
              </div>
            ))}
          </div>
        </FormSection>
      </div>
    </SettingsPageTemplate>
  );
}
