import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Clock, RefreshCw, Shield, MessageSquare } from "lucide-react";
import { GigGallery } from "@/components/gig/GigGallery";
import { GigPackages } from "@/components/gig/GigPackages";
import { GigReviews } from "@/components/gig/GigReviews";
import { StarRating } from "@/components/ui/StarRating";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { GigCard } from "@/components/gig/GigCard";
import { ContactSellerButton } from "@/components/gig/ContactSellerButton";
import { WishlistButton } from "@/components/gig/WishlistButton";
import { getSellerLevelLabel, formatMemberSince } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

const mapPrismaGig = (gigRaw: any) => {
  const pkgs = gigRaw.packages || [];
  
  const mapPackage = (p: any, tierName: string) => {
    if (!p) {
      return {
        name: `${tierName} Package`,
        description: `${tierName} service package details.`,
        price: tierName === "Basic" ? 5 : tierName === "Standard" ? 15 : 30,
        deliveryTime: tierName === "Basic" ? 3 : tierName === "Standard" ? 5 : 7,
        revisions: tierName === "Basic" ? 1 : tierName === "Standard" ? 3 : -1,
        features: []
      };
    }
    return {
      name: p.name,
      description: p.description,
      price: Number(p.price),
      deliveryTime: Number(p.deliveryDays),
      revisions: Number(p.revisions),
      features: p.features || [],
    };
  };

  const basic = mapPackage(pkgs.find((p: any) => p.tier.toUpperCase() === "BASIC"), "Basic");
  const standard = mapPackage(pkgs.find((p: any) => p.tier.toUpperCase() === "STANDARD"), "Standard");
  const premium = mapPackage(pkgs.find((p: any) => p.tier.toUpperCase() === "PREMIUM"), "Premium");

  return {
    ...gigRaw,
    category: gigRaw.category?.slug ?? "other",
    seller: {
      ...gigRaw.seller,
      username: gigRaw.seller?.name || "Anonymous",
      displayName: gigRaw.seller?.name || "Anonymous",
      avatar: gigRaw.seller?.avatar || null,
      isOnline: true,
      level: "new",
      tagline: "I provide high quality services",
      completedOrders: 0,
      location: "Global",
      responseTime: "1 hr",
      memberSince: gigRaw.seller?.createdAt ? gigRaw.seller.createdAt.toISOString() : new Date().toISOString(),
    },
    images: (gigRaw.media || [])
      .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
      .map((m: any) => m.url),
    tags: gigRaw.tags as string[],
    rating: 0,
    reviewCount: 0,
    packages: {
      basic,
      standard,
      premium,
    }
  };
};

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const gigRaw = await prisma.gig.findUnique({ where: { id } });
  return {
    title: gigRaw ? `${gigRaw.title} – Earner` : "Gig Not Found – Earner",
    description: gigRaw?.description?.slice(0, 160),
  };
}

