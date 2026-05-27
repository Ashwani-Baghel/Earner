"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { SearchFilters } from "../../lib/types";
import { CATEGORIES } from "../../lib/mock-data/categories";

interface SearchFiltersProps {
  filters: Partial<SearchFilters>;
  onChange: (filters: Partial<SearchFilters>) => void;
}

export function SearchFilters({ filters, onChange }: SearchFiltersProps) {
  const [budgetOpen, setBudgetOpen] = useState(true);
  const [deliveryOpen, setDeliveryOpen] = useState(true);
  const [levelOpen, setLevelOpen] = useState(true);

  const filterSection = (title: string, open: boolean, setOpen: (v: boolean) => void, content: React.ReactNode) => (
    <div className="border-b border-[#e4e5e7] py-4">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full text-left">
        <span className="font-semibold text-sm text-[#404145]">{title}</span>
        {open ? <ChevronUp size={16} className="text-[#74767e]" /> : <ChevronDown size={16} className="text-[#74767e]" />}
      </button>
      {open && <div className="mt-3">{content}</div>}
    </div>
  );

  return (
    <aside className="w-64 flex-shrink-0">
      <div className="bg-white rounded-xl border border-[#e4e5e7] p-4 sticky top-20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[#404145]">Filter</h3>
          <button onClick={() => onChange({})} className="text-xs text-[#1dbf73] hover:underline">Clear all</button>
        </div>

        {/* Category */}
        {filterSection("Category", true, () => {}, (
          <div className="space-y-1.5">
            {CATEGORIES.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  checked={filters.category === cat.slug}
                  onChange={() => onChange({ ...filters, category: cat.slug })}
                  className="accent-[#1dbf73]"
                />
                <span className="text-sm text-[#404145] group-hover:text-[#1dbf73]">{cat.name}</span>
              </label>
            ))}
          </div>
        ))}

        {/* Budget */}
        {filterSection("Budget", budgetOpen, setBudgetOpen, (
          <div className="space-y-3">
            {[
              { label: "Under $25", min: 0, max: 25 },
              { label: "$25 – $50", min: 25, max: 50 },
              { label: "$50 – $100", min: 50, max: 100 },
              { label: "$100+", min: 100, max: null },
            ].map(({ label, min, max }) => (
              <label key={label} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.minPrice === min && filters.maxPrice === max}
                  onChange={() => onChange({ ...filters, minPrice: min, maxPrice: max ?? undefined })}
                  className="accent-[#1dbf73]"
                />
                <span className="text-sm text-[#404145]">{label}</span>
              </label>
            ))}
            <div className="flex gap-2 mt-2">
              <input type="number" placeholder="Min" value={filters.minPrice ?? ""} onChange={(e) => onChange({ ...filters, minPrice: e.target.value ? Number(e.target.value) : null })}
                className="w-full border border-[#e4e5e7] rounded px-2 py-1 text-sm focus:outline-none focus:border-[#1dbf73]" />
              <input type="number" placeholder="Max" value={filters.maxPrice ?? ""} onChange={(e) => onChange({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : null })}
                className="w-full border border-[#e4e5e7] rounded px-2 py-1 text-sm focus:outline-none focus:border-[#1dbf73]" />
            </div>
          </div>
        ))}

        {/* Delivery time */}
        {filterSection("Delivery Time", deliveryOpen, setDeliveryOpen, (
          <div className="space-y-1.5">
            {[{ label: "Express 24H", days: 1 }, { label: "Up to 3 days", days: 3 }, { label: "Up to 7 days", days: 7 }, { label: "Anytime", days: null }].map(({ label, days }) => (
              <label key={label} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="delivery" checked={filters.deliveryTime === days} onChange={() => onChange({ ...filters, deliveryTime: days ?? undefined })} className="accent-[#1dbf73]" />
                <span className="text-sm text-[#404145]">{label}</span>
              </label>
            ))}
          </div>
        ))}

        {/* Seller level */}
        {filterSection("Seller Level", levelOpen, setLevelOpen, (
          <div className="space-y-1.5">
            {[
              { label: "Top Rated", value: "top" },
              { label: "Level 2", value: "level2" },
              { label: "Level 1", value: "level1" },
              { label: "New Arrival", value: "new" },
            ].map(({ label, value }) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={filters.sellerLevel === value} onChange={() => onChange({ ...filters, sellerLevel: filters.sellerLevel === value ? null : value as SearchFilters["sellerLevel"] })} className="accent-[#1dbf73]" />
                <span className="text-sm text-[#404145]">{label}</span>
              </label>
            ))}
          </div>
        ))}

        {/* Online sellers */}
        <div className="pt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={!!filters.onlineSellers} onChange={(e) => onChange({ ...filters, onlineSellers: e.target.checked })} className="accent-[#1dbf73]" />
            <span className="text-sm font-medium text-[#404145]">Online Sellers Only</span>
          </label>
        </div>
      </div>
    </aside>
  );
}
