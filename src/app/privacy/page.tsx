import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Earner",
  description: "Privacy Policy for Earner",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "June 30, 2026";

  return (
    <div className="container-Earner py-16 md:py-24 max-w-4xl mx-auto">
      <div className="space-y-8 text-[#404145]">
        <div className="border-b border-[#e4e5e7] pb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-lg text-[#74767e]">Last Updated: {lastUpdated}</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">1. Introduction</h2>
          <p>
            Welcome to Earner. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you as to how we look after your personal data when you visit our 
            website (regardless of where you visit it from) and tell you about your privacy rights and how the 
            law protects you.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">2. The Data We Collect About You</h2>
          <p>
            Personal data, or personal information, means any information about an individual from which that 
            person can be identified. We may collect, use, store and transfer different kinds of personal data 
            about you which we have grouped together as follows:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-[#74767e]">
            <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier, and title.</li>
            <li><strong>Contact Data</strong> includes billing address, delivery address, email address and telephone numbers.</li>
            <li><strong>Financial Data</strong> includes bank account and payment card details.</li>
            <li><strong>Transaction Data</strong> includes details about payments to and from you and other details of products and services you have purchased from us.</li>
            <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
            <li><strong>Profile Data</strong> includes your username and password, purchases or orders made by you, your interests, preferences, feedback and survey responses.</li>
            <li><strong>Usage Data</strong> includes information about how you use our website, products and services.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">3. How We Use Your Personal Data</h2>
          <p>
            We will only use your personal data when the law allows us to. Most commonly, we will use your 
            personal data in the following circumstances:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-[#74767e]">
            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
            <li>Where we need to comply with a legal obligation.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">4. Data Security</h2>
          <p>
            We have put in place appropriate security measures to prevent your personal data from being accidentally 
            lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to 
            your personal data to those employees, agents, contractors and other third parties who have a business 
            need to know. They will only process your personal data on our instructions and they are subject to a 
            duty of confidentiality.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">5. Data Retention</h2>
          <p>
            We will only retain your personal data for as long as reasonably necessary to fulfil the purposes we 
            collected it for, including for the purposes of satisfying any legal, regulatory, tax, accounting or 
            reporting requirements. We may retain your personal data for a longer period in the event of a complaint 
            or if we reasonably believe there is a prospect of litigation in respect to our relationship with you.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">6. Your Legal Rights</h2>
          <p>
            Under certain circumstances, you have rights under data protection laws in relation to your personal data, 
            including the right to request access, correction, erasure, restriction, transfer, to object to processing, 
            to portability of data and (where the lawful ground of processing is consent) to withdraw consent.
          </p>
          <p>
            If you wish to exercise any of the rights set out above, please contact us.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">7. Contact Us</h2>
          <p>
            If you have any questions about this privacy policy or our privacy practices, please contact us at:
          </p>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
            <p className="font-semibold mb-2">Earner International Ltd.</p>
            <p>Email: privacy@earner.com</p>
            <p>Address: 123 Freelance Ave, Tech District, 90210</p>
          </div>
        </section>
      </div>
    </div>
  );
}
