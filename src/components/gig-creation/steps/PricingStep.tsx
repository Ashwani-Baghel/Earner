"use client";

import { useState } from "react";
import { GigFormData } from "../GigCreationWizard";
import { Check, Plus } from "lucide-react";

interface Props {
  data: GigFormData;
  updateForm: (data: Partial<GigFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const Tiers = ["BASIC", "STANDARD", "PREMIUM"] as const;

export function PricingStep({ data, updateForm, nextStep, prevStep }: Props) {
  const [activeTierIdx, setActiveTierIdx] = useState(0);
  const activeTier = Tiers[activeTierIdx];
  const pkg = data.packages[activeTierIdx];

  const updatePackage = (updates: any) => {
    const newPackages = [...data.packages];
    newPackages[activeTierIdx] = { ...pkg, ...updates };
    updateForm({ packages: newPackages });
  };

  const handleAddFeature = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = e.currentTarget.value.trim();
      if (val && !pkg.features.includes(val)) {
        updatePackage({ features: [...pkg.features, val] });
        e.currentTarget.value = "";
      }
    }
  };

  const removeFeature = (feature: string) => {
    updatePackage({ features: pkg.features.filter((f) => f !== feature) });
  };

  // Basic validation for the active tier
  const isTierValid = pkg.name.trim() && pkg.description.trim() && pkg.price && pkg.deliveryDays;
  const isFormValid = data.packages.every(p => p.name.trim() && p.description.trim() && p.price && p.deliveryDays);

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-[#404145] mb-2">Scope & Pricing</h2>
      <p className="text-sm text-[#74767e] mb-8">Offer packages to cater to different buyer needs.</p>

      {/* Tiers Tabs */}
      <div className="flex border-b border-[#e4e5e7] mb-6">
        {Tiers.map((tier, idx) => (
          <button
            key={tier}
            onClick={() => setActiveTierIdx(idx)}
            className={`flex-1 py-4 text-center font-bold tracking-wider transition-colors border-b-2 ${
              activeTierIdx === idx ? "border-[#1dbf73] text-[#1dbf73]" : "border-transparent text-[#74767e] hover:bg-gray-50"
            }`}
          >
            {tier}
          </button>
        ))}
      </div>

      <div className="space-y-6 bg-gray-50 p-6 rounded-lg border border-[#e4e5e7]">
        {/* Package Name & Desc */}
        <div>
          <label className="block text-xs font-bold text-[#404145] uppercase tracking-wider mb-2">Package Name</label>
          <input
            type="text"
            placeholder="e.g. Basic Logo Design"
            value={pkg.name}
            onChange={(e) => updatePackage({ name: e.target.value })}
            className="w-full border border-[#c5c6c9] rounded-md px-4 py-2 focus:border-[#404145] outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#404145] uppercase tracking-wider mb-2">Description</label>
          <textarea
            placeholder="Describe the details of your offering..."
            value={pkg.description}
            onChange={(e) => updatePackage({ description: e.target.value })}
            className="w-full h-20 border border-[#c5c6c9] rounded-md p-3 focus:border-[#404145] outline-none resize-none text-sm"
          />
        </div>

        {/* Time, Revisions, Price */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#404145] uppercase tracking-wider mb-2">Delivery Time</label>
            <select
              value={pkg.deliveryDays}
              onChange={(e) => updatePackage({ deliveryDays: e.target.value })}
              className="w-full border border-[#c5c6c9] rounded-md px-4 py-2 focus:border-[#404145] outline-none bg-white"
            >
              <option value="" disabled>Select</option>
              {[1, 2, 3, 5, 7, 10, 14, 21, 30].map(d => (
                <option key={d} value={d}>{d} Day{d > 1 && 's'} Delivery</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#404145] uppercase tracking-wider mb-2">Revisions</label>
            <select
              value={pkg.revisions}
              onChange={(e) => updatePackage({ revisions: e.target.value })}
              className="w-full border border-[#c5c6c9] rounded-md px-4 py-2 focus:border-[#404145] outline-none bg-white"
            >
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="5">5</option>
              <option value="-1">Unlimited</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#404145] uppercase tracking-wider mb-2">Price (₹)</label>
            <input
              type="number"
              min="100"
              step="50"
              placeholder="500"
              value={pkg.price}
              onChange={(e) => updatePackage({ price: e.target.value })}
              className="w-full border border-[#c5c6c9] rounded-md px-4 py-2 focus:border-[#404145] outline-none"
            />
          </div>
        </div>

        {/* Features */}
        <div>
          <label className="block text-xs font-bold text-[#404145] uppercase tracking-wider mb-2">Included Features</label>
          <div className="space-y-2 mb-3">
            {pkg.features.map(f => (
              <div key={f} className="flex items-center gap-2 text-sm text-[#404145]">
                <Check size={16} className="text-[#1dbf73]" />
                <span>{f}</span>
                <button onClick={() => removeFeature(f)} className="ml-auto text-gray-400 hover:text-red-500 text-xs">Remove</button>
              </div>
            ))}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Add feature and press Enter (e.g. Source File)"
              onKeyDown={handleAddFeature}
              className="w-full border border-[#c5c6c9] rounded-md px-4 py-2 text-sm focus:border-[#404145] outline-none"
            />
            <Plus size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      {!isTierValid && (
        <p className="text-red-500 text-sm mt-4 text-center">Please fill out all required fields for the {activeTier} package.</p>
      )}

      {/* Footer Nav */}
      <div className="flex justify-between mt-8 border-t border-[#e4e5e7] pt-6">
        <button
          onClick={prevStep}
          className="text-[#1dbf73] font-bold px-6 py-3 rounded-md hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={nextStep}
          disabled={!isFormValid}
          className="bg-[#1dbf73] hover:bg-[#19a463] text-white px-6 py-3 rounded-md font-bold disabled:opacity-50 transition-colors"
        >
          Save & Continue
        </button>
      </div>
    </div>
  );
}
