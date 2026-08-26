import { Metadata } from "next";
import { Mail, Phone, MessageSquare, MapPin, ChevronDown } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us - Earner",
  description: "Get in touch with the Earner support team.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-6 lg:py-24">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Get in Touch</h1>
          <p className="text-slate-600 text-lg">
            Have questions about Earner Marketplace? We're here to help. Reach out to our team using the form below or connect through our support channels.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Contact Form */}
          <div className="lg:col-span-2 bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Send us a Message</h2>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Jane Doe" 
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required
                    placeholder="jane@example.com" 
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Subject</label>
                <div className="relative">
                  <select 
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white appearance-none text-slate-700"
                  >
                    <option>General Inquiry</option>
                    <option>Technical Support</option>
                    <option>Billing Question</option>
                    <option>Partnership Opportunity</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Message</label>
                <textarea 
                  required
                  placeholder="How can we help you today?" 
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white resize-y"
                ></textarea>
              </div>

              <div className="pt-4">
                <button 
                  type="button" 
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3.5 px-6 rounded-lg transition-colors shadow-sm"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Info Cards */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Support Channels Card */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Support Channels</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                    <Mail className="text-teal-700" size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Email</h3>
                    <p className="text-sm text-slate-600 mt-0.5">support@earner.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                    <Phone className="text-teal-700" size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Phone</h3>
                    <p className="text-sm text-slate-600 mt-0.5">+1 800-EARNER</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                    <MessageSquare className="text-teal-700" size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Live Chat</h3>
                    <p className="text-sm text-slate-600 mt-0.5">Available 9 AM - 5 PM EST</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Our Offices Card */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Our Offices</h2>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                  <MapPin className="text-teal-700" size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Headquarters</h3>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    123 Innovation Drive, Suite 400<br/>
                    San Francisco, CA 94105<br/>
                    United States
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
