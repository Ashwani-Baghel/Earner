import { Metadata } from "next";
import { Wrench } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Coming Soon - Earner Support",
};

export default async function SupportComingSoonPage({ params }: { params: Promise<{ slug: string[] }> }) {
  // Try to format the slug array into a nice readable title if possible
  const resolvedParams = await params;
  const rawSegment = resolvedParams.slug?.[0] || "feature";
  const featureName = rawSegment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[70vh]">
      <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200 text-center max-w-lg w-full">
        <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-sm">
          <Wrench className="text-teal-600" size={36} />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-3">
          {featureName} will integrate soon
        </h1>
        <p className="text-slate-500 mb-8 text-sm leading-relaxed">
          This support module is currently under development. It will be rolled out in an upcoming update to help you manage the platform more effectively.
        </p>
        <div className="flex justify-center gap-4">
          <Link 
            href="/super-admin/support/overview" 
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors shadow-sm text-sm"
          >
            Back to Overview
          </Link>
        </div>
      </div>
    </div>
  );
}
