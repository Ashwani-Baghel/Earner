import { Search, FileCheck, ThumbsUp } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "1. Post a job",
    description: "Tell us what you need. Provide as many details as possible, start by posting a job.",
    color: "bg-[#e6f7ef]",
    iconColor: "text-[#1dbf73]",
  },
  {
    icon: FileCheck,
    title: "2. Choose a service",
    description: "Browse and buy one of our ready-made services, or post a custom request.",
    color: "bg-[#e6f0ff]",
    iconColor: "text-[#1052d2]",
  },
  {
    icon: ThumbsUp,
    title: "3. Get it done",
    description: "Once you approve the order, your freelancer gets to work. Payment is released only when you're happy.",
    color: "bg-[#fff4e6]",
    iconColor: "text-[#f7a918]",
  },
];

export function HowItWorks() {
  return (
    <section className="py-14 bg-[#fafafa]">
      <div className="container-fiverr">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-[#404145] mb-3">Your go-to for exceptional results</h2>
          <p className="text-[#74767e] text-sm max-w-xl mx-auto">
            Work with the best. Get quality results every time. Start your project in minutes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="bg-white rounded-xl p-6 border border-[#e4e5e7] hover:shadow-md transition-shadow">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-5 ${step.color}`}>
                  <Icon size={24} className={step.iconColor} />
                </div>
                <h3 className="text-base font-bold text-[#404145] mb-2">{step.title}</h3>
                <p className="text-sm text-[#74767e] leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
