"use client";

import { useState } from "react";
import { GigFormData } from "../GigCreationWizard";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { CheckCircle2, Loader2 } from "lucide-react";

interface Props {
  data: GigFormData;
  prevStep: () => void;
}

export function PublishStep({ data, prevStep }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  const handlePublish = async () => {
    if (!user) return;
    setPublishing(true);
    setError("");

    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/gigs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to publish gig");
      }

      router.push("/seller/dashboard");
    } catch (err: any) {
      setError(err.message);
      setPublishing(false);
    }
  };

  return (
    <div className="animate-fade-in text-center py-10">
      <div className="w-20 h-20 bg-[#e6f7ef] rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 size={40} className="text-[#1dbf73]" />
      </div>
      
      <h2 className="text-3xl font-bold text-[#404145] mb-4">Almost there!</h2>
      <p className="text-lg text-[#74767e] mb-8 max-w-lg mx-auto">
        Your Gig is complete. Review your details, and when you are ready, publish it to start receiving orders.
      </p>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded mb-8 max-w-lg mx-auto text-sm text-left">{error}</div>}

      <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
        <button
          onClick={prevStep}
          disabled={publishing}
          className="text-[#1dbf73] font-bold px-8 py-3 rounded-md hover:bg-gray-50 transition-colors w-full sm:w-auto"
        >
          Back to Edit
        </button>
        <button
          onClick={handlePublish}
          disabled={publishing}
          className="bg-[#1dbf73] hover:bg-[#19a463] text-white px-10 py-3 rounded-md font-bold text-lg disabled:opacity-50 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          {publishing && <Loader2 size={20} className="animate-spin" />}
          Publish Gig
        </button>
      </div>
    </div>
  );
}
