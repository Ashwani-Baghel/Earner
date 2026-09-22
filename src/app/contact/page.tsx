"use client";

import { useState, useEffect } from "react";
import { useCms } from "@/context/CmsContext";
import { useAuth } from "@/context/AuthContext";
import { Mail, MapPin, Phone, MessageSquare, ChevronDown, CheckCircle2 } from "lucide-react";

const CONTACT_SUBJECTS = [
  "General Inquiry",
  "Business / Partnership",
  "Advertising",
  "Press / Media",
  "Feedback",
  "Other"
];

export default function ContactUsPage() {
  const { contact } = useCms();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    subject: "General Inquiry",
    name: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.displayName || prev.name,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit form");
      }

      setIsSuccess(true);
      setFormData({ subject: "General Inquiry", name: "", email: "", message: "" });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Eye-catching Hero Section */}
      <div className="relative bg-gradient-to-br from-teal-900 via-teal-800 to-teal-900 pt-16 pb-32 px-6 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[150%] bg-teal-700/20 rounded-full blur-3xl transform rotate-12"></div>
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[100%] bg-teal-600/20 rounded-full blur-3xl transform -rotate-12"></div>
          {/* Subtle grid overlay */}
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10 mt-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-800/50 text-teal-200 text-sm font-semibold tracking-wide border border-teal-700/50 mb-6">
            <Mail size={14} /> Contact Support
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            How can we help you?
          </h1>
          <p className="text-teal-100/90 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Reach out to our team using the form below or connect through our support channels.
          </p>
        </div>
      </div>

      <div className="max-w-6xl w-full mx-auto px-6 -mt-16 relative z-20 pb-24 flex-1">
        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Left Column: Contact Form */}
          <div className="lg:col-span-2 bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-slate-200">
            {isSuccess ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-6">
                <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center text-teal-600">
                  <CheckCircle2 size={40} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Sent Successfully!</h3>
                  <p className="text-slate-500 max-w-md mx-auto">
                    Thank you for reaching out. We've received your message and will get back to you as soon as possible.
                  </p>
                </div>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors mt-4"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-slate-900 mb-8">Send us a Message</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">Full Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Jane Doe"
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">Email Address</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="jane@example.com"
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Subject</label>
                    <div className="relative">
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white appearance-none text-slate-700"
                      >
                        {CONTACT_SUBJECTS.map((subject) => (
                          <option key={subject} value={subject}>{subject}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Message</label>
                    <textarea
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="How can we help you today?"
                      rows={6}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white resize-y"
                    ></textarea>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3.5 px-6 rounded-lg transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center h-[52px]"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        "Send Message"
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>

          {/* Right Column: Info Cards */}
          <div className="lg:col-span-1 space-y-6">

            {/* Support Channels Card */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Support Channels</h2>

              <div className="space-y-6">
                {(contact?.supportEmail || contact?.salesEmail) && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                      <Mail className="text-teal-700" size={22} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Email</h3>
                      {contact?.supportEmail && (
                        <a href={`mailto:${contact.supportEmail}`} className="text-sm text-slate-600 mt-0.5 hover:text-teal-600 block transition-colors">
                          {contact.supportEmail}
                        </a>
                      )}
                      {contact?.salesEmail && (
                        <a href={`mailto:${contact.salesEmail}`} className="text-sm text-slate-600 mt-0.5 hover:text-teal-600 block transition-colors">
                          {contact.salesEmail}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {contact?.supportPhone && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                      <Phone className="text-teal-700" size={22} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Phone</h3>
                      <a href={`tel:${contact.supportPhone}`} className="text-sm text-slate-600 mt-0.5 hover:text-teal-600 block transition-colors">
                        {contact.supportPhone}
                      </a>
                    </div>
                  </div>
                )}

                {contact?.workingHours && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                      <MessageSquare className="text-teal-700" size={22} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Working Hours</h3>
                      <p className="text-sm text-slate-600 mt-0.5">{contact.workingHours}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Our Offices Card */}
            {contact?.physicalAddress && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Our Offices</h2>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                    <MapPin className="text-teal-700" size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Headquarters</h3>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed whitespace-pre-wrap">
                      {contact.physicalAddress}
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
