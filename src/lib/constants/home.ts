/**
 * ─────────────────────────────────────────────────────────────────────────────
 * HOME PAGE CONSTANTS
 * Folder: src/lib/constants/home.ts
 *
 * Edit this file to change any text/data shown on the homepage:
 *   • Hero rotating keywords
 *   • Quick-search pill labels (below search bar)
 *   • Trusted-by brand logos
 *   • Popular service cards
 *   • "Make it happen" benefits
 *   • AI Director profiles
 *   • Success stories
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── 1. HERO: rotating text next to the headline (optional, not currently shown)
export const HERO_ROTATING_KEYWORDS = [
  "logo design",
  "website development",
  "video animation",
  "SEO experts",
  "AI solutions",
  "content writing",
  "mobile apps",
  "social media",
];

// ── 2. HERO: Search bar placeholder cycling text
export const SEARCH_PLACEHOLDERS = [
  "Search for any service...",
  "Try  \"website design\"",
  "Try  \"logo design\"",
  "Try  \"video editing\"",
  "Try  \"SEO optimization\"",
  "Try  \"mobile app\"",
];

// ── 3. HERO: Quick-search pill buttons below the search bar
//    Each has a label shown to the user and a `query` used when clicked.
export const QUICK_SEARCHES = [
  { label: "Website Development", query: "website development" },
  { label: "Architecture & Interior Design", query: "architecture interior design" },
  { label: "UGC Videos", query: "ugc videos" },
  { label: "Video Editing", query: "video editing" },
  { label: "Book Publishing", query: "book publishing" },
];

// ── 4. HERO: Trusted-by brand logos
//    `style` → optional CSS for the wordmark (font-size, font-weight, letterSpacing etc.)
export const TRUSTED_BRANDS = [
  { name: "Meta",     wordmark: "𝗠eta",     style: "font-size:15px; font-weight:800; letter-spacing:-0.5px" },
  { name: "Google",   wordmark: "Google",   style: "font-size:15px; font-weight:600; letter-spacing:-0.3px" },
  { name: "Netflix",  wordmark: "NETFLIX",  style: "font-size:13px; font-weight:900; letter-spacing:1px"    },
  { name: "P&G",      wordmark: "P&G",      style: "font-size:14px; font-weight:700"                       },
  { name: "PayPal",   wordmark: "PayPal",   style: "font-size:14px; font-weight:700; letter-spacing:-0.3px" },
  { name: "Payoneer", wordmark: "◯Payoneer",style: "font-size:13px; font-weight:600"                       },
];

// ── 5. POPULAR SERVICES: Scrollable category cards in the "Popular services" section
//    `bg`       → card background color
//    `cardBg`   → inner illustration card color
//    `image`    → illustration or screenshot image
//    `href`     → page this card links to
export const POPULAR_SERVICE_CARDS = [
  {
    id: "vibe-coding",
    label: "Vibe Coding",
    bg: "#1e3a2f",
    cardBg: "#f0b8c4",
    image: "https://picsum.photos/seed/vibe-coding-card/380/280",
    href: "/categories/programming-tech",
  },
  {
    id: "website-development",
    label: "Website Development",
    bg: "#1a3c40",
    cardBg: "#b8e0e4",
    image: "https://picsum.photos/seed/website-dev-card/380/280",
    href: "/categories/programming-tech",
  },
  {
    id: "video-editing",
    label: "Video Editing",
    bg: "#3a1520",
    cardBg: "#f8d4c0",
    image: "https://picsum.photos/seed/video-edit-card/380/280",
    href: "/categories/video-animation",
  },
  {
    id: "software-development",
    label: "Software Development",
    bg: "#1c3a28",
    cardBg: "#c8e8d0",
    image: "https://picsum.photos/seed/software-dev-card/380/280",
    href: "/categories/programming-tech",
  },
  {
    id: "book-publishing",
    label: "Book Publishing",
    bg: "#3a3010",
    cardBg: "#d4e8c0",
    image: "https://picsum.photos/seed/book-pub-card/380/280",
    href: "/categories/writing-translation",
  },
  {
    id: "architecture-design",
    label: "Architecture & Interior Design",
    bg: "#3a2015",
    cardBg: "#f0c8b0",
    image: "https://picsum.photos/seed/arch-design-card/380/280",
    href: "/categories/consulting",
  },
  {
    id: "ai-services",
    label: "AI Services",
    bg: "#1a1040",
    cardBg: "#c0b8f0",
    image: "https://picsum.photos/seed/ai-service-card/380/280",
    href: "/categories/ai-services",
  },
  {
    id: "social-media",
    label: "Social Media Marketing",
    bg: "#10283a",
    cardBg: "#b8d4f0",
    image: "https://picsum.photos/seed/social-media-card/380/280",
    href: "/categories/digital-marketing",
  },
];

// ── 6. MAKE IT HAPPEN: 4 benefit items below Popular Services
export const MAKE_IT_HAPPEN_BENEFITS = [
  {
    icon: "🧩",
    title: "Access a pool of top talent",
    subtitle: "across 700 categories",
  },
  {
    icon: "✅",
    title: "Enjoy a simple, easy-to-use",
    subtitle: "matching experience",
  },
  {
    icon: "⚡",
    title: "Get quality work done quickly",
    subtitle: "and within budget",
  },
  {
    icon: "💸",
    title: "Only pay when",
    subtitle: "you're happy",
  },
];

// ── 7. AI DIRECTOR: Profile cards in the dark banner section
export const AI_DIRECTORS = [
  {
    id: "ron",
    name: "Ron Baranov",
    label: "AI Director",
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=ron-baranov",
  },
  {
    id: "jagger",
    name: "Jagger Waters",
    label: "AI Director",
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=jagger-waters",
  },
  {
    id: "visiblemaker",
    name: "The Visiblemaker",
    label: "AI Director",
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=visible-maker",
  },
  {
    id: "tooshort",
    name: "Too Short For Modeling",
    label: "AI Director",
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=too-short",
  },
  {
    id: "billy",
    name: "Billy Boman",
    label: "AI Director",
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=billy-boman",
  },
];

// ── 8. FIVERR PRO: Bullet points in the green Pro section
export const FIVERR_PRO_FEATURES = [
  "Work with experts who will source, interview, and vet freelancers for you",
  "Get a report with clear recommendations",
  "Hire vetted freelance talent with confidence",
];

// ── 9. SUCCESS STORIES: Carousel in "What success on Earner looks like"
export const SUCCESS_STORIES = [
  {
    id: "vontelle",
    company: "Vontelle Eyewear",
    tagline: "Vontelle Eyewear turns to Earner freelancers to bring their vision to life.",
    quote:
      "\"We've been able to get world-class talent at a reasonable cost. Earner helped us scale our marketing and brand faster than we ever imagined.\"",
    person: "Beatrice Dixon, CEO at Vontelle Eyewear",
    image: "https://picsum.photos/seed/vontelle-success/800/450",
  },
  {
    id: "speedify",
    company: "Speedify",
    tagline: "How Speedify scaled content production with Earner.",
    quote:
      "\"Earner transformed our content strategy. We scaled from 1 blog post per month to 30+ pieces of quality content weekly.\"",
    person: "John R., CMO at Speedify",
    image: "https://picsum.photos/seed/speedify-success/800/450",
  },
  {
    id: "growthhq",
    company: "GrowthHQ",
    tagline: "GrowthHQ finds top-tier creative talent on Earner.",
    quote:
      "\"We hired 12 freelancers across different disciplines and every single delivery exceeded our expectations.\"",
    person: "Marcus T., Founder at GrowthHQ",
    image: "https://picsum.photos/seed/growthhq-success/800/450",
  },
];
