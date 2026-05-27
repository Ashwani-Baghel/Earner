import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Clock, Star, MessageSquare } from "lucide-react";
import { getSellerByUsername } from "@/lib/mock-data/sellers";
import { getGigsBySeller } from "@/lib/mock-data/gigs";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { GigCard } from "@/components/gig/GigCard";
import { StarRating } from "@/components/ui/StarRating";
import { getSellerLevelLabel, formatMemberSince, formatNumber } from "@/lib/utils";

interface Props { params: Promise<{ username: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const seller = getSellerByUsername(username);
  return {
    title: seller ? `${seller.displayName} – Fiverr Clone` : "Seller Profile",
    description: seller?.tagline,
  };
}

export default async function SellerPage({ params }: Props) {
  const { username } = await params;
  const seller = getSellerByUsername(username);
  if (!seller) notFound();

  const gigs = getGigsBySeller(seller.uid);
  const allGigs = gigs.length > 0 ? gigs : (await import("@/lib/mock-data/gigs")).GIGS.slice(0, 4);
  const level = getSellerLevelLabel(seller.level);

  const stats = [
    { label: "Completed", value: formatNumber(seller.completedOrders) },
    { label: "Rating", value: seller.rating.toFixed(1) },
    { label: "Response", value: seller.responseTime },
  ];

  return (
    <div className="container-fiverr py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-72 xl:w-80 flex-shrink-0">
          <div className="bg-white rounded-xl border border-[#e4e5e7] p-6 sticky top-20">
            {/* Avatar */}
            <div className="flex flex-col items-center text-center mb-5">
              <Avatar src={seller.avatar} alt={seller.displayName} size="xl" online={seller.isOnline} />
              <h1 className="mt-3 text-xl font-bold text-[#404145]">{seller.displayName}</h1>
              <p className="text-sm text-[#74767e] mt-1">@{seller.username}</p>
              <div className="mt-2 flex items-center gap-2 flex-wrap justify-center">
                <Badge variant={seller.level === "pro" ? "blue" : seller.level === "top" ? "yellow" : "green"}>{level.label}</Badge>
                {seller.isOnline && <span className="text-xs text-[#1dbf73] font-medium">● Online</span>}
              </div>
            </div>

            <Link href="/messages" className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-[#1dbf73] text-[#1dbf73] rounded-lg font-semibold text-sm hover:bg-[#e6f7ef] transition-colors mb-5">
              <MessageSquare size={16} /> Contact Me
            </Link>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              {stats.map(({ label, value }) => (
                <div key={label} className="text-center p-2 bg-[#fafafa] rounded-lg">
                  <p className="font-bold text-[#404145] text-sm">{value}</p>
                  <p className="text-xs text-[#74767e]">{label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-sm text-[#74767e]">
              <div className="flex items-center gap-2"><MapPin size={14} /> {seller.location}</div>
              <div className="flex items-center gap-2"><Clock size={14} /> Member since {formatMemberSince(seller.memberSince)}</div>
              <div className="flex items-center gap-2"><Star size={14} className="text-[#ffbe00]" /> {seller.rating} ({seller.reviewCount} reviews)</div>
            </div>

            {/* Languages */}
            <div className="mt-5 pt-5 border-t border-[#e4e5e7]">
              <h3 className="font-semibold text-sm text-[#404145] mb-2">Languages</h3>
              {seller.languages.map((lang) => (
                <div key={lang.name} className="flex items-center justify-between mt-1">
                  <span className="text-sm text-[#404145]">{lang.name}</span>
                  <span className="text-xs text-[#74767e] capitalize">{lang.level}</span>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div className="mt-5 pt-5 border-t border-[#e4e5e7]">
              <h3 className="font-semibold text-sm text-[#404145] mb-3">Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {seller.skills.map((skill) => (
                  <span key={skill} className="px-2 py-0.5 bg-[#fafafa] border border-[#e4e5e7] rounded-full text-xs text-[#404145]">{skill}</span>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* About */}
          <section className="bg-white rounded-xl border border-[#e4e5e7] p-6 mb-6">
            <h2 className="text-lg font-bold text-[#404145] mb-3">About Me</h2>
            <p className="text-sm text-[#74767e] leading-relaxed">{seller.description}</p>
          </section>

          {/* Rating summary */}
          <div className="bg-white rounded-xl border border-[#e4e5e7] p-6 mb-6">
            <h2 className="text-lg font-bold text-[#404145] mb-3">Reviews</h2>
            <StarRating rating={seller.rating} reviewCount={seller.reviewCount} size="lg" />
          </div>

          {/* Gigs */}
          <section>
            <h2 className="text-lg font-bold text-[#404145] mb-4">My Gigs ({allGigs.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {allGigs.map((gig) => <GigCard key={gig.id} gig={gig} />)}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
