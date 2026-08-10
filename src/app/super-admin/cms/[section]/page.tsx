"use client";

import { use } from "react";
import { SettingsPageTemplate } from "@/components/admin/settings/SettingsPageTemplate";

const CMS_PAGES_DATA: Record<string, { title: string, description: string }> = {
  "homepage-builder": {
    title: "Homepage Builder",
    description: "Drag and drop sections to rearrange your homepage layout.",
  },
  "navigation-menus": {
    title: "Navigation Menus",
    description: "Manage top, bottom, and sidebar navigation menus.",
  },
  "banners-sliders": {
    title: "Banners & Sliders",
    description: "Upload and configure rotating promotional banners.",
  },
  "testimonials": {
    title: "Testimonials",
    description: "Manage client reviews and success stories displayed on the frontend.",
  },
  "faqs": {
    title: "FAQs",
    description: "Create and organize Frequently Asked Questions.",
  },
  "blogs": {
    title: "Blogs",
    description: "Publish and manage blog articles and categories.",
  },
  "static-pages": {
    title: "Static Pages",
    description: "Edit About Us, Terms of Service, Privacy Policy, and other static pages.",
  },
  "contact-information": {
    title: "Contact Information",
    description: "Update the global contact details, maps, and support addresses.",
  },
  "announcement-bar": {
    title: "Announcement Bar",
    description: "Configure the top-level notification bar across the site.",
  },
  "social-links": {
    title: "Social Links",
    description: "Manage social media icons and profile links.",
  },
  "theme-customization": {
    title: "Theme Customization",
    description: "Adjust global colors, typography, and visual styles.",
  }
};

export default function DynamicCMSPage({ params }: { params: Promise<{ section: string }> }) {
  const { section: sectionKey } = use(params);
  
  const data = CMS_PAGES_DATA[sectionKey] || {
    title: sectionKey.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    description: "This CMS module is currently under development.",
  };

  return (
    <SettingsPageTemplate 
      title={data.title} 
      loading={false} 
      saving={false} 
      onSave={() => alert("This is a placeholder page. Backend wiring is required.")}
    >
      <div className="mb-6 pb-6 border-b border-slate-100">
        <p className="text-slate-500 text-sm">{data.description}</p>
      </div>

      <div className="py-20 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚧</span>
        </div>
        <h2 className="text-lg font-bold text-slate-800">Coming Soon</h2>
        <p className="text-slate-500 text-sm mt-2">This website content module is not yet available.</p>
      </div>
    </SettingsPageTemplate>
  );
}
