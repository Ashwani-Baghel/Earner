import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import "react-quill-new/dist/quill.snow.css";

export const metadata: Metadata = {
  title: "Privacy Policy - Earner",
  description: "How Earner collects, uses, and protects your data.",
};

export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  const config = await prisma.cmsConfig.findUnique({
    where: { key: "STATIC_PAGES" }
  });
  
  const pageData = config?.data ? (config.data as any).privacy : null;
  const title = pageData?.title || "Privacy Policy";
  const content = pageData?.content || `
    <p>Last updated: August 2026</p>
    <h2>1. Data Collection</h2>
    <p>We collect information necessary to provide our services, including profile data and transaction history.</p>
    <h2>2. Data Usage</h2>
    <p>Your data is used strictly for platform operations, improving user experience, and security.</p>
    <h2>3. Security</h2>
    <p>We employ industry-standard security measures to protect your personal information.</p>
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
