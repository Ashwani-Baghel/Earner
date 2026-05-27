"use client";

import { useEffect, useState } from "react";
import { GigFormData } from "../GigCreationWizard";

interface Props {
  data: GigFormData;
  updateForm: (data: Partial<GigFormData>) => void;
  nextStep: () => void;
}

export function BasicInfoStep({ data, updateForm, nextStep }: Props) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((cats) => {
        setCategories(Array.isArray(cats) ? cats : []);
        setLoading(false);
      });
  }, []);

  const activeCategory = categories.find((c) => c.id === data.categoryId);
  const subcategories = activeCategory?.subcategories || [];

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = tagInput.trim();
      if (val && !data.tags.includes(val) && data.tags.length < 5) {
        updateForm({ tags: [...data.tags, val] });
        setTagInput("");
      }
    }
  };

  const removeTag = (tag: string) => {
    updateForm({ tags: data.tags.filter((t) => t !== tag) });
  };

  const isFormValid = data.title.trim().length >= 15 && data.categoryId && data.tags.length > 0;

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-[#404145] mb-8">Basic Info</h2>

      <div className="space-y-8">
        {/* Gig Title */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 border-b border-[#e4e5e7] pb-8">
          <div className="md:col-span-1">
            <h3 className="font-semibold text-[#404145]">Gig Title</h3>
            <p className="text-sm text-[#74767e] mt-1">As your Gig storefront, your title is the most important place to include keywords that buyers would likely use to search for a service like yours.</p>
          </div>
          <div className="md:col-span-2 relative">
            <textarea
              required
              maxLength={80}
              placeholder="I will do something I'm really good at"
              value={data.title}
              onChange={(e) => updateForm({ title: e.target.value })}
              className="w-full h-24 border border-[#c5c6c9] rounded-md p-3 text-lg font-medium focus:border-[#404145] outline-none resize-none"
            />
            <div className="absolute bottom-2 right-3 text-xs font-semibold text-[#b5b6ba]">
              {data.title.length}/80 max
            </div>
          </div>
        </div>

        {/* Category */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 border-b border-[#e4e5e7] pb-8">
          <div className="md:col-span-1">
            <h3 className="font-semibold text-[#404145]">Category</h3>
            <p className="text-sm text-[#74767e] mt-1">Choose the category and sub-category most suitable for your Gig.</p>
          </div>
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <select
              required
              value={data.categoryId}
              onChange={(e) => updateForm({ categoryId: e.target.value, subcategoryId: "" })}
              className="border border-[#c5c6c9] rounded-md px-4 py-3 focus:border-[#404145] outline-none bg-white"
              disabled={loading}
            >
              <option value="" disabled>Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              value={data.subcategoryId}
              onChange={(e) => updateForm({ subcategoryId: e.target.value })}
              className="border border-[#c5c6c9] rounded-md px-4 py-3 focus:border-[#404145] outline-none bg-white disabled:bg-gray-100"
              disabled={!data.categoryId || subcategories.length === 0}
            >
              <option value="" disabled>Select a subcategory</option>
              {subcategories.map((sc: any) => (
                <option key={sc.id} value={sc.id}>{sc.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Tags */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 pb-8">
          <div className="md:col-span-1">
            <h3 className="font-semibold text-[#404145]">Search Tags</h3>
            <p className="text-sm text-[#74767e] mt-1">Tag your Gig with buzz words that are relevant to the services you offer. Use all 5 tags to get found.</p>
          </div>
          <div className="md:col-span-2">
            <div className="border border-[#c5c6c9] rounded-md p-2 focus-within:border-[#404145] flex flex-wrap gap-2 items-center bg-white">
              {data.tags.map((tag) => (
                <span key={tag} className="bg-gray-100 text-[#404145] text-sm px-3 py-1 rounded-full flex items-center gap-1 font-medium">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="text-gray-400 hover:text-red-500">&times;</button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={data.tags.length < 5 ? "Type and press enter..." : "Max 5 tags reached"}
                className="flex-1 min-w-[150px] outline-none text-sm p-1 bg-transparent"
                disabled={data.tags.length >= 5}
              />
            </div>
            <div className="text-xs font-semibold text-[#b5b6ba] mt-2 text-right">
              {5 - data.tags.length} tags remaining
            </div>
          </div>
        </div>

      </div>

      {/* Footer Nav */}
      <div className="flex justify-end mt-8">
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
