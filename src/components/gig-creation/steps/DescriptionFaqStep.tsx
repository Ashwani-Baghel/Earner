"use client";

import { useState } from "react";
import { GigFormData } from "../GigCreationWizard";
import { Trash2, Plus } from "lucide-react";

interface Props {
  data: GigFormData;
  updateForm: (data: Partial<GigFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export function DescriptionFaqStep({ data, updateForm, nextStep, prevStep }: Props) {
  const [faqInput, setFaqInput] = useState({ question: "", answer: "" });
  const [showFaqForm, setShowFaqForm] = useState(false);

  const addFaq = () => {
    if (faqInput.question.trim() && faqInput.answer.trim()) {
      updateForm({ faqs: [...data.faqs, faqInput] });
      setFaqInput({ question: "", answer: "" });
      setShowFaqForm(false);
    }
  };

  const removeFaq = (idx: number) => {
    const newFaqs = [...data.faqs];
    newFaqs.splice(idx, 1);
    updateForm({ faqs: newFaqs });
  };

  const isFormValid = data.description.trim().length >= 120;

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-[#404145] mb-8">Description & FAQ</h2>

      {/* Description */}
      <div className="border-b border-[#e4e5e7] pb-8 mb-8">
        <h3 className="font-semibold text-[#404145] mb-2">Briefly Describe Your Gig</h3>
        <textarea
          required
          placeholder="I will provide outstanding service..."
          value={data.description}
          onChange={(e) => updateForm({ description: e.target.value })}
          className="w-full h-64 border border-[#c5c6c9] rounded-md p-4 focus:border-[#404145] outline-none resize-none leading-relaxed"
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-[#74767e]">Min. 120 characters.</p>
          <span className="text-xs font-semibold text-[#b5b6ba]">
            {data.description.length} / 1200
          </span>
        </div>
      </div>

      {/* FAQ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#404145] text-lg">Frequently Asked Questions</h3>
          <button
            onClick={() => setShowFaqForm(true)}
            className="text-[#1dbf73] font-semibold text-sm hover:underline flex items-center gap-1"
          >
            <Plus size={16} /> Add FAQ
          </button>
        </div>

        {data.faqs.length > 0 && (
          <div className="space-y-4 mb-6">
            {data.faqs.map((faq, idx) => (
              <div key={idx} className="bg-white border border-[#e4e5e7] rounded-md p-4 relative group">
                <h4 className="font-bold text-[#404145] pr-8">{faq.question}</h4>
                <p className="text-[#74767e] text-sm mt-2">{faq.answer}</p>
                <button
                  onClick={() => removeFaq(idx)}
                  className="absolute top-4 right-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {showFaqForm && (
          <div className="bg-gray-50 border border-[#e4e5e7] rounded-md p-5 mt-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#404145] mb-2">Question</label>
                <input
                  type="text"
                  placeholder="Do you provide source files?"
                  value={faqInput.question}
                  onChange={(e) => setFaqInput({ ...faqInput, question: e.target.value })}
                  className="w-full border border-[#c5c6c9] rounded-md px-4 py-2 focus:border-[#404145] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#404145] mb-2">Answer</label>
                <textarea
                  placeholder="Yes, the premium package includes source files."
                  value={faqInput.answer}
                  onChange={(e) => setFaqInput({ ...faqInput, answer: e.target.value })}
                  className="w-full h-20 border border-[#c5c6c9] rounded-md px-4 py-2 focus:border-[#404145] outline-none resize-none"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setShowFaqForm(false)}
                  className="px-4 py-2 text-sm font-semibold text-[#74767e] hover:text-[#404145]"
                >
                  Cancel
                </button>
                <button
                  onClick={addFaq}
                  disabled={!faqInput.question.trim() || !faqInput.answer.trim()}
                  className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-semibold disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Nav */}
      <div className="flex justify-between mt-12 border-t border-[#e4e5e7] pt-6">
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
