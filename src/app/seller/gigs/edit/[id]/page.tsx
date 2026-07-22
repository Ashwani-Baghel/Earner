"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { GigCreationWizard, GigFormData } from "@/components/gig-creation/GigCreationWizard";
import { Loader2 } from "lucide-react";

export default function EditGigPage() {
  const { id } = useParams() as { id: string };
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [initialData, setInitialData] = useState<GigFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/");
      return;
    }

    const fetchGig = async () => {
      try {
        const res = await fetch(`/api/gigs/${id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch gig details");
        }
        const gig = await res.json();

        // Security check
        if (gig.sellerId !== user.uid) {
          throw new Error("You do not have permission to edit this gig.");
        }

        // Reconstruct GigFormData from API response
        const mappedData: GigFormData = {
          title: gig.title,
          categoryId: gig.categoryId,
          subcategoryId: gig.subcategoryId || "",
          tags: gig.tags || [],
          description: gig.description,
          faqs: gig.faqs?.map((f: any) => ({ question: f.question, answer: f.answer })) || [],
          requirements: gig.requirements?.map((r: any) => ({
            question: r.question,
            type: r.type,
            required: r.required,
            options: r.options || []
          })) || [],
          media: gig.images?.map((url: string) => ({ url, type: "IMAGE" })) || [],
          packages: [
            {
              tier: "BASIC",
              name: gig.packages?.basic?.name || "",
              description: gig.packages?.basic?.description || "",
              price: String(gig.packages?.basic?.price || ""),
              deliveryDays: String(gig.packages?.basic?.deliveryTime || ""),
              revisions: String(gig.packages?.basic?.revisions || "1"),
              features: gig.packages?.basic?.features || []
            },
            {
              tier: "STANDARD",
              name: gig.packages?.standard?.name || "",
              description: gig.packages?.standard?.description || "",
              price: String(gig.packages?.standard?.price || ""),
              deliveryDays: String(gig.packages?.standard?.deliveryTime || ""),
              revisions: String(gig.packages?.standard?.revisions || "2"),
              features: gig.packages?.standard?.features || []
            },
            {
              tier: "PREMIUM",
              name: gig.packages?.premium?.name || "",
              description: gig.packages?.premium?.description || "",
              price: String(gig.packages?.premium?.price || ""),
              deliveryDays: String(gig.packages?.premium?.deliveryTime || ""),
              revisions: String(gig.packages?.premium?.revisions || "-1"),
              features: gig.packages?.premium?.features || []
            }
          ]
        };

        setInitialData(mappedData);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchGig();
  }, [id, user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <Loader2 className="animate-spin text-teal-600" size={36} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center max-w-md">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => router.push("/seller/dashboard")}
            className="mt-4 px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800"
          >
            Go back to dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!initialData) return null;

  return (
    <div>
      <GigCreationWizard initialData={initialData} gigId={id} />
    </div>
  );
}
