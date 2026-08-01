"use client";

import Link from "next/link";
import type { Category } from "../../lib/types";

interface Props {
  category: Category;
  onClose: () => void;
}

export function CategoryMegaMenu({ category, onClose }: Props) {
  if (!category.subcategories || category.subcategories.length === 0) return null;

  const groupedSubs: Record<string, any[]> = {};
  category.subcategories.forEach((sub: any) => {
    const group = sub.groupName || "Other";
    if (!groupedSubs[group]) groupedSubs[group] = [];
    groupedSubs[group].push(sub);
  });

  return (
    <div className="absolute left-0 right-0 top-full z-50 animate-fade-in">
      {/* green top accent line */}
      <div className="h-[3px] bg-[#1dbf73] w-full" />

      <div className="bg-white border-b border-[#e4e5e7] shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
        <div className="container-earner pt-4 pb-6">
          {/* Category header */}
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#e4e5e7]">
            <span className="text-3xl">{category.icon}</span>
            <div>
              <h3 className="text-lg font-bold text-[#404145]">{category.name}</h3>
              <p className="text-sm text-[#74767e]">{category.description}</p>
            </div>
            <Link
              href={`/categories/${category.slug}`}
              onClick={onClose}
              className="ml-auto text-sm text-[#1dbf73] font-semibold hover:underline flex-shrink-0"
            >
              Explore all &rarr;
            </Link>
          </div>

          {/* Mega columns grid */}
          <div
            className="grid gap-x-8 gap-y-8"
            style={{
              gridTemplateColumns: `repeat(${Math.max(1, Math.min(Object.keys(groupedSubs).length, 4))}, minmax(0, 1fr))`,
            }}
          >
            {Object.entries(groupedSubs).map(([group, subs]) => (
              <div key={group} className="flex flex-col gap-3">
                {group !== "Other" && (
                  <h4 className="font-bold text-[#404145] text-[15px]">{group}</h4>
                )}
                <div className="flex flex-col gap-2">
                  {subs.map((sub: any) => (
                    <Link
                      key={sub.slug}
                      href={`/categories/${category.slug}?sub=${sub.slug}`}
                      onClick={onClose}
                      className="text-[14px] text-[#74767e] hover:text-[#1dbf73] transition-colors"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
