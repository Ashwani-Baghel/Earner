"use client";

import { useState } from "react";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { PricingStep } from "./steps/PricingStep";
import { DescriptionFaqStep } from "./steps/DescriptionFaqStep";
import { RequirementsStep } from "./steps/RequirementsStep";
import { GalleryStep } from "./steps/GalleryStep";
import { PublishStep } from "./steps/PublishStep";

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

export function GigCreationWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<GigFormData>(defaultData);

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const updateForm = (updates: Partial<GigFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="bg-[#f7f7f7] min-h-screen pb-20">
      {/* Step Progress Bar */}
      <div className="bg-white border-b border-[#e4e5e7] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 overflow-x-auto">
          <ul className="flex items-center min-w-max py-4">
            {STEPS.map((step, idx) => (
              <li key={idx} className="flex items-center">
                <div className={`flex items-center justify-center h-8 w-8 rounded-full border-2 text-sm font-bold transition-colors ${
                  idx === currentStep ? "border-[#1dbf73] bg-[#1dbf73] text-white" :
                  idx < currentStep ? "border-[#1dbf73] text-[#1dbf73]" : "border-[#e4e5e7] text-[#c5c6c9]"
                }`}>
                  {idx + 1}
                </div>
                <span className={`ml-2 text-sm font-semibold transition-colors ${idx <= currentStep ? "text-[#404145]" : "text-[#c5c6c9]"}`}>
                  {step}
                </span>
                {idx < STEPS.length - 1 && (
                  <div className={`w-8 sm:w-16 h-[2px] mx-2 sm:mx-4 transition-colors ${idx < currentStep ? "bg-[#1dbf73]" : "bg-[#e4e5e7]"}`} />
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-8 px-4">
        <div className="bg-white rounded-lg border border-[#e4e5e7] p-6 sm:p-10">
          {currentStep === 0 && <BasicInfoStep data={formData} updateForm={updateForm} nextStep={nextStep} />}
          {currentStep === 1 && <PricingStep data={formData} updateForm={updateForm} nextStep={nextStep} prevStep={prevStep} />}
          {currentStep === 2 && <DescriptionFaqStep data={formData} updateForm={updateForm} nextStep={nextStep} prevStep={prevStep} />}
          {currentStep === 3 && <RequirementsStep data={formData} updateForm={updateForm} nextStep={nextStep} prevStep={prevStep} />}
          {currentStep === 4 && <GalleryStep data={formData} updateForm={updateForm} nextStep={nextStep} prevStep={prevStep} />}
          {currentStep === 5 && <PublishStep data={formData} prevStep={prevStep} />}
        </div>
      </div>
    </div>
  );
}