export default async function GigDetailPage({ params }: Props) {
  const { id } = await params;
  const gigRaw = await prisma.gig.findUnique({
    where: { id },
    include: { seller: true, category: true, packages: true, media: true }
  });

  if (!gigRaw) {
    return (
      <div className="container-earner py-24 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold text-[#404145] mb-4">Gig Not Found</h1>
        <p className="text-lg text-[#74767e] mb-8">The service you are looking for is no longer available or the link is incorrect.</p>
        <Link href="/" className="px-6 py-3 bg-[#1dbf73] text-white font-semibold rounded-lg hover:bg-[#19a463] transition-colors">
          Browse Other Services
        </Link>
      </div>
    );
  }

  const gig = mapPrismaGig(gigRaw);
  const reviews: any[] = [];

  // Fetch a few related gigs from the same category
  const relatedRaw = await prisma.gig.findMany({
    where: { categoryId: gig.categoryId, id: { not: gig.id }, status: "ACTIVE" },
    include: { seller: true, category: true, packages: true, media: true },
    take: 4
  });
  const related = relatedRaw.map(mapPrismaGig);

  const sellerLevel = getSellerLevelLabel(gig.seller.level);
  const categorySlug = typeof gig.category === "string"
    ? gig.category
    : (gig.category && typeof gig.category === "object" && "slug" in gig.category)
    ? (gig.category as any).slug
    : "other";

  return (
    <div className="container-earner py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-[#74767e] mb-6 flex items-center gap-1">
        <Link href="/" className="hover:text-[#1dbf73]">Home</Link>
        <span>/</span>
        <Link href={`/categories/${categorySlug}`} className="hover:text-[#1dbf73] capitalize">{categorySlug.replace(/-/g, " ")}</Link>
        <span>/</span>
        <span className="text-[#404145] truncate max-w-xs">{gig.title}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left column */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-[#404145] mb-4">{gig.title}</h1>

          {/* Seller chip */}
          <Link href={`/seller/${gig.seller.username}`} className="flex items-center gap-3 mb-4 group w-fit">
            <Avatar src={gig.seller.avatar} alt={gig.seller.displayName} size="md" online={gig.seller.isOnline} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-[#404145] group-hover:text-[#1dbf73] transition-colors">{gig.seller.displayName}</span>
                <Badge variant={gig.seller.level === "pro" ? "blue" : gig.seller.level === "top" ? "yellow" : "green"} size="sm">{sellerLevel.label}</Badge>
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <StarRating rating={gig.rating} reviewCount={gig.reviewCount} size="sm" />
                <span className="text-xs text-[#74767e]">{gig.seller.completedOrders} orders</span>
              </div>
            </div>
          </Link>

          {/* Gallery */}
          <GigGallery images={gig.images} title={gig.title} />

          {/* Description */}
          <section className="mt-8">
            <h2 className="text-xl font-bold text-[#404145] mb-4">About This Gig</h2>
            <p className="text-sm text-[#404145] leading-relaxed whitespace-pre-line">{gig.description}</p>
          </section>

          {/* Tags */}
          <div className="mt-5 flex flex-wrap gap-2">
            {gig.tags.map((tag: string) => (
              <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`}
                className="px-3 py-1 text-xs text-[#74767e] border border-[#e4e5e7] rounded-full hover:border-[#1dbf73] hover:text-[#1dbf73] transition-colors">
                {tag}
              </Link>
            ))}
          </div>

          {/* Seller info card */}
          <section className="mt-10 p-6 border border-[#e4e5e7] rounded-xl">
            <h2 className="text-xl font-bold text-[#404145] mb-5">About the Seller</h2>
            <div className="flex items-start gap-4">
              <Avatar src={gig.seller.avatar} alt={gig.seller.displayName} size="xl" online={gig.seller.isOnline} />
              <div className="flex-1">
                <Link href={`/seller/${gig.seller.username}`} className="font-bold text-[#404145] hover:text-[#1dbf73] transition-colors text-lg">{gig.seller.displayName}</Link>
                <p className="text-sm text-[#74767e] mb-2">{gig.seller.tagline}</p>
                <div className="flex flex-wrap gap-4 text-sm text-[#74767e] mt-2">
                  <span className="flex items-center gap-1"><Clock size={14} /> Avg. response: {gig.seller.responseTime}</span>
                  <span>📍 {gig.seller.location}</span>
                  <span>🗓 Member since {formatMemberSince(gig.seller.memberSince)}</span>
                </div>
                <div className="flex gap-3 mt-4">
                  <Link href={`/seller/${gig.seller.username}`} className="px-4 py-2 border border-[#404145] text-[#404145] rounded-lg text-sm font-semibold hover:bg-[#404145] hover:text-white transition-all">
                    View Profile
                  </Link>
                  <ContactSellerButton sellerId={gig.seller.id} sellerName={gig.seller.displayName} sellerAvatar={gig.seller.avatar} />
                  <WishlistButton gigId={gig.id} />
                </div>
              </div>
            </div>
            <p className="text-sm text-[#74767e] leading-relaxed mt-4">{gig.seller.description}</p>
          </section>

          {/* Reviews */}
          {reviews.length > 0 && <GigReviews reviews={reviews} rating={gig.rating} reviewCount={gig.reviewCount} />}
        </div>

        {/* Right column: sticky packages */}
        <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
          {(() => { console.log("DEBUG: gig.packages inside render =", JSON.stringify(gig.packages)); return null; })()}
          <GigPackages gig={gig} />

          {/* Trust badges */}
          <div className="mt-4 rounded-xl border border-[#e4e5e7] p-4 space-y-3">
            {[
              { icon: Shield, text: "Earner protects your payment until you approve the delivery" },
              { icon: RefreshCw, text: "Request free revisions within the agreed period" },
              { icon: MessageSquare, text: "24/7 customer support" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <Icon size={16} className="text-[#1dbf73] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-[#74767e]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Gigs */}
      {related.length > 0 && (
        <section className="mt-16 border-t border-[#e4e5e7] pt-10">
          <h2 className="text-2xl font-bold text-[#404145] mb-6">Recommended for you</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((g) => (
              <GigCard key={g.id} gig={g} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
