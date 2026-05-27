import type { Gig } from "../types";
import { SELLERS } from "./sellers";

const [alex, sara, kai, maya, marco, emma] = SELLERS;

export const GIGS: Gig[] = [
  // ── Graphics & Design ──────────────────────────────────────────────────────
  {
    id: "gig-1",
    title: "I will design a modern minimalist logo for your business",
    description:
      "Get a professional, memorable logo that perfectly represents your brand. I deliver unique custom designs tailored to your vision — not templates. Includes multiple concepts, unlimited revisions, and all source files.",
    category: "graphics-design",
    subcategory: "logo-design",
    tags: ["logo", "brand", "design", "minimalist", "modern"],
    seller: alex,
    packages: {
      basic: { name: "Basic", description: "1 logo concept, JPG/PNG", price: 25, deliveryTime: 2, revisions: 2, features: ["1 concept", "JPG & PNG", "2 revisions", "Commercial use"] },
      standard: { name: "Standard", description: "3 concepts, all formats", price: 75, deliveryTime: 3, revisions: 5, features: ["3 concepts", "All formats", "5 revisions", "Source files", "Brand guidelines"] },
      premium: { name: "Premium", description: "Full brand package", price: 199, deliveryTime: 5, revisions: -1, features: ["5 concepts", "All formats", "Unlimited revisions", "Business card", "Letterhead", "Social media kit"] },
    },
    images: [
      "https://picsum.photos/seed/logo1/800/600",
      "https://picsum.photos/seed/logo2/800/600",
      "https://picsum.photos/seed/logo3/800/600",
    ],
    rating: 4.9,
    reviewCount: 1482,
    featured: true,
    bestSeller: true,
    createdAt: "2023-01-15",
    updatedAt: "2024-11-20",
  },
  {
    id: "gig-2",
    title: "I will create a complete brand identity design package",
    description:
      "Full brand identity design including logo, color palette, typography, and brand guidelines. Perfect for startups and businesses looking to establish a strong visual presence.",
    category: "graphics-design",
    subcategory: "brand-identity",
    tags: ["branding", "logo", "identity", "design", "startup"],
    seller: alex,
    packages: {
      basic: { name: "Basic", description: "Logo + color palette", price: 99, deliveryTime: 5, revisions: 3, features: ["Logo design", "Color palette", "Typography", "3 revisions"] },
      standard: { name: "Standard", description: "Complete brand kit", price: 249, deliveryTime: 7, revisions: 5, features: ["Logo design", "Brand guidelines", "Business card", "Letterhead", "Social media kit"] },
      premium: { name: "Premium", description: "Full brand ecosystem", price: 499, deliveryTime: 10, revisions: -1, features: ["Everything in Standard", "Email signature", "Presentation template", "Brand manual", "Priority support"] },
    },
    images: [
      "https://picsum.photos/seed/brand1/800/600",
      "https://picsum.photos/seed/brand2/800/600",
    ],
    rating: 4.8,
    reviewCount: 743,
    featured: true,
    bestSeller: false,
    createdAt: "2023-02-20",
    updatedAt: "2024-10-15",
  },
  // ── Programming & Tech ─────────────────────────────────────────────────────
  {
    id: "gig-3",
    title: "I will build a stunning Next.js full-stack web application",
    description:
      "Expert Next.js developer offering complete web application development. I build fast, SEO-optimized, responsive apps with clean code, TypeScript, Tailwind, and any backend you need.",
    category: "programming-tech",
    subcategory: "web-development",
    tags: ["nextjs", "react", "typescript", "fullstack", "website"],
    seller: sara,
    packages: {
      basic: { name: "Basic", description: "Landing page (5 sections)", price: 149, deliveryTime: 5, revisions: 2, features: ["Responsive design", "5 sections", "Contact form", "SEO optimized", "2 revisions"] },
      standard: { name: "Standard", description: "Multi-page website", price: 399, deliveryTime: 10, revisions: 3, features: ["Up to 10 pages", "CMS integration", "Auth system", "Payment gateway", "3 revisions"] },
      premium: { name: "Premium", description: "Full-stack web app", price: 999, deliveryTime: 21, revisions: -1, features: ["Unlimited pages", "Custom API", "Database design", "Admin dashboard", "Deployment", "Unlimited revisions"] },
    },
    images: [
      "https://picsum.photos/seed/webdev1/800/600",
      "https://picsum.photos/seed/webdev2/800/600",
      "https://picsum.photos/seed/webdev3/800/600",
    ],
    rating: 4.8,
    reviewCount: 876,
    featured: true,
    bestSeller: true,
    createdAt: "2022-08-10",
    updatedAt: "2024-12-01",
  },
  {
    id: "gig-4",
    title: "I will develop a mobile app with React Native for iOS and Android",
    description:
      "Cross-platform mobile app development using React Native. I'll build a fully functional, polished mobile app that works on both iOS and Android from a single codebase.",
    category: "programming-tech",
    subcategory: "mobile-development",
    tags: ["react-native", "mobile", "ios", "android", "app"],
    seller: sara,
    packages: {
      basic: { name: "Basic", description: "Simple app (3 screens)", price: 299, deliveryTime: 7, revisions: 2, features: ["3 screens", "Basic navigation", "API integration", "2 revisions"] },
      standard: { name: "Standard", description: "Complete mobile app", price: 699, deliveryTime: 14, revisions: 3, features: ["10 screens", "Auth system", "Push notifications", "App store submission"] },
      premium: { name: "Premium", description: "Enterprise mobile app", price: 1499, deliveryTime: 30, revisions: -1, features: ["Unlimited screens", "Admin panel", "Analytics", "In-app purchases", "Support 3 months"] },
    },
    images: [
      "https://picsum.photos/seed/mobile1/800/600",
      "https://picsum.photos/seed/mobile2/800/600",
    ],
    rating: 4.7,
    reviewCount: 421,
    featured: false,
    bestSeller: false,
    createdAt: "2022-11-05",
    updatedAt: "2024-09-22",
  },
  // ── Video & Animation ──────────────────────────────────────────────────────
  {
    id: "gig-5",
    title: "I will create a cinematic promotional video for your business",
    description:
      "High-quality promotional video that showcases your brand's story, products, or services. Using professional editing, color grading, and motion graphics to create a video that wows your audience.",
    category: "video-animation",
    subcategory: "video-editing",
    tags: ["video", "promo", "commercial", "animation", "editing"],
    seller: kai,
    packages: {
      basic: { name: "Basic", description: "30-second promo", price: 79, deliveryTime: 3, revisions: 2, features: ["30 second video", "Stock footage", "Background music", "2 revisions"] },
      standard: { name: "Standard", description: "60-second branded video", price: 199, deliveryTime: 5, revisions: 3, features: ["60 second video", "Motion graphics", "Voice over", "Color grading", "3 revisions"] },
      premium: { name: "Premium", description: "Full production video", price: 499, deliveryTime: 10, revisions: -1, features: ["Up to 3 minutes", "Custom animations", "Professional VO", "Social media cuts", "Unlimited revisions"] },
    },
    images: [
      "https://picsum.photos/seed/video1/800/600",
      "https://picsum.photos/seed/video2/800/600",
      "https://picsum.photos/seed/video3/800/600",
    ],
    rating: 4.9,
    reviewCount: 2103,
    featured: true,
    bestSeller: true,
    createdAt: "2021-05-20",
    updatedAt: "2024-11-10",
  },
  {
    id: "gig-6",
    title: "I will make an animated explainer video for your product",
    description:
      "2D animated explainer videos that simplify complex ideas and engage your audience. Perfect for SaaS products, startups, and businesses wanting to explain their value proposition clearly.",
    category: "video-animation",
    subcategory: "explainer-videos",
    tags: ["explainer", "animation", "2d", "product", "saas"],
    seller: kai,
    packages: {
      basic: { name: "Basic", description: "30-second 2D animation", price: 129, deliveryTime: 5, revisions: 2, features: ["30 second", "2D animation", "Script included", "2 revisions"] },
      standard: { name: "Standard", description: "60-second animation", price: 299, deliveryTime: 7, revisions: 3, features: ["60 second", "Custom characters", "VO included", "Sound effects", "3 revisions"] },
      premium: { name: "Premium", description: "Full explainer (2 min)", price: 599, deliveryTime: 14, revisions: -1, features: ["2 minute", "Character animations", "Professional VO", "Social cuts", "Unlimited revisions"] },
    },
    images: [
      "https://picsum.photos/seed/explainer1/800/600",
      "https://picsum.photos/seed/explainer2/800/600",
    ],
    rating: 4.8,
    reviewCount: 887,
    featured: false,
    bestSeller: true,
    createdAt: "2021-08-14",
    updatedAt: "2024-10-30",
  },
  // ── Writing & Translation ──────────────────────────────────────────────────
  {
    id: "gig-7",
    title: "I will write SEO-optimized blog posts and articles",
    description:
      "High-quality, well-researched blog content that ranks on Google and engages your readers. I specialize in technology, business, health, and lifestyle niches with proven SEO strategies.",
    category: "writing-translation",
    subcategory: "blog-writing",
    tags: ["blog", "seo", "writing", "content", "articles"],
    seller: maya,
    packages: {
      basic: { name: "Basic", description: "500-word blog post", price: 30, deliveryTime: 2, revisions: 2, features: ["500 words", "SEO optimized", "1 topic", "2 revisions"] },
      standard: { name: "Standard", description: "1000-word article", price: 65, deliveryTime: 3, revisions: 3, features: ["1000 words", "Keyword research", "Meta description", "Internal links"] },
      premium: { name: "Premium", description: "3000-word pillar post", price: 150, deliveryTime: 5, revisions: -1, features: ["3000 words", "Full SEO audit", "FAQ section", "Image suggestions", "Unlimited revisions"] },
    },
    images: [
      "https://picsum.photos/seed/writing1/800/600",
      "https://picsum.photos/seed/writing2/800/600",
    ],
    rating: 4.95,
    reviewCount: 634,
    featured: true,
    bestSeller: false,
    createdAt: "2022-03-01",
    updatedAt: "2024-12-05",
  },
  {
    id: "gig-8",
    title: "I will write compelling website copy that converts",
    description:
      "Conversion-focused website copy that speaks to your customers and drives action. From homepages to landing pages, I craft words that sell.",
    category: "writing-translation",
    subcategory: "copywriting",
    tags: ["copywriting", "website", "sales", "landing page", "conversion"],
    seller: maya,
    packages: {
      basic: { name: "Basic", description: "Single page copy", price: 50, deliveryTime: 3, revisions: 2, features: ["1 page", "SEO included", "2 revisions", "Commercial rights"] },
      standard: { name: "Standard", description: "3-page website copy", price: 120, deliveryTime: 5, revisions: 3, features: ["3 pages", "CTA optimization", "Brand voice guide", "3 revisions"] },
      premium: { name: "Premium", description: "Full website copy", price: 299, deliveryTime: 7, revisions: -1, features: ["Up to 8 pages", "Email sequence", "Meta descriptions", "Unlimited revisions"] },
    },
    images: [
      "https://picsum.photos/seed/copy1/800/600",
      "https://picsum.photos/seed/copy2/800/600",
    ],
    rating: 4.9,
    reviewCount: 321,
    featured: false,
    bestSeller: false,
    createdAt: "2022-06-15",
    updatedAt: "2024-11-18",
  },
  // ── AI Services ────────────────────────────────────────────────────────────
  {
    id: "gig-9",
    title: "I will build a custom AI chatbot for your website or app",
    description:
      "Build an intelligent, context-aware AI chatbot using GPT-4, LangChain, or custom fine-tuned models. Perfect for customer support, lead generation, and internal tools.",
    category: "ai-services",
    subcategory: "ai-chatbots",
    tags: ["chatbot", "ai", "gpt", "langchain", "customer support"],
    seller: marco,
    packages: {
      basic: { name: "Basic", description: "Simple FAQ chatbot", price: 199, deliveryTime: 5, revisions: 2, features: ["GPT-4 powered", "10 FAQ responses", "Website embed", "2 revisions"] },
      standard: { name: "Standard", description: "Context-aware chatbot", price: 499, deliveryTime: 10, revisions: 3, features: ["Custom knowledge base", "Memory/context", "API integration", "Admin dashboard", "3 revisions"] },
      premium: { name: "Premium", description: "Full AI assistant", price: 1299, deliveryTime: 21, revisions: -1, features: ["Custom fine-tuning", "Multi-language", "CRM integration", "Analytics", "Unlimited revisions"] },
    },
    images: [
      "https://picsum.photos/seed/chatbot1/800/600",
      "https://picsum.photos/seed/chatbot2/800/600",
    ],
    rating: 4.7,
    reviewCount: 312,
    featured: true,
    bestSeller: false,
    createdAt: "2023-05-10",
    updatedAt: "2024-12-10",
  },
  {
    id: "gig-10",
    title: "I will train a custom machine learning model for your data",
    description:
      "End-to-end machine learning solutions — from data preprocessing to model deployment. Specializing in classification, regression, NLP, and computer vision tasks.",
    category: "ai-services",
    subcategory: "machine-learning",
    tags: ["machine learning", "ai", "python", "tensorflow", "data science"],
    seller: marco,
    packages: {
      basic: { name: "Basic", description: "Simple ML model", price: 299, deliveryTime: 7, revisions: 2, features: ["Data analysis", "Model selection", "Training & evaluation", "Code delivery"] },
      standard: { name: "Standard", description: "Production ML pipeline", price: 799, deliveryTime: 14, revisions: 3, features: ["Data preprocessing", "Model training", "API endpoint", "Documentation"] },
      premium: { name: "Premium", description: "Enterprise ML system", price: 1999, deliveryTime: 30, revisions: -1, features: ["Full MLOps", "Auto-retraining", "Monitoring dashboard", "Cloud deployment"] },
    },
    images: [
      "https://picsum.photos/seed/ml1/800/600",
      "https://picsum.photos/seed/ml2/800/600",
    ],
    rating: 4.6,
    reviewCount: 178,
    featured: false,
    bestSeller: false,
    createdAt: "2023-07-22",
    updatedAt: "2024-11-05",
  },
  // ── Music & Audio ──────────────────────────────────────────────────────────
  {
    id: "gig-11",
    title: "I will record a professional voice over for your project",
    description:
      "Warm, engaging, and professional voice over recordings for commercials, e-learning, audiobooks, explainer videos, and corporate content. Home studio with broadcast-quality equipment.",
    category: "music-audio",
    subcategory: "voice-over",
    tags: ["voice over", "narration", "commercial", "e-learning", "audio"],
    seller: emma,
    packages: {
      basic: { name: "Basic", description: "Up to 100 words", price: 25, deliveryTime: 1, revisions: 1, features: ["Up to 100 words", "MP3 delivery", "Background noise removed", "1 revision"] },
      standard: { name: "Standard", description: "Up to 500 words", price: 75, deliveryTime: 2, revisions: 3, features: ["Up to 500 words", "MP3 & WAV", "Studio quality", "Music options", "3 revisions"] },
      premium: { name: "Premium", description: "Up to 2000 words", price: 199, deliveryTime: 3, revisions: -1, features: ["Up to 2000 words", "All formats", "Rush delivery", "Background music", "Unlimited revisions"] },
    },
    images: [
      "https://picsum.photos/seed/voiceover1/800/600",
      "https://picsum.photos/seed/voiceover2/800/600",
    ],
    rating: 4.9,
    reviewCount: 1876,
    featured: true,
    bestSeller: true,
    createdAt: "2020-09-01",
    updatedAt: "2024-12-15",
  },
  {
    id: "gig-12",
    title: "I will produce original background music for your video or game",
    description:
      "Original, royalty-free background music composed and produced specifically for your project. Films, YouTube, games, podcasts, and commercial use. Genres: cinematic, electronic, acoustic, corporate.",
    category: "music-audio",
    subcategory: "music-production",
    tags: ["music", "background music", "soundtrack", "royalty free", "original"],
    seller: emma,
    packages: {
      basic: { name: "Basic", description: "30-second track", price: 45, deliveryTime: 3, revisions: 2, features: ["30 seconds", "1 genre", "WAV & MP3", "Commercial license"] },
      standard: { name: "Standard", description: "60-second track", price: 99, deliveryTime: 5, revisions: 3, features: ["60 seconds", "Custom mood", "Stems included", "Unlimited license"] },
      premium: { name: "Premium", description: "Full production (3 min)", price: 249, deliveryTime: 7, revisions: -1, features: ["3 minutes", "Full arrangement", "All stems", "Priority delivery", "Unlimited revisions"] },
    },
    images: [
      "https://picsum.photos/seed/music1/800/600",
      "https://picsum.photos/seed/music2/800/600",
    ],
    rating: 4.8,
    reviewCount: 954,
    featured: false,
    bestSeller: true,
    createdAt: "2021-02-14",
    updatedAt: "2024-10-01",
  },
  // ── Digital Marketing ──────────────────────────────────────────────────────
  {
    id: "gig-13",
    title: "I will do technical SEO audit and optimization for your website",
    description:
      "Comprehensive technical SEO audit covering site speed, crawlability, on-page optimization, backlink analysis, and a full action plan to boost your Google rankings.",
    category: "digital-marketing",
    subcategory: "seo",
    tags: ["seo", "google ranking", "technical seo", "audit", "backlinks"],
    seller: maya,
    packages: {
      basic: { name: "Basic", description: "Basic SEO audit report", price: 49, deliveryTime: 2, revisions: 1, features: ["20-point audit", "Priority fixes list", "PDF report", "1 revision"] },
      standard: { name: "Standard", description: "Full SEO audit + fixes", price: 149, deliveryTime: 5, revisions: 2, features: ["50-point audit", "On-page fixes", "Keyword research", "Competitor analysis"] },
      premium: { name: "Premium", description: "SEO audit + 1 month work", price: 399, deliveryTime: 14, revisions: -1, features: ["Full technical audit", "All fixes implemented", "Monthly call", "Reporting dashboard"] },
    },
    images: [
      "https://picsum.photos/seed/seo1/800/600",
      "https://picsum.photos/seed/seo2/800/600",
    ],
    rating: 4.85,
    reviewCount: 428,
    featured: false,
    bestSeller: false,
    createdAt: "2022-09-10",
    updatedAt: "2024-11-25",
  },
  {
    id: "gig-14",
    title: "I will manage your social media accounts and grow your following",
    description:
      "Complete social media management service. I'll create content, post consistently, engage with your audience, and grow your following organically on Instagram, Twitter/X, LinkedIn, and TikTok.",
    category: "digital-marketing",
    subcategory: "social-media-marketing",
    tags: ["social media", "instagram", "tiktok", "linkedin", "growth"],
    seller: maya,
    packages: {
      basic: { name: "Basic", description: "1 platform, 10 posts/month", price: 99, deliveryTime: 30, revisions: 2, features: ["1 platform", "10 posts", "Caption writing", "Hashtag research"] },
      standard: { name: "Standard", description: "2 platforms, 20 posts/month", price: 249, deliveryTime: 30, revisions: 3, features: ["2 platforms", "20 posts", "Story creation", "Engagement", "Monthly report"] },
      premium: { name: "Premium", description: "3 platforms, unlimited posts", price: 499, deliveryTime: 30, revisions: -1, features: ["3 platforms", "Daily posting", "Reels/TikToks", "Influencer outreach", "Weekly calls"] },
    },
    images: [
      "https://picsum.photos/seed/social1/800/600",
      "https://picsum.photos/seed/social2/800/600",
    ],
    rating: 4.7,
    reviewCount: 267,
    featured: false,
    bestSeller: false,
    createdAt: "2023-01-20",
    updatedAt: "2024-12-08",
  },
  // ── Business ───────────────────────────────────────────────────────────────
  {
    id: "gig-15",
    title: "I will be your professional virtual assistant for any task",
    description:
      "Experienced VA ready to help with email management, scheduling, research, data entry, customer support, and any administrative task. Available 5 days/week with fast turnaround.",
    category: "business",
    subcategory: "virtual-assistant",
    tags: ["virtual assistant", "admin", "data entry", "research", "scheduling"],
    seller: alex,
    packages: {
      basic: { name: "Basic", description: "5 hours of VA work", price: 50, deliveryTime: 7, revisions: 1, features: ["5 hours", "Email management", "Basic research", "Data entry"] },
      standard: { name: "Standard", description: "15 hours of VA work", price: 135, deliveryTime: 14, revisions: 2, features: ["15 hours", "All basic tasks", "Scheduling", "Customer support", "Weekly report"] },
      premium: { name: "Premium", description: "40 hours monthly", price: 299, deliveryTime: 30, revisions: -1, features: ["40 hours/month", "Dedicated VA", "Project management", "Priority response", "Daily reports"] },
    },
    images: [
      "https://picsum.photos/seed/va1/800/600",
      "https://picsum.photos/seed/va2/800/600",
    ],
    rating: 4.6,
    reviewCount: 189,
    featured: false,
    bestSeller: false,
    createdAt: "2023-03-14",
    updatedAt: "2024-10-20",
  },
];

export function getGigById(id: string): Gig | undefined {
  return GIGS.find((g) => g.id === id);
}

export function getGigsByCategory(category: string): Gig[] {
  return GIGS.filter((g) => g.category === category);
}

export function getFeaturedGigs(): Gig[] {
  return GIGS.filter((g) => g.featured);
}

export function getBestSellerGigs(): Gig[] {
  return GIGS.filter((g) => g.bestSeller);
}

export function getGigsBySeller(sellerUid: string): Gig[] {
  return GIGS.filter((g) => g.seller.uid === sellerUid);
}
