import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { GigCard } from "@/components/gig/GigCard";
import { prisma } from "@/lib/prisma";

interface Props { params: Promise<{ category: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = await prisma.category.findUnique({ where: { slug: category } });
  return {
    title: cat ? `${cat.name} Services – Earner` : "Category – Earner",
    description: cat?.description ?? "Browse services in this category",
  };
}

export default async function CategoryPage({ params, searchParams }: { params: Props["params"], searchParams: Promise<{ sub?: string }> }) {
  const { category } = await params;
  const { sub } = await searchParams;

  const cat = await prisma.category.findUnique({ 
    where: { slug: category },
    include: { subcategories: true }
  });
  if (!cat) notFound();

  // Find subcategory if filter provided
  const subcat = sub ? await prisma.subCategory.findUnique({ where: { slug: sub } }) : null;

  // Pull REAL gigs from the database
  const gigsRaw = await prisma.gig.findMany({
    where: { 
      categoryId: cat.id, 
      ...(subcat ? { subcategoryId: subcat.id } : {}),
      status: "ACTIVE" 
    },
    include: { seller: true, category: true, media: true, packages: true },
    take: 50,
  });

  const mapPackage = (p: any) => {
    if (!p) return null;
    return {
      name: p.name,
      description: p.description,
      price: Number(p.price),
      deliveryTime: Number(p.deliveryDays),
      revisions: Number(p.revisions),
      features: p.features || [],
    };
  };

  const gigs = gigsRaw.map((gig: any) => {
    const basic = mapPackage(gig.packages?.find((p: any) => p.tier === "BASIC"));
    const standard = mapPackage(gig.packages?.find((p: any) => p.tier === "STANDARD"));
    const premium = mapPackage(gig.packages?.find((p: any) => p.tier === "PREMIUM"));

    return {
      ...gig,
      category: gig.category?.name,
      seller: {
        ...gig.seller,
        username: gig.seller.name,
        displayName: gig.seller.name,
        avatar: gig.seller.avatar,
        isOnline: true,
        level: "new",
      },
      images: gig.media ? gig.media.sort((a: any, b: any) => a.order - b.order).map((m: any) => m.url) : [],
      bestSeller: false,
      featured: false,
      rating: 0,
      reviewCount: 0,
      basicPackage: basic,
      standardPackage: standard,
      premiumPackage: premium,
      packages: {
        basic,
        standard,
        premium,
      }
    };
  }) as any[];
  return (
    <div>
      {/* ── Category Hero Banner ── */}
      <div
        className="relative overflow-hidden flex items-center"
        style={{ backgroundColor: "#0b3a24", minHeight: "260px" }}
      >
        {/* Abstract decorative circles */}
        <div className="absolute right-0 top-0 w-[500px] h-[500px] border border-[#1dbf73]/30 rounded-full translate-x-1/3 -translate-y-1/4 pointer-events-none" />
        <div className="absolute right-24 bottom-0 w-[200px] h-[200px] bg-[#1dbf73]/20 rounded-t-full translate-y-1/3 pointer-events-none" />
        <div className="absolute left-1/2 top-8 w-[280px] h-[280px] border border-[#1dbf73]/20 rounded-full -translate-x-1/4 pointer-events-none" />

        <div className="container-fiverr relative z-10 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <span className="text-6xl">{cat.icon}</span>
            <div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{cat.name}</h1>
              <p className="text-white/80 text-lg">{cat.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Subcategory pills ── */}
      <div className="border-b border-[#e4e5e7] sticky top-[80px] bg-white z-30">
        <div className="container-fiverr py-4">
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/categories/${cat.slug}`}
              className="px-4 py-1.5 rounded-full text-sm font-medium bg-[#1dbf73] text-white"
            >
              All
            </Link>
            {cat.subcategories.map((sub) => (
              <Link
                key={sub.id}
                href={`/categories/${cat.slug}?sub=${sub.slug}`}
                className="px-4 py-1.5 rounded-full border border-[#e4e5e7] text-sm text-[#74767e] hover:border-[#1dbf73] hover:text-[#1dbf73] transition-colors"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Gigs Grid ── */}
      <div className="container-fiverr py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#404145]">
            {gigs.length > 0
              ? `${gigs.length} service${gigs.length !== 1 ? "s" : ""} available`
              : `Services in ${cat.name}`}
          </h2>
        </div>

        {gigs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {gigs.map((gig) => (
              <GigCard key={gig.id} gig={gig} />
            ))}
          </div>
        ) : (
          /* No gigs for this category yet */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-6xl mb-4">{cat.icon}</span>
            <h3 className="text-xl font-bold text-[#404145] mb-2">
              No services listed yet in {cat.name}
            </h3>
            <p className="text-[#74767e] max-w-sm">
              Sellers haven't added gigs to this category yet. Check back soon as our marketplace grows!
            </p>
            <Link
              href="/dashboard"
              className="mt-6 bg-[#1dbf73] hover:bg-[#19a463] text-white px-6 py-2.5 rounded font-semibold transition-colors"
            >
              Browse all services
            </Link>
          </div>
        )}
      </div>

      {/* ── Explore Subcategories at bottom ── */}
      {cat.subcategories && cat.subcategories.length > 0 && (
        <div className="border-t border-[#e4e5e7] bg-[#fafafa]">
          <div className="container-fiverr py-12">
            <h2 className="text-xl font-bold text-[#404145] mb-8">
              Explore {cat.name}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {cat.subcategories.map((sc) => (
                <div key={sc.id} className="bg-white p-5 rounded-lg border border-[#e4e5e7] hover:border-[#1dbf73] transition-all group">
                  <Link
                    href={`/categories/${cat.slug}?sub=${sc.slug}`}
                    className="font-bold text-sm text-[#404145] group-hover:text-[#1dbf73] transition-colors block mb-1"
                  >
                    {sc.name}
                  </Link>
                  {sc.description && (
                    <p className="text-xs text-[#74767e] line-clamp-2">
                      {sc.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
