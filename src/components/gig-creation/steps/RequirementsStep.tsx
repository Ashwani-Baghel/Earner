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

export function RequirementsStep({ data, updateForm, nextStep, prevStep }: Props) {
  const [reqInput, setReqInput] = useState<{ question: string; type: "TEXT" | "FILE" | "MULTIPLE_CHOICE"; required: boolean; options: string[] }>({
    question: "", type: "TEXT", required: true, options: []
  });
  const [showReqForm, setShowReqForm] = useState(data.requirements.length === 0);
  const [optionInput, setOptionInput] = useState("");

  const addReq = () => {
    if (reqInput.question.trim()) {
      updateForm({ requirements: [...data.requirements, reqInput] });
      setReqInput({ question: "", type: "TEXT", required: true, options: [] });
      setShowReqForm(false);
    }
  };

  const removeReq = (idx: number) => {
    const newReqs = [...data.requirements];
    newReqs.splice(idx, 1);
    updateForm({ requirements: newReqs });
    if (newReqs.length === 0) setShowReqForm(true);
  };

  const handleAddOption = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = optionInput.trim();
      if (val && !reqInput.options.includes(val)) {
        setReqInput({ ...reqInput, options: [...reqInput.options, val] });
        setOptionInput("");
      }
    }
  };

  const isFormValid = data.requirements.length > 0;

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-[#404145] mb-2">Buyer Requirements</h2>
      <p className="text-sm text-[#74767e] mb-8">Get all the information you need from buyers to get started.</p>

      {/* Requirements List */}
      {data.requirements.length > 0 && (
        <div className="space-y-4 mb-8">
          {data.requirements.map((req, idx) => (
            <div key={idx} className="bg-white border border-[#e4e5e7] rounded-md p-5 relative group">
              <div className="flex gap-2 text-sm text-[#74767e] mb-2">
                <span className="bg-gray-100 px-2 py-0.5 rounded font-medium">{req.type}</span>
                {req.required && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-medium">Required</span>}
              </div>
              <h4 className="font-bold text-[#404145] pr-8">{req.question}</h4>
              {req.type === "MULTIPLE_CHOICE" && (
                <ul className="mt-3 space-y-1">
                  {req.options.map(opt => (
                    <li key={opt} className="text-sm text-[#74767e] flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400" /> {opt}
                    </li>
                  ))}
                </ul>
              )}
              <button
                onClick={() => removeReq(idx)}
                className="absolute top-4 right-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          
          {!showReqForm && (
            <button
              onClick={() => setShowReqForm(true)}
              className="text-[#1dbf73] font-semibold text-sm hover:underline flex items-center gap-1 mt-4"
            >
              <Plus size={16} /> Add Another Requirement
            </button>
          )}
        </div>
      )}

      {/* Requirement Form */}
      {showReqForm && (
        <div className="bg-gray-50 border border-[#e4e5e7] rounded-md p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#404145] mb-2">Question</label>
              <textarea
                placeholder="Request necessary details such as dimensions, brand guidelines, etc."
                value={reqInput.question}
                onChange={(e) => setReqInput({ ...reqInput, question: e.target.value })}
                className="w-full h-20 border border-[#c5c6c9] rounded-md p-3 focus:border-[#404145] outline-none resize-none"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-[#404145] mb-2">Get it in a form of:</label>
                <select
                  value={reqInput.type}
                  onChange={(e) => setReqInput({ ...reqInput, type: e.target.value as any })}
                  className="w-full border border-[#c5c6c9] rounded-md px-4 py-2 focus:border-[#404145] outline-none bg-white"
                >
                  <option value="TEXT">Free Text</option>
                  <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                  <option value="FILE">Attachment</option>
                </select>
              </div>
              <div className="flex items-center mt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reqInput.required}
                    onChange={(e) => setReqInput({ ...reqInput, required: e.target.checked })}
                    className="w-4 h-4 accent-[#1dbf73] cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-[#404145]">Answer is mandatory</span>
                </label>
              </div>
            </div>

            {reqInput.type === "MULTIPLE_CHOICE" && (
              <div>
                <label className="block text-sm font-semibold text-[#404145] mb-2">Options</label>
                <div className="space-y-2 mb-3">
                  {reqInput.options.map(opt => (
                    <div key={opt} className="flex items-center justify-between bg-white border border-[#e4e5e7] px-3 py-2 rounded">
                      <span className="text-sm">{opt}</span>
                      <button onClick={() => setReqInput({ ...reqInput, options: reqInput.options.filter(o => o !== opt) })} className="text-gray-400 hover:text-red-500">&times;</button>
                    </div>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add option and press Enter"
                  value={optionInput}
                  onChange={(e) => setOptionInput(e.target.value)}
                  onKeyDown={handleAddOption}
                  className="w-full border border-[#c5c6c9] rounded-md px-4 py-2 text-sm focus:border-[#404145] outline-none"
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-[#e4e5e7]">
              {data.requirements.length > 0 && (
                <button
                  onClick={() => setShowReqForm(false)}
                  className="px-4 py-2 text-sm font-semibold text-[#74767e] hover:text-[#404145]"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={addReq}
                disabled={!reqInput.question.trim() || (reqInput.type === "MULTIPLE_CHOICE" && reqInput.options.length < 2)}
                className="bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-md text-sm font-bold disabled:opacity-50 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

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
