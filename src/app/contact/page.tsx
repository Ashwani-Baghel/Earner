import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - Earner",
  description: "Get in touch with the Earner support team.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6">
      <div className="max-w-4xl mx-auto bg-white p-12 rounded-3xl shadow-sm border border-slate-200">
        <h1 className="text-4xl font-bold text-slate-900 mb-6">Contact Us</h1>
        <div className="prose prose-slate prose-lg max-w-none">
          <p>
            Have a question, concern, or feedback? We'd love to hear from you! Our support team is available 24/7.
          </p>
          
          <div className="bg-slate-50 p-6 rounded-xl mt-8">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Customer Support</h3>
            <p className="mb-1"><strong>Email:</strong> support@earner.com</p>
            <p><strong>Phone:</strong> +1 (800) 123-4567</p>
          </div>

          <p className="text-slate-500 italic mt-8">
            This page content can be updated from the Super Admin CMS.
          </p>
        </div>
      </div>
    </div>
  );
}
