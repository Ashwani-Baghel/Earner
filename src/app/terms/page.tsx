import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import "react-quill-new/dist/quill.snow.css";

export const metadata: Metadata = {
  title: "Terms of Service - Earner",
  description: "Terms and conditions for using the Earner platform.",
};

export const dynamic = "force-dynamic";

export default async function TermsPage() {
  const config = await prisma.cmsConfig.findUnique({
    where: { key: "STATIC_PAGES" }
  });
  
  const pageData = config?.data ? (config.data as any).terms : null;
  const title = pageData?.title || "Terms of Service";
  const content = pageData?.content || `
    <p>Last updated: August 2026</p>
    <h2>1. Acceptance of Terms</h2>
    <p>By accessing or using the Earner platform, you agree to be bound by these terms.</p>
    <h2>2. User Responsibilities</h2>
    <p>Users must provide accurate information and maintain professional conduct on the platform.</p>
    <h2>3. Payments</h2>
    <p>All transactions are processed securely. Earner takes a standard platform fee on successful orders.</p>
  `;

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6">
      <div className="max-w-4xl mx-auto bg-white p-12 rounded-3xl shadow-sm border border-slate-200">
        <h1 className="text-4xl font-bold text-slate-900 mb-6">{title}</h1>
        <div className="ql-snow">
          <div 
            className="ql-editor rich-text-output !p-0"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </div>
  );
}
