import Link from "next/link";
import { useCms } from "../../context/CmsContext";



export function Footer() {
  const { footer } = useCms();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-[#e4e5e7] mt-auto">
      <div className="container-earner pt-12 pb-8 px-6 lg:px-8 max-w-[1440px] mx-auto">
        
        {/* Top Rounded Section: Brand & Newsletter */}
        <div className="bg-[#f7f8f9] rounded-3xl p-8 md:p-12 mb-12 flex flex-col lg:flex-row justify-between gap-12">
          {/* Brand & Description */}
          <div className="lg:w-1/2 space-y-4">
            {footer?.logoUrl ? (
              <img src={footer.logoUrl} alt="Logo" className="h-8 object-contain" />
            ) : (
              <Link href="/" className="text-[#404145] text-4xl font-black tracking-tight block">
                Earner<span className="text-[#1dbf73]">.</span>
              </Link>
            )}
            {footer?.description && (
              <p className="text-[#74767e] text-[15px] leading-relaxed max-w-md pt-2">
                {footer.description}
              </p>
            )}
          </div>

          {/* Newsletter Widget */}
          {footer?.showNewsletter && (
            <div className="lg:w-1/2 space-y-4 max-w-xl">
              <h4 className="font-bold text-slate-900 text-lg">{footer.newsletterTitle || "Subscribe to Newsletter"}</h4>
              {footer.newsletterDesc && (
                <p className="text-[#74767e] text-[15px]">{footer.newsletterDesc}</p>
              )}
              <form className="flex flex-col gap-3 pt-2" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="ASHWANIBAGHEL040@GMAIL.COM" 
                  className="w-full px-5 py-3.5 rounded-xl border border-transparent bg-[#edf1f5] outline-none focus:border-teal-500 focus:bg-white transition-colors text-sm font-medium placeholder:text-slate-400" 
                />
                <button 
                  type="submit" 
                  className="w-full bg-[#111625] text-white font-bold py-3.5 rounded-xl hover:bg-[#1a2138] transition-colors text-sm"
                >
                  Subscribe
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Dynamic Columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-16 px-4">
          {footer?.columns?.map((col: any, idx: number) => (
            <div key={idx}>
              <h4 className="font-bold text-slate-900 mb-6">{col.title}</h4>
              <ul className="space-y-4 text-[#74767e] text-[15px] font-medium">
                {col.links?.map((link: any, i: number) => (
                  <li key={i}>
                    <Link href={link.url} className="hover:text-teal-600 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#e4e5e7] pt-8 flex flex-col md:flex-row items-center justify-between gap-6 px-4">
          <div className="flex items-center gap-4">
            {footer?.logoUrl ? (
              <img src={footer.logoUrl} alt="Logo" className="h-6 object-contain hidden md:block" />
            ) : (
              <Link href="/" className="text-[#404145] text-2xl font-black tracking-tight hidden md:block">
                Earner<span className="text-[#1dbf73]">.</span>
              </Link>
            )}
            <p className="text-[14px] text-[#74767e] font-medium">{footer?.copyright || `© ${currentYear} Earner International Ltd.`}</p>
          </div>

          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <Link href={footer?.social?.twitter || "#"} className="w-10 h-10 rounded-full bg-[#f4f5f6] flex items-center justify-center text-[#74767e] hover:bg-teal-50 hover:text-teal-600 transition-colors font-semibold text-sm">
              X
            </Link>
            <Link href={footer?.social?.facebook || "#"} className="w-10 h-10 rounded-full bg-[#f4f5f6] flex items-center justify-center text-[#74767e] hover:bg-teal-50 hover:text-teal-600 transition-colors font-semibold text-sm">
              f
            </Link>
            <Link href={footer?.social?.instagram || "#"} className="w-10 h-10 rounded-full bg-[#f4f5f6] flex items-center justify-center text-[#74767e] hover:bg-teal-50 hover:text-teal-600 transition-colors font-semibold text-[13px]">
              IG
            </Link>
            <Link href={footer?.social?.linkedin || "#"} className="w-10 h-10 rounded-full bg-[#f4f5f6] flex items-center justify-center text-[#74767e] hover:bg-teal-50 hover:text-teal-600 transition-colors font-semibold text-sm">
              in
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
