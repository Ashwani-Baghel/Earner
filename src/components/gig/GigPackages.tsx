"use client";
import { useState } from "react";
import { Check, Clock, RefreshCw } from "lucide-react";
import type { Gig, PackageTier } from "../../lib/types";
import { Button } from "../ui/Button";
import { useCurrency } from "../../context/CurrencyContext";
import { useCart } from "../../context/CartContext";

interface GigPackagesProps {
  gig: Gig;
}

export function GigPackages({ gig }: GigPackagesProps) {
  const [activeTier, setActiveTier] = useState<PackageTier>("basic");
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  const tiers: PackageTier[] = ["basic", "standard", "premium"];
  const pkg = gig?.packages?.[activeTier];

  if (!pkg) {
    return (
      <div className="bg-white rounded-xl border border-[#e4e5e7] p-5 text-center text-sm text-[#74767e]">
        Package information unavailable.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#e4e5e7] overflow-hidden sticky top-20">
      {/* Tier tabs */}
      <div className="flex border-b border-[#e4e5e7]">
        {tiers.map((tier) => (
          <button
            key={tier}
            onClick={() => setActiveTier(tier)}
            className={`flex-1 py-3 text-sm font-semibold capitalize transition-all border-b-2 ${activeTier === tier
                ? "border-[#1dbf73] text-[#1dbf73]"
                : "border-transparent text-[#74767e] hover:text-[#404145]"
              }`}
          >
            {tier}
          </button>
        ))}
      </div>

      {/* Package details */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-bold text-[#404145]">{pkg.name}</h3>
          <span className="text-2xl font-bold text-[#404145]">{formatPrice(pkg.price)}</span>
        </div>
        <p className="text-sm text-[#74767e] mb-4 leading-relaxed">{pkg.description}</p>

        <div className="flex items-center gap-4 mb-4 text-sm text-[#404145]">
          <span className="flex items-center gap-1.5">
            <Clock size={14} className="text-[#74767e]" />
            {pkg.deliveryTime} day{pkg.deliveryTime > 1 ? "s" : ""} delivery
          </span>
          <span className="flex items-center gap-1.5">
            <RefreshCw size={14} className="text-[#74767e]" />
            {pkg.revisions === -1 ? "Unlimited" : pkg.revisions} revision{pkg.revisions !== 1 ? "s" : ""}
          </span>
        </div>

        <ul className="space-y-2 mb-5">
          {(pkg.features || []).map((feature: string) => (
            <li key={feature} className="flex items-center gap-2 text-sm text-[#404145]">
              <Check size={14} className="text-[#1dbf73] flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>

        <Button
          className="w-full mb-3"
          size="lg"
          onClick={() => addToCart(gig, activeTier)}
        >
          Continue ({formatPrice(pkg.price)})
        </Button>
        <Button variant="outline" className="w-full" size="md">
          Compare Packages
        </Button>
      </div>

      {/* Trust badges */}
      <div className="px-5 pb-4 border-t border-[#e4e5e7] pt-4">
        <div className="flex items-center justify-center gap-4 text-xs text-[#74767e]">
          <span>🔒 Secure payment</span>
          <span>✅ Money-back guarantee</span>
        </div>
      </div>
    </div>
  );
}
