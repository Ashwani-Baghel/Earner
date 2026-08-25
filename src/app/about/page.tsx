import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import "react-quill-new/dist/quill.snow.css";

export const metadata: Metadata = {
  title: "About Us - Earner",
  description: "Learn more about Earner and our mission.",
};

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const config = await prisma.cmsConfig.findUnique({
    where: { key: "STATIC_PAGES" }
  });
  
  const pageData = config?.data ? (config.data as any).about : null;
  const title = pageData?.title || "About Us";
  const content = pageData?.content || `
    <p>
      Welcome to Earner! Our mission is to connect talented freelancers with businesses that need their skills. 
      We believe in creating a platform that is fair, transparent, and built for success.
    </p>
    <h2>Our Story</h2>
    <p>
      Earner was founded with the vision of empowering individuals to work on their own terms. 
      Whether you are a seasoned professional or just starting out, Earner provides the tools and community you need to thrive.
    </p>
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
