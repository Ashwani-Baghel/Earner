import Link from "next/link";
import { useCms } from "../../context/CmsContext";



export function Footer() {
  const { footer } = useCms();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-[#e4e5e7] mt-auto">
      <div className="container-earner pt-16 pb-8 px-6 lg:px-8 max-w-[1440px] mx-auto">
        {/* Dynamic Footer Columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
          {footer?.columns?.map((col: any, idx: number) => (
            <div key={idx}>
              <h4 className="font-bold text-slate-900 mb-4">{col.title}</h4>
              <ul className="space-y-3 text-slate-600 text-[15px]">
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
        <div className="border-t border-[#e4e5e7] pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-[#404145] text-xl font-black tracking-tight">
              Earner<span className="text-[#1dbf73]">.</span>
            </Link>
            <p className="text-xs text-[#74767e]">© Earner International Ltd. {currentYear}</p>
          </div>

          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <Link href={footer?.social?.twitter || "#"} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-teal-50 hover:text-teal-600 transition-colors font-bold">
              X
            </Link>
            <Link href={footer?.social?.facebook || "#"} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-teal-50 hover:text-teal-600 transition-colors font-bold">
              f
            </Link>
            <Link href={footer?.social?.instagram || "#"} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-teal-50 hover:text-teal-600 transition-colors font-bold">
              IG
            </Link>
            <Link href={footer?.social?.linkedin || "#"} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-teal-50 hover:text-teal-600 transition-colors font-bold">
              in
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
