"use client";

import { useState, useEffect } from "react";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { PricingStep } from "./steps/PricingStep";
import { DescriptionFaqStep } from "./steps/DescriptionFaqStep";
import { RequirementsStep } from "./steps/RequirementsStep";
import { GalleryStep } from "./steps/GalleryStep";
import { PublishStep } from "./steps/PublishStep";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

export type GigFormData = {
  title: string;
  categoryId: string;
  subcategoryId: string;
  tags: string[];
  packages: {
    tier: "BASIC" | "STANDARD" | "PREMIUM";
    name: string;
    description: string;
    price: string; // Keep as string for input, convert to number on submit
    deliveryDays: string;
    revisions: string;
    features: string[];
  }[];
  description: string;
  faqs: { question: string; answer: string }[];
  requirements: { question: string; type: "TEXT" | "FILE" | "MULTIPLE_CHOICE"; required: boolean; options: string[] }[];
  media: { url: string; type: "IMAGE" | "VIDEO" | "DOCUMENT" }[];
};

const defaultData: GigFormData = {
  title: "",
  categoryId: "",
  subcategoryId: "",
  tags: [],
  packages: [
    { tier: "BASIC", name: "", description: "", price: "", deliveryDays: "", revisions: "1", features: [] },
    { tier: "STANDARD", name: "", description: "", price: "", deliveryDays: "", revisions: "2", features: [] },
    { tier: "PREMIUM", name: "", description: "", price: "", deliveryDays: "", revisions: "-1", features: [] },
  ],
  description: "",
  faqs: [],
  requirements: [],
  media: [],
};

const STEPS = ["Overview", "Pricing", "Description & FAQ", "Requirements", "Gallery", "Publish"];

export interface WizardProps {
  initialData?: GigFormData;
  gigId?: string;
}

export function GigCreationWizard({ initialData, gigId }: WizardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<GigFormData>(initialData || defaultData);
  const [isLoaded, setIsLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  const draftKey = gigId ? null : (user ? `earner_gig_draft_${user.uid}` : "earner_gig_draft");

  // Load from local storage on mount or when user changes
  useEffect(() => {
    if (user === undefined) return; // wait for auth state
    if (gigId && initialData) {
      setFormData(initialData);
      setIsLoaded(true);
      return;
    }
    
    if (draftKey) {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        try {
          setFormData(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse saved gig draft", e);
        }
      } else {
        setFormData(defaultData);
      }
    } else {
      setFormData(defaultData);
    }
    setIsLoaded(true);
  }, [user, draftKey, gigId, initialData]);

  // Save to local storage on change
  useEffect(() => {
    if (isLoaded && draftKey) {
      localStorage.setItem(draftKey, JSON.stringify(formData));
    }
  }, [formData, isLoaded, draftKey]);

  const clearForm = () => {
    if (window.confirm("Are you sure you want to clear all gig details? This action cannot be undone.")) {
      setFormData(defaultData);
      if (draftKey) localStorage.removeItem(draftKey);
      setCurrentStep(0);
    }
  };

  const clearDraftOnPublish = () => {
    setFormData(defaultData);
    if (draftKey) localStorage.removeItem(draftKey);
    setCurrentStep(0);
  };

  const handleSaveChanges = async () => {
    if (!user || !gigId) return;
    setSaving(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/gigs/${gigId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update gig");
      }
      toast.success("Gig changes saved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const updateForm = (updates: Partial<GigFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  if (!isLoaded) return null; // Prevent hydration flash

  return (
    <div className="bg-[#f7f7f7] min-h-screen pb-20">
      {/* Step Progress Bar */}
      <div className="bg-white border-b border-[#e4e5e7] sticky top-0 z-10 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sm:gap-6">
          <div className="flex-1 overflow-x-auto no-scrollbar py-1">
          <ul className="flex items-center min-w-max py-4 pr-4">
            {STEPS.map((step, idx) => (
              <li key={idx} className="flex items-center">
                <button 
                  onClick={() => setCurrentStep(idx)}
                  className="flex items-center group outline-none focus-visible:ring-2 focus-visible:ring-[#1dbf73] rounded-full pr-2"
                >
                  <div className={`flex items-center justify-center h-8 w-8 rounded-full border-2 text-sm font-bold transition-all ${
                    idx === currentStep ? "border-[#19a463] bg-[#19a463] text-white shadow-md scale-110" :
                    (gigId || idx < currentStep) ? "border-[#1dbf73] text-[#1dbf73] group-hover:bg-[#1dbf73]/10" : "border-[#e4e5e7] text-[#c5c6c9] group-hover:border-[#1dbf73] group-hover:text-[#1dbf73]"
                  }`}>
                    {idx + 1}
                  </div>
                  <span className={`ml-2 text-sm transition-colors ${
                    idx === currentStep ? "text-[#222325] font-bold" : 
                    (gigId || idx < currentStep) ? "text-[#404145] font-semibold" : "text-[#c5c6c9] font-semibold group-hover:text-[#74767e]"
                  }`}>
                    {step}
                  </span>
                </button>
                {idx < STEPS.length - 1 && (
                  <div className={`w-8 sm:w-16 h-[2px] mx-2 sm:mx-4 transition-colors ${(gigId || idx < currentStep) ? "bg-[#1dbf73]" : "bg-[#e4e5e7]"}`} />
                )}
              </li>
            ))}
          </ul>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 ml-auto bg-white py-2 pl-2">
            {gigId && (
              <button
                onClick={handleSaveChanges}
                disabled={saving}
                className="hidden md:flex flex-shrink-0 items-center justify-center px-4 py-2.5 text-sm font-bold text-white bg-[#1dbf73] hover:bg-[#19a463] rounded-lg transition-all shadow-sm disabled:opacity-50"
              >
                {saving && <Loader2 size={16} className="animate-spin mr-2" />}
                Save Changes
              </button>
            )}
            <button 
              onClick={clearForm}
              className="hidden md:flex flex-shrink-0 items-center justify-center px-4 py-2.5 text-sm font-semibold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 hover:border-red-200 rounded-lg transition-all shadow-sm"
            >
              Clear Details
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-6 px-4 flex md:hidden justify-end">
        <button 
          onClick={clearForm}
          className="text-sm font-semibold text-red-600 hover:text-red-700 bg-red-50 px-4 py-2 rounded-lg border border-red-100 shadow-sm transition-all"
        >
          Clear Gig Details
        </button>
      </div>

      <div className="max-w-4xl mx-auto mt-6 md:mt-10 px-4">
        <div className="bg-white rounded-xl shadow-sm border border-[#e4e5e7] p-6 sm:p-10">
          {currentStep === 0 && <BasicInfoStep data={formData} updateForm={updateForm} nextStep={nextStep} />}
          {currentStep === 1 && <PricingStep data={formData} updateForm={updateForm} nextStep={nextStep} prevStep={prevStep} />}
          {currentStep === 2 && <DescriptionFaqStep data={formData} updateForm={updateForm} nextStep={nextStep} prevStep={prevStep} />}
          {currentStep === 3 && <RequirementsStep data={formData} updateForm={updateForm} nextStep={nextStep} prevStep={prevStep} />}
          {currentStep === 4 && <GalleryStep data={formData} updateForm={updateForm} nextStep={nextStep} prevStep={prevStep} />}
          {currentStep === 5 && <PublishStep data={formData} prevStep={prevStep} onPublishSuccess={clearDraftOnPublish} gigId={gigId} onSaveEdit={handleSaveChanges} savingEdit={saving} />}
        </div>
      </div>
    </div>
  );
}
