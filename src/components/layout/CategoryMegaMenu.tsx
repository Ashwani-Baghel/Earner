"use client";

import Link from "next/link";
import type { Category } from "../../lib/types";

interface Props {
  category: Category;
  onClose: () => void;
}

export function CategoryMegaMenu({ category, onClose }: Props) {
  if (!category.megaGroups || category.megaGroups.length === 0) return null;

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
            className="grid gap-8"
            style={{
              gridTemplateColumns: `repeat(${Math.min(category.megaGroups.length, 4)}, 1fr)`,
            }}
          >
            {category.megaGroups.map((group) => (
              <div key={group.title}>
                <h4 className="text-[13px] font-bold text-[#404145] mb-3 uppercase tracking-wide">
                  {group.title}
                </h4>
                <ul className="space-y-2">
                  {group.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={`/categories/${category.slug}?sub=${link.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-2 text-[14px] text-[#74767e] hover:text-[#1dbf73] transition-colors group"
                      >
                        <span className="group-hover:translate-x-0.5 transition-transform">
                          {link.name}
                        </span>
                        {link.isNew && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#e6f7ef] text-[#1dbf73] border border-[#1dbf73] uppercase tracking-wide leading-none">
                            NEW
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
