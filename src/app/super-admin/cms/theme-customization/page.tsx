"use client";

import { SettingsPageTemplate } from "@/components/admin/settings/SettingsPageTemplate";
import { FormSection } from "@/components/admin/settings/FormSection";
import { useCmsSettings } from "@/hooks/useCmsSettings";

const DEFAULT_THEME = {
  brandPrimary: "#0d9488",
  brandDark: "#0f766e",
  brandLight: "#ccfbf1",
  textMain: "#1e293b",
  textMuted: "#64748b",
  borderLight: "#e2e8f0",
  bgMain: "#f8fafc",
  bgWhite: "#ffffff",
  accentYellow: "#f59e0b",
  accentRed: "#ef4444",
  accentBlue: "#3b82f6",
  fontFamily: "Inter",
  headingsFont: "Inter"
};

const FONT_OPTIONS = [
  { label: "Inter (Default)", value: "Inter" },
  { label: "Roboto", value: "Roboto" },
  { label: "Poppins", value: "Poppins" },
  { label: "Open Sans", value: "Open Sans" },
  { label: "Montserrat", value: "Montserrat" },
  { label: "Nunito", value: "Nunito" },
  { label: "Playfair Display", value: "Playfair Display" },
  { label: "System UI", value: "system-ui" },
];

export default function ThemeCustomizationCMS() {
  const { data, loading, saving, handleChange, handleSave } = useCmsSettings("THEME", DEFAULT_THEME);

  const ColorInput = ({ name, label, value, description }: { name: string, label: string, value: string, description?: string }) => (
    <div className="flex flex-col gap-2 p-4 border border-slate-200 rounded-xl bg-slate-50/50 hover:border-teal-300 transition-colors">
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-white shadow-sm flex-shrink-0 cursor-pointer">
          <input 
            type="color" 
            name={name} 
            value={value || "#000000"} 
            onChange={handleChange} 
            className="absolute -inset-4 w-24 h-24 cursor-pointer"
          />
        </div>
        <div className="flex-grow">
          <label className="block text-sm font-bold text-slate-800">{label}</label>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-mono text-slate-500 bg-white px-2 py-1 rounded border border-slate-200 uppercase">
              {value || "#000000"}
            </span>
          </div>
        </div>
      </div>
      {description && <p className="text-xs text-slate-500 leading-relaxed pl-1">{description}</p>}
    </div>
  );

  return (
    <SettingsPageTemplate 
      title="Theme Customization" 
      loading={loading} 
      saving={saving} 
      onSave={handleSave}
    >
      <div className="mb-6 pb-6 border-b border-slate-100">
        <p className="text-slate-500 text-sm">Adjust global colors, typography, and visual styles. These settings dynamically override the platform's default CSS.</p>
      </div>

      <div className="space-y-8">
        <FormSection title="Brand Colors" description="The primary colors representing your brand identity. Used for buttons, active states, and highlights.">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ColorInput 
              name="brandPrimary" 
              label="Primary Brand Color" 
              value={data.brandPrimary} 
              description="Main color for primary buttons, links, and active elements."
            />
            <ColorInput 
              name="brandDark" 
              label="Brand Dark (Hover)" 
              value={data.brandDark} 
              description="Slightly darker shade used for hover effects on primary elements."
            />
            <ColorInput 
              name="brandLight" 
              label="Brand Light (Surface)" 
              value={data.brandLight} 
              description="Very light tint used for subtle backgrounds and badges."
            />
          </div>
        </FormSection>

        <FormSection title="Base & Surface Colors" description="Structural colors defining the background and layout separation.">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ColorInput 
              name="bgMain" 
              label="Main Background" 
              value={data.bgMain} 
              description="The general page background color (usually light grey/off-white)."
            />
            <ColorInput 
              name="bgWhite" 
              label="Surface / Card Background" 
              value={data.bgWhite} 
              description="Background color for cards, dropdowns, and modals."
            />
            <ColorInput 
              name="borderLight" 
              label="Border & Dividers" 
              value={data.borderLight} 
              description="Color for faint dividers, input borders, and outlines."
            />
          </div>
        </FormSection>

        <FormSection title="Typography Colors" description="Colors used for headings, paragraphs, and subtle text.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ColorInput 
              name="textMain" 
              label="Primary Text" 
              value={data.textMain} 
              description="High contrast color for main headings and readable paragraphs."
            />
            <ColorInput 
              name="textMuted" 
              label="Muted Text" 
              value={data.textMuted} 
              description="Lower contrast color for secondary information, timestamps, etc."
            />
          </div>
        </FormSection>

        <FormSection title="Accent Colors" description="Semantic colors for specific UI states like warnings, errors, and informational badges.">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ColorInput 
              name="accentYellow" 
              label="Warning / Ratings" 
              value={data.accentYellow} 
              description="Used for star ratings, badges, and warning states."
            />
            <ColorInput 
              name="accentRed" 
              label="Error / Danger" 
              value={data.accentRed} 
              description="Used for error messages, delete buttons, and critical alerts."
            />
            <ColorInput 
              name="accentBlue" 
              label="Info / Links" 
              value={data.accentBlue} 
              description="Used for informational highlights and some external links."
            />
          </div>
        </FormSection>

        <FormSection title="Typography & Fonts" description="Global font settings for the platform.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
              <label className="block text-sm font-bold text-slate-800 mb-2">Primary Font (Body Text)</label>
              <select 
                name="fontFamily" 
                value={data.fontFamily || "Inter"} 
                onChange={handleChange}
                className="w-full h-11 px-3 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white text-slate-700"
              >
                {FONT_OPTIONS.map(font => (
                  <option key={font.value} value={font.value}>{font.label}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-2">
                Applied to all paragraphs, buttons, and general UI elements.
              </p>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
              <label className="block text-sm font-bold text-slate-800 mb-2">Headings Font (H1 - H6)</label>
              <select 
                name="headingsFont" 
                value={data.headingsFont || "Inter"} 
                onChange={handleChange}
                className="w-full h-11 px-3 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white text-slate-700"
              >
                {FONT_OPTIONS.map(font => (
                  <option key={font.value} value={font.value}>{font.label}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-2">
                Applied specifically to all main titles, headers, and section breaks.
              </p>
            </div>
          </div>
        </FormSection>

      </div>
    </SettingsPageTemplate>
  );
}
