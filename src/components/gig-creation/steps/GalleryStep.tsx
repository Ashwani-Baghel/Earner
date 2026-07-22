"use client";

import { useState } from "react";
import { GigFormData } from "../GigCreationWizard";
import { ImagePlus, X, Loader2 } from "lucide-react";
import Image from "next/image";

interface Props {
  data: GigFormData;
  updateForm: (data: Partial<GigFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export function GalleryStep({ data, updateForm, nextStep, prevStep }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (e.g. 4MB for images due to Vercel limits)
    if (file.size > 4 * 1024 * 1024) {
      setError("File size must be under 4MB");
      return;
    }

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const result = await res.json();
      if (result.success) {
        updateForm({
          media: [...data.media, { url: result.url, type: "IMAGE" }]
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = (idx: number) => {
    const newMedia = [...data.media];
    newMedia.splice(idx, 1);
    updateForm({ media: newMedia });
  };

  const isFormValid = data.media.length > 0;

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-[#404145] mb-2">Showcase Your Services In A Gig Gallery</h2>
      <p className="text-sm text-[#74767e] mb-8">Encourage buyers to choose your Gig by featuring a variety of your work.</p>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-6 text-sm">{error}</div>}

      <div className="border border-[#e4e5e7] rounded-lg p-6 bg-gray-50 mb-8">
        <h3 className="font-semibold text-[#404145] mb-1">Images (up to 3)</h3>
        <p className="text-sm text-[#74767e] mb-4">Get noticed by the right buyers with visual examples of your services.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[0, 1, 2].map((idx) => {
            const mediaItem = data.media[idx];
            return (
              <div key={idx} className="aspect-[4/3] bg-white border border-[#c5c6c9] rounded flex flex-col items-center justify-center relative overflow-hidden group">
                {mediaItem ? (
                  <>
                    <Image src={mediaItem.url} alt={`Upload ${idx}`} fill className="object-cover" unoptimized />
                    <button
                      onClick={() => removeMedia(idx)}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 text-red-500"
                    >
                      <X size={16} />
                    </button>
                    {idx === 0 && <span className="absolute bottom-2 left-2 bg-[#1dbf73] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">Primary</span>}
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                      <ImagePlus size={20} className="text-gray-400" />
                    </div>
                    <span className="text-sm font-semibold text-[#1dbf73] hover:underline cursor-pointer">
                      Browse
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg, image/png, image/webp"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>
        {uploading && (
          <div className="flex items-center gap-2 mt-4 text-sm text-[#74767e]">
            <Loader2 size={16} className="animate-spin" /> Uploading...
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
          disabled={!isFormValid || uploading}
          className="bg-[#1dbf73] hover:bg-[#19a463] text-white px-6 py-3 rounded-md font-bold disabled:opacity-50 transition-colors"
        >
          Save & Continue
        </button>
      </div>
    </div>
  );
}
