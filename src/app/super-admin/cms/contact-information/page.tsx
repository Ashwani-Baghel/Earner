"use client";

import { SettingsPageTemplate } from "@/components/admin/settings/SettingsPageTemplate";
import { FormSection } from "@/components/admin/settings/FormSection";
import { Input } from "@/components/ui/Input";
import { useCmsSettings } from "@/hooks/useCmsSettings";

const DEFAULT_CONTACT = {
  supportEmail: "support@earner.com",
  salesEmail: "sales@earner.com",
  supportPhone: "+1 (555) 123-4567",
  physicalAddress: "123 Freelance Blvd, Suite 400\nSan Francisco, CA 94107",
  workingHours: "Monday - Friday, 9:00 AM to 5:00 PM (PST)",
  googleMapsUrl: "",
};

export default function ContactInformationCMS() {
  const { data, loading, saving, handleChange, handleSave } = useCmsSettings("contact-information", DEFAULT_CONTACT);

  return (
    <SettingsPageTemplate 
      title="Contact Information" 
      loading={loading} 
      saving={saving} 
      onSave={handleSave}
    >
      <div className="mb-6 pb-6 border-b border-slate-100">
        <p className="text-slate-500 text-sm">Manage global contact details displayed on the Contact Us page and footer.</p>
      </div>

      <div className="space-y-6">
        <FormSection title="Email Addresses" description="Main contact emails for different departments.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Support Email</label>
              <Input name="supportEmail" value={data.supportEmail} onChange={handleChange} placeholder="support@..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sales/Business Email</label>
              <Input name="salesEmail" value={data.salesEmail} onChange={handleChange} placeholder="sales@..." />
            </div>
          </div>
        </FormSection>

        <FormSection title="Location & Phone" description="Physical address and direct contact numbers.">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Support Phone Number</label>
              <Input name="supportPhone" value={data.supportPhone} onChange={handleChange} placeholder="+1..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Working Hours</label>
              <Input name="workingHours" value={data.workingHours} onChange={handleChange} placeholder="e.g. Mon-Fri 9-5..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Physical Address</label>
              <textarea 
                name="physicalAddress" 
                value={data.physicalAddress} 
                onChange={handleChange as any} 
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm"
                rows={3}
              />
            </div>
          </div>
        </FormSection>
      </div>
    </SettingsPageTemplate>
  );
}
