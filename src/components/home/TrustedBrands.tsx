import { TRUSTED_BRANDS } from "@/lib/constants";

export function TrustedBrands() {
  return (
    <div className="bg-[#fafafa] flex justify-center items-center py-5 px-6 gap-6 md:gap-10 flex-wrap border-b border-[#e4e5e7]">
      <span className="text-[#b5b6ba] font-semibold text-[15px]">Trusted by:</span>
      {TRUSTED_BRANDS.map((brand) => (
        <div key={brand.name} className="flex items-center justify-center text-[#b5b6ba]">
           <span dangerouslySetInnerHTML={{ __html: `<span style="${brand.style}">${brand.wordmark}</span>` }} />
        </div>
      ))}
    </div>
  );
}
