import Image from "next/image";

export function EverythingSection() {
  return (
    <section className="bg-[#f1fdf7] py-24">
      <div className="container-fiverr max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-bold text-[#404145] mb-8 pb-4">
              The best part? Everything.
            </h2>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="text-[#62646a] mt-1 shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-[#404145]">Stick to your budget</h3>
                  <p className="text-[#62646a] mt-1 text-[17px]">Find the right service for every price point. No hourly rates, just project-based pricing.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="text-[#62646a] mt-1 shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-[#404145]">Get quality work done quickly</h3>
                  <p className="text-[#62646a] mt-1 text-[17px]">Hand your project over to a talented freelancer in minutes, get long-lasting results.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="text-[#62646a] mt-1 shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-[#404145]">Pay when you're happy</h3>
                  <p className="text-[#62646a] mt-1 text-[17px]">Upfront quotes mean no surprises. Payments only get released when you approve.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="text-[#62646a] mt-1 shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"></path><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"></path></svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-[#404145]">Count on 24/7 support</h3>
                  <p className="text-[#62646a] mt-1 text-[17px]">Our round-the-clock support team is available to help anytime, anywhere.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="flex-1 relative">
            <div className="rounded-md overflow-hidden relative" style={{ paddingBottom: '70%' }}>
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80"
                alt="Team working"
                className="absolute inset-0 w-full h-full object-cover rounded-md"
              />
            </div>
            {/* Overlay card */}
            <div className="absolute -bottom-8 -left-8 bg-white p-6 shadow-xl w-[280px] rounded-sm animate-fade-in-up">
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[#1dbf73]">★</span>
                ))}
              </div>
              <p className="text-[15px] font-medium text-[#404145]">
                "We haven't met an effort...
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
