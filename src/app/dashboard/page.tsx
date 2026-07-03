"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { GigCard } from "@/components/gig/GigCard";
import { CATEGORIES } from "@/lib/mock-data/categories";
import { ChevronRight, PlayCircle, Sparkles, Users, Search, FileText } from "lucide-react";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [brief, setBrief] = useState("");

  const [trendingGigs, setTrendingGigs] = useState<any[]>([]);
  const [dynamicGroups, setDynamicGroups] = useState<any[]>([]);
  const [fetchingGigs, setFetchingGigs] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const fetchPopular = async () => {
      try {
        const res = await fetch("/api/gigs?sort=popular&limit=50");
        if (res.ok) {
          const data = await res.json();
          setTrendingGigs(data);

          // Group by category to create dynamic cards
          const categoryMap = new Map<string, any[]>();
          data.forEach((g: any) => {
            const cat = g.category || "Other";
            if (!categoryMap.has(cat)) categoryMap.set(cat, []);
            categoryMap.get(cat)!.push(g);
          });
          
          // Pick top 4 categories
          const topCats = Array.from(categoryMap.entries())
            .sort((a, b) => b[1].length - a[1].length)
            .slice(0, 4);

          const colors = ["#2a1a0f", "#1a1a0f", "#1f0f0f", "#0f1a0f"];
          const groups = topCats.map(([catName, gigsInCat], idx) => ({
            label: catName,
            slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            color: colors[idx % colors.length],
            image: gigsInCat[0]?.images?.[0] || `https://picsum.photos/seed/${idx}/400/300`,
            links: gigsInCat.slice(0, 5).map(g => g.title.replace(/I will /i, "").replace(/^./, (s: string) => s.toUpperCase())),
          }));
          setDynamicGroups(groups);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setFetchingGigs(false);
      }
    };
    fetchPopular();
  }, [user]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="h-10 w-10 border-4 border-[#1dbf73] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return null;

  return (
    <div className="bg-white">

      {/* ──────────────────────────────────────────────────────────────────
          SECTION 1 — Trending Services Banner (matches screenshot 1 top)
      ───────────────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden flex flex-col items-center justify-center text-white text-center"
        style={{ background: "linear-gradient(135deg, #4a0e2e 0%, #6b1a3a 40%, #8b2252 70%, #4a0e2e 100%)", minHeight: "260px" }}
      >
        {/* Decorative shapes like in screenshot */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        {/* Star decorations */}
        <div className="absolute right-12 top-8 text-white/30 text-8xl select-none pointer-events-none" style={{ fontFamily: "sans-serif" }}>✦</div>
        <div className="absolute right-32 bottom-4 text-white/20 text-6xl select-none pointer-events-none">✦</div>
        <div className="absolute left-16 bottom-8 text-white/15 text-9xl select-none pointer-events-none">✦</div>

        <div className="relative z-10 px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">Trending Services</h1>
          <p className="text-white/85 text-lg mb-8">Popular picks, proven results.</p>
          <button className="inline-flex items-center gap-2 border border-white/80 text-white px-6 py-2.5 rounded-full hover:bg-white/10 transition-all font-medium">
            <PlayCircle size={18} />
            How Earner works
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          SECTION 2 — Explore Trending (4 big image cards)
          These groups pull from the popular database gigs dynamically
      ───────────────────────────────────────────────────────────────── */}
      <div className="container-earner py-12">
        <h2 className="text-2xl font-bold text-[#404145] mb-8">Explore our trending services</h2>
        {fetchingGigs ? (
          <div className="flex justify-center py-8"><div className="h-8 w-8 border-4 border-[#1dbf73] border-t-transparent rounded-full animate-spin" /></div>
        ) : dynamicGroups.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dynamicGroups.map((group) => (
              <Link key={group.label} href={`/search?category=${encodeURIComponent(group.label)}`} className="group block rounded-xl overflow-hidden border border-[#e4e5e7] hover:shadow-lg transition-all">
                {/* Image */}
                <div className="relative h-48 overflow-hidden" style={{ backgroundColor: group.color }}>
                  <img
                    src={group.image}
                    alt={group.label}
                    className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                {/* Links */}
                <div className="p-4 bg-white">
                  <h3 className="font-bold text-[#404145] text-[15px] mb-2">{group.label}</h3>
                  <ul className="space-y-1.5">
                    {group.links.map((link: string, i: number) => (
                      <li key={i} className="text-[13px] text-[#74767e] hover:text-[#1dbf73] transition-colors line-clamp-1">
                        {link}
                      </li>
                    ))}
                  </ul>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-slate-500">No trending categories available right now.</p>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          SECTION 3 — All Trending Gigs Grid (dynamic from gigs.ts)
      ───────────────────────────────────────────────────────────────── */}
      {trendingGigs.length > 0 && (
        <div className="container-earner pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#404145]">Services you may like</h2>
            <Link href="/search" className="text-sm text-[#1dbf73] hover:underline font-medium">See all services →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {fetchingGigs ? (
              <div className="col-span-full flex justify-center py-8"><div className="h-8 w-8 border-4 border-[#1dbf73] border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              trendingGigs.slice(0, 8).map(gig => <GigCard key={gig.id} gig={gig} />)
            )}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          SECTION 4 — AI Brief Generator (screenshot 3 top)
      ───────────────────────────────────────────────────────────────── */}
      <div className="border-t border-b border-[#e4e5e7] py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[#1dbf73] font-semibold text-sm mb-3">Tell us what you need and we'll match you with freelancers perfect for your goal.</p>
          <div className="relative mt-4 bg-white border border-[#e4e5e7] rounded-xl shadow-sm overflow-hidden">
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder="I need to build a new website for my ecommerce business..."
              className="w-full px-5 pt-5 pb-16 text-sm text-[#404145] resize-none outline-none min-h-[120px] placeholder-[#b5b6ba]"
              rows={4}
            />
            <div className="absolute bottom-4 right-4">
              <button className="flex items-center gap-2 bg-[#222325] hover:bg-[#404145] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors">
                <Sparkles size={15} />
                Generate brief
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          SECTION 5 — Find freelance talent your way (screenshot 3 middle)
      ───────────────────────────────────────────────────────────────── */}
      <div className="container-earner py-14">
        <h2 className="text-2xl font-bold text-[#404145] mb-8">Find freelance talent — your way</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: FileText,
              title: "Post a project brief",
              desc: "Generate a brief with AI to receive a curated shortlist of freelancer offers.",
              cta: "Post a brief",
              ctaStyle: "border",
            },
            {
              icon: Search,
              title: "Let us find your freelancer",
              desc: "Save the endless search — we'll source, interview, and vet freelancers for you.",
              cta: "Get started",
              ctaStyle: "border",
              sub: "Only $110",
            },
            {
              icon: Users,
              title: "Get a team built for you",
              desc: "Big project? No problem. We'll build a freelance team and fully execute your project.",
              cta: "Book free consultation",
              ctaStyle: "border",
              sub: "Custom pricing",
            },
          ].map(({ icon: Icon, title, desc, cta, ctaStyle, sub }) => (
            <div key={title} className="border border-[#e4e5e7] rounded-xl p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="h-10 w-10 bg-[#f5f5f5] rounded-lg flex items-center justify-center">
                <Icon size={20} className="text-[#404145]" />
              </div>
              <div>
                <h3 className="font-bold text-[#404145] text-[16px] mb-1">{title}</h3>
                <p className="text-[#74767e] text-sm leading-relaxed">{desc}</p>
              </div>
              <div className="flex items-center gap-3 mt-auto pt-2">
                {sub && <span className="text-sm text-[#74767e]">{sub}</span>}
                <button className="border border-[#404145] text-[#404145] hover:bg-[#404145] hover:text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all">
                  {cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          SECTION 6 — Category Quick Browse
      ───────────────────────────────────────────────────────────────── */}
      <div className="bg-[#fafafa] border-t border-[#e4e5e7]">
        <div className="container-earner py-12">
          <h2 className="text-xl font-bold text-[#404145] mb-6">Browse by category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="flex flex-col items-center gap-2 p-4 bg-white border border-[#e4e5e7] rounded-xl hover:border-[#1dbf73] hover:shadow-sm transition-all group text-center"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="text-[12px] font-medium text-[#74767e] group-hover:text-[#1dbf73] leading-tight">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
