import Link from "next/link";

const footerSections = [
  {
    title: "Categories",
    links: [
      { label: "Graphics & Design", href: "#" },
      { label: "Digital Marketing", href: "#" },
      { label: "Writing & Translation", href: "#" },
      { label: "Video & Animation", href: "#" },
      { label: "Music & Audio", href: "#" },
      { label: "Programming & Tech", href: "#" },
      { label: "Data", href: "#" },
      { label: "Business", href: "#" },
      { label: "Lifestyle", href: "#" },
      { label: "Photography", href: "#" },
      { label: "End-to-End Projects", href: "#" },
      { label: "Sitemap", href: "#" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "Careers", href: "#" },
      { label: "Press & News", href: "#" },
      { label: "Partnerships", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Intellectual Property Claims", href: "#" },
      { label: "Investor Relations", href: "#" },
    ],
  },
  {
    title: "Support and Education",
    links: [
      { label: "Help & Support", href: "#" },
      { label: "Trust & Safety", href: "#" },
      { label: "Selling on Earner", href: "#" },
      { label: "Buying on Earner", href: "#" },
      { label: "Earner Guides", href: "#" },
      { label: "Earner Workspace", href: "#" },
      { label: "Learn", href: "#" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Customer Success Stories", href: "#" },
      { label: "Community Hub", href: "#" },
      { label: "Forum", href: "#" },
      { label: "Events", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Influencers", href: "#" },
      { label: "Affiliates", href: "#" },
      { label: "Podcast", href: "#" },
      { label: "Invite a Friend", href: "#" },
      { label: "Become a Seller", href: "/dashboard" },
      { label: "Community Standards", href: "#" },
    ],
  },
  {
    title: "Business Solutions",
    links: [
      { label: "About Business Solutions", href: "#" },
      { label: "Earner Pro", href: "#" },
      { label: "Earner Certified", href: "#" },
      { label: "Earner Enterprise", href: "#" },
      { label: "ClearVoice", href: "#" },
      { label: "Working Not Working", href: "#" },
      { label: "Contact Sales", href: "#" },
    ],
  },
];

const socialLinks = [
  { icon: "X", href: "#", label: "Twitter" },
  { icon: "f", href: "#", label: "Facebook" },
  { icon: "in", href: "#", label: "LinkedIn" },
  { icon: "P", href: "#", label: "Pinterest" },
  { icon: "IG", href: "#", label: "Instagram" },
];

export function Footer() {
  return (
    <footer className="bg-white border-t border-[#e4e5e7] mt-auto">
      <div className="container-Earner py-12">
        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-bold text-sm text-[#404145] mb-4 uppercase tracking-wide">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-[#74767e] hover:text-[#1dbf73] transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#e4e5e7] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="text-[#404145] text-xl font-black tracking-tight">
              Earner<span className="text-[#1dbf73]">.</span>
            </Link>
            <p className="text-xs text-[#74767e]">© Earner International Ltd. {new Date().getFullYear()}</p>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            {socialLinks.map(({ icon, href, label }) => (
              <a key={label} href={href} aria-label={label}
                className="h-8 flex items-center justify-center text-[#74767e] hover:text-[#404145] hover:bg-[#f5f5f5] rounded-full w-8 transition-colors text-lg font-bold">
                {icon}
              </a>
            ))}
          </div>

          {/* Currency/Language */}
          <div className="flex items-center gap-6 mt-4 md:mt-0 text-sm font-semibold text-[#74767e] pb-6">
            <button className="flex items-center gap-1 hover:text-[#404145] transition-colors">
              🌐 English
            </button>
            <button className="flex items-center gap-1 hover:text-[#404145] transition-colors">
              $ USD
            </button>
            <button className="flex items-center gap-1 hover:text-[#404145] transition-colors">
              ♿
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
