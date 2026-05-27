import type { Category } from "../types";

export const CATEGORIES: Category[] = [
  {
    id: "cat-1",
    slug: "graphics-design",
    name: "Graphics & Design",
    icon: "🎨",
    description: "Create stunning visuals, logos, and brand identities",
    color: "#e6f4ff",
    image: "https://picsum.photos/seed/design/400/300",
    subcategories: [
      { id: "sub-1-1", name: "Logo Design", slug: "logo-design" },
      { id: "sub-1-2", name: "Brand Identity", slug: "brand-identity" },
      { id: "sub-1-3", name: "Illustration", slug: "illustration" },
      { id: "sub-1-4", name: "Flyer Design", slug: "flyer-design" },
      { id: "sub-1-5", name: "Social Media Design", slug: "social-media-design" },
      { id: "sub-1-6", name: "Packaging Design", slug: "packaging-design" },
    ],
    megaGroups: [
      {
        title: "Create Your Logo",
        links: [
          { name: "Minimalist Logo Design", slug: "logo-design" },
          { name: "Illustration", slug: "illustration" },
          { name: "Logo Design", slug: "logo-design" },
          { name: "Website Design", slug: "website-design" },
          { name: "Architecture & Interior Design", slug: "architecture-interior" },
          { name: "AI Artists", slug: "ai-artists", isNew: true },
        ],
      },
      {
        title: "Build Your Brand",
        links: [
          { name: "Brand Strategy", slug: "brand-identity", isNew: true },
          { name: "Brand Style Guides", slug: "brand-identity" },
          { name: "Social Media Design", slug: "social-media-design" },
          { name: "Packaging Design", slug: "packaging-design" },
          { name: "Flyer Design", slug: "flyer-design" },
        ],
      },
      {
        title: "Create Marketing Content",
        links: [
          { name: "Social Media Design", slug: "social-media-design" },
          { name: "Flyer Design", slug: "flyer-design" },
          { name: "Presentation Design", slug: "presentation" },
          { name: "Infographic Design", slug: "infographic" },
          { name: "Email Design", slug: "email-design" },
        ],
      },
      {
        title: "For Web & Apps",
        links: [
          { name: "Web & Mobile Design", slug: "website-design" },
          { name: "Landing Page Design", slug: "website-design" },
          { name: "App Design", slug: "app-design" },
          { name: "UX Design", slug: "ux-design" },
          { name: "Wireframing", slug: "wireframing" },
        ],
      },
    ],
  },
  {
    id: "cat-2",
    slug: "programming-tech",
    name: "Programming & Tech",
    icon: "💻",
    description: "Build apps, websites, and technical solutions",
    color: "#f0f4ff",
    image: "https://picsum.photos/seed/coding/400/300",
    subcategories: [
      { id: "sub-2-1", name: "Web Development", slug: "web-development" },
      { id: "sub-2-2", name: "Mobile Development", slug: "mobile-development" },
      { id: "sub-2-3", name: "WordPress", slug: "wordpress" },
      { id: "sub-2-4", name: "AI Development", slug: "ai-development" },
      { id: "sub-2-5", name: "Cybersecurity", slug: "cybersecurity" },
      { id: "sub-2-6", name: "DevOps & Cloud", slug: "devops-cloud" },
    ],
    megaGroups: [
      {
        title: "Build Your Website",
        links: [
          { name: "Web Development", slug: "web-development" },
          { name: "WordPress", slug: "wordpress" },
          { name: "E-Commerce", slug: "ecommerce" },
          { name: "Landing Pages", slug: "landing-pages" },
          { name: "Shopify", slug: "shopify" },
        ],
      },
      {
        title: "Build Your App",
        links: [
          { name: "Mobile App Development", slug: "mobile-development" },
          { name: "iOS Development", slug: "ios" },
          { name: "Android Development", slug: "android" },
          { name: "React Native", slug: "react-native" },
          { name: "Flutter", slug: "flutter" },
        ],
      },
      {
        title: "Explore AI Solutions",
        links: [
          { name: "AI Development", slug: "ai-development", isNew: true },
          { name: "Chatbot Development", slug: "chatbot" },
          { name: "AI Integrations", slug: "ai-integrations", isNew: true },
          { name: "Machine Learning", slug: "machine-learning" },
          { name: "Data Science", slug: "data-science" },
        ],
      },
      {
        title: "DevOps & Infrastructure",
        links: [
          { name: "DevOps & Cloud", slug: "devops-cloud" },
          { name: "Cybersecurity", slug: "cybersecurity" },
          { name: "Database", slug: "database" },
          { name: "Linux & Unix", slug: "linux" },
          { name: "API Development", slug: "api" },
        ],
      },
    ],
  },
  {
    id: "cat-3",
    slug: "digital-marketing",
    name: "Digital Marketing",
    icon: "📈",
    description: "Grow your audience and reach new customers",
    color: "#fff4e6",
    image: "https://picsum.photos/seed/marketing/400/300",
    subcategories: [
      { id: "sub-3-1", name: "Social Media Marketing", slug: "social-media-marketing" },
      { id: "sub-3-2", name: "SEO", slug: "seo" },
      { id: "sub-3-3", name: "Email Marketing", slug: "email-marketing" },
      { id: "sub-3-4", name: "Content Marketing", slug: "content-marketing" },
      { id: "sub-3-5", name: "PPC & Ads", slug: "ppc-ads" },
    ],
    megaGroups: [
      {
        title: "Grow Your Audience",
        links: [
          { name: "Social Media Strategy", slug: "social-media-marketing" },
          { name: "Social Media Management", slug: "social-media-marketing" },
          { name: "TikTok Marketing", slug: "tiktok-marketing", isNew: true },
          { name: "Instagram Marketing", slug: "instagram" },
          { name: "YouTube Marketing", slug: "youtube" },
        ],
      },
      {
        title: "Boost Your Rankings",
        links: [
          { name: "SEO Optimization", slug: "seo" },
          { name: "Technical SEO", slug: "seo" },
          { name: "Local SEO", slug: "seo" },
          { name: "Link Building", slug: "link-building" },
          { name: "Keyword Research", slug: "seo" },
        ],
      },
      {
        title: "Run Paid Campaigns",
        links: [
          { name: "Google Ads", slug: "ppc-ads" },
          { name: "Facebook Ads", slug: "ppc-ads" },
          { name: "PPC Campaigns", slug: "ppc-ads" },
          { name: "Influencer Marketing", slug: "influencer-marketing" },
          { name: "Affiliate Marketing", slug: "affiliate" },
        ],
      },
      {
        title: "Create Content",
        links: [
          { name: "Email Marketing", slug: "email-marketing" },
          { name: "Content Marketing", slug: "content-marketing" },
          { name: "Video Ads & Commercials", slug: "video-animation" },
          { name: "UGC Videos", slug: "ugc", isNew: true },
          { name: "Podcast Marketing", slug: "podcast" },
        ],
      },
    ],
  },
  {
    id: "cat-4",
    slug: "video-animation",
    name: "Video & Animation",
    icon: "🎬",
    description: "Captivating videos and animations for any purpose",
    color: "#f9e6ff",
    image: "https://picsum.photos/seed/video/400/300",
    subcategories: [
      { id: "sub-4-1", name: "Video Editing", slug: "video-editing" },
      { id: "sub-4-2", name: "Explainer Videos", slug: "explainer-videos" },
      { id: "sub-4-3", name: "Animated Logos", slug: "animated-logos" },
      { id: "sub-4-4", name: "3D Animation", slug: "3d-animation" },
      { id: "sub-4-5", name: "Whiteboard Animation", slug: "whiteboard-animation" },
    ],
    megaGroups: [
      {
        title: "Edit Your Videos",
        links: [
          { name: "Video Editing", slug: "video-editing" },
          { name: "Short Video Ads", slug: "video-editing" },
          { name: "YouTube Video Editing", slug: "video-editing" },
          { name: "Color Grading", slug: "color-grading" },
          { name: "Subtitles & Captions", slug: "subtitles" },
        ],
      },
      {
        title: "Animated Content",
        links: [
          { name: "Explainer Videos", slug: "explainer-videos" },
          { name: "2D Animation", slug: "2d-animation" },
          { name: "3D Animation", slug: "3d-animation" },
          { name: "Whiteboard Animation", slug: "whiteboard-animation" },
          { name: "Animated Logos", slug: "animated-logos" },
        ],
      },
      {
        title: "AI Video",
        links: [
          { name: "AI Video Generation", slug: "ai-video", isNew: true },
          { name: "UGC Video", slug: "ugc", isNew: true },
          { name: "AI Avatar Videos", slug: "ai-avatar", isNew: true },
          { name: "AI Video Editing", slug: "ai-video", isNew: true },
        ],
      },
      {
        title: "Promotional Videos",
        links: [
          { name: "Promotional Videos", slug: "video-editing" },
          { name: "Product Videos", slug: "video-editing" },
          { name: "Corporate Videos", slug: "video-editing" },
          { name: "E-Learning Videos", slug: "elearning-video" },
          { name: "Real Estate Videography", slug: "real-estate-video" },
        ],
      },
    ],
  },
  {
    id: "cat-5",
    slug: "writing-translation",
    name: "Writing & Translation",
    icon: "✍️",
    description: "Professional writing services in any language",
    color: "#e6ffe6",
    image: "https://picsum.photos/seed/writing/400/300",
    subcategories: [
      { id: "sub-5-1", name: "Content Writing", slug: "content-writing" },
      { id: "sub-5-2", name: "Copywriting", slug: "copywriting" },
      { id: "sub-5-3", name: "Translation", slug: "translation" },
      { id: "sub-5-4", name: "Proofreading", slug: "proofreading" },
      { id: "sub-5-5", name: "Resume Writing", slug: "resume-writing" },
    ],
    megaGroups: [
      {
        title: "Write Content",
        links: [
          { name: "Blog Posts & Articles", slug: "content-writing" },
          { name: "Website Copy", slug: "copywriting" },
          { name: "Social Media Copy", slug: "copywriting" },
          { name: "Product Descriptions", slug: "copywriting" },
          { name: "Email Copy", slug: "email-copy" },
        ],
      },
      {
        title: "Translate & Localize",
        links: [
          { name: "Translation", slug: "translation" },
          { name: "Localization", slug: "localization" },
          { name: "Proofreading & Editing", slug: "proofreading" },
          { name: "Subtitles & Captions", slug: "subtitles" },
          { name: "Language Tutoring", slug: "tutoring" },
        ],
      },
      {
        title: "Research & Publish",
        links: [
          { name: "Research & Summaries", slug: "research" },
          { name: "Book & eBook Writing", slug: "book-writing" },
          { name: "White Papers", slug: "white-papers" },
          { name: "Case Studies", slug: "case-studies" },
          { name: "Technical Writing", slug: "technical-writing" },
        ],
      },
      {
        title: "Career Help",
        links: [
          { name: "Resume Writing", slug: "resume-writing" },
          { name: "Cover Letters", slug: "cover-letter" },
          { name: "LinkedIn Profile", slug: "linkedin" },
          { name: "Career Consulting", slug: "consulting" },
          { name: "Interview Prep", slug: "interview-prep" },
        ],
      },
    ],
  },
  {
    id: "cat-6",
    slug: "music-audio",
    name: "Music & Audio",
    icon: "🎵",
    description: "Professional audio production and music services",
    color: "#fff0e6",
    image: "https://picsum.photos/seed/music/400/300",
    subcategories: [
      { id: "sub-6-1", name: "Voice Over", slug: "voice-over" },
      { id: "sub-6-2", name: "Music Production", slug: "music-production" },
      { id: "sub-6-3", name: "Podcast Editing", slug: "podcast-editing" },
      { id: "sub-6-4", name: "Mixing & Mastering", slug: "mixing-mastering" },
    ],
    megaGroups: [
      {
        title: "Voice & Audio",
        links: [
          { name: "Voice Over", slug: "voice-over" },
          { name: "Podcast Editing", slug: "podcast-editing" },
          { name: "Audiobook Production", slug: "audiobook" },
          { name: "Voice Acting", slug: "voice-over" },
        ],
      },
      {
        title: "Music Production",
        links: [
          { name: "Music Production", slug: "music-production" },
          { name: "Mixing & Mastering", slug: "mixing-mastering" },
          { name: "Songwriting", slug: "songwriting" },
          { name: "Jingles & Intro Music", slug: "jingles" },
          { name: "Sound Design", slug: "sound-design" },
        ],
      },
    ],
  },
  {
    id: "cat-7",
    slug: "business",
    name: "Business",
    icon: "💼",
    description: "Business plans, financial models, and consulting",
    color: "#e6f7ff",
    image: "https://picsum.photos/seed/business/400/300",
    subcategories: [
      { id: "sub-7-1", name: "Virtual Assistant", slug: "virtual-assistant" },
      { id: "sub-7-2", name: "Business Plans", slug: "business-plans" },
      { id: "sub-7-3", name: "Market Research", slug: "market-research" },
      { id: "sub-7-4", name: "Data Entry", slug: "data-entry" },
    ],
    megaGroups: [
      {
        title: "Admin & Productivity",
        links: [
          { name: "Virtual Assistant", slug: "virtual-assistant" },
          { name: "Data Entry", slug: "data-entry" },
          { name: "Lead Generation", slug: "lead-generation" },
          { name: "Project Management", slug: "project-management" },
        ],
      },
      {
        title: "Strategy & Research",
        links: [
          { name: "Business Plans", slug: "business-plans" },
          { name: "Market Research", slug: "market-research" },
          { name: "Competitive Analysis", slug: "competitive-analysis" },
          { name: "Business Consulting", slug: "consulting" },
        ],
      },
    ],
  },
  {
    id: "cat-8",
    slug: "ai-services",
    name: "AI Services",
    icon: "🤖",
    description: "AI-powered solutions for your business needs",
    color: "#f0e6ff",
    image: "https://picsum.photos/seed/ai/400/300",
    subcategories: [
      { id: "sub-8-1", name: "AI Chatbots", slug: "ai-chatbots" },
      { id: "sub-8-2", name: "AI Art Generation", slug: "ai-art" },
      { id: "sub-8-3", name: "AI Writing", slug: "ai-writing" },
      { id: "sub-8-4", name: "Machine Learning", slug: "machine-learning" },
    ],
    megaGroups: [
      {
        title: "Build With AI",
        links: [
          { name: "AI Chatbots", slug: "ai-chatbots", isNew: true },
          { name: "AI Websites & Software", slug: "ai-development", isNew: true },
          { name: "AI Mobile Apps", slug: "ai-development", isNew: true },
          { name: "AI Agents", slug: "ai-agents", isNew: true },
          { name: "Data Model Training", slug: "machine-learning" },
          { name: "AI Technology Consulting", slug: "consulting", isNew: true },
        ],
      },
      {
        title: "Create With AI",
        links: [
          { name: "AI Video", slug: "ai-video", isNew: true },
          { name: "AI Art Generation", slug: "ai-art", isNew: true },
          { name: "AI Writing", slug: "ai-writing", isNew: true },
          { name: "AI Image Editing", slug: "ai-art", isNew: true },
          { name: "Generative Engine Optimization", slug: "seo", isNew: true },
        ],
      },
    ],
  },
  {
    id: "cat-9",
    slug: "data",
    name: "Data",
    icon: "📊",
    description: "Data analysis, visualization, and insights",
    color: "#ffe6e6",
    image: "https://picsum.photos/seed/data/400/300",
    subcategories: [
      { id: "sub-9-1", name: "Data Analysis", slug: "data-analysis" },
      { id: "sub-9-2", name: "Data Visualization", slug: "data-visualization" },
      { id: "sub-9-3", name: "Web Scraping", slug: "web-scraping" },
    ],
    megaGroups: [
      {
        title: "Analyze & Visualize",
        links: [
          { name: "Data Analysis", slug: "data-analysis" },
          { name: "Data Visualization", slug: "data-visualization" },
          { name: "Business Intelligence", slug: "business-intelligence" },
          { name: "Excel & Spreadsheets", slug: "excel" },
        ],
      },
      {
        title: "Collect Data",
        links: [
          { name: "Web Scraping", slug: "web-scraping" },
          { name: "Data Mining", slug: "data-mining" },
          { name: "Database Design", slug: "database" },
          { name: "ETL Pipelines", slug: "etl" },
        ],
      },
    ],
  },
  {
    id: "cat-10",
    slug: "photography",
    name: "Photography",
    icon: "📸",
    description: "Professional photography for any occasion",
    color: "#e6fff4",
    image: "https://picsum.photos/seed/photo/400/300",
    subcategories: [
      { id: "sub-10-1", name: "Photo Editing", slug: "photo-editing" },
      { id: "sub-10-2", name: "Product Photography", slug: "product-photography" },
      { id: "sub-10-3", name: "Photo Restoration", slug: "photo-restoration" },
    ],
    megaGroups: [
      {
        title: "Edit Your Photos",
        links: [
          { name: "Photo Editing & Retouching", slug: "photo-editing" },
          { name: "Photo Restoration", slug: "photo-restoration" },
          { name: "Background Removal", slug: "photo-editing" },
          { name: "AI Photo Editing", slug: "photo-editing", isNew: true },
        ],
      },
      {
        title: "Shoot & Capture",
        links: [
          { name: "Product Photography", slug: "product-photography" },
          { name: "Portrait Photography", slug: "portrait" },
          { name: "Real Estate Photography", slug: "real-estate" },
          { name: "Event Photography", slug: "events" },
        ],
      },
    ],
  },
  {
    id: "cat-11",
    slug: "finance",
    name: "Finance",
    icon: "💰",
    description: "Accounting, financial consulting, and tax services",
    color: "#fffce6",
    image: "https://picsum.photos/seed/finance/400/300",
    subcategories: [
      { id: "sub-11-1", name: "Accounting", slug: "accounting" },
      { id: "sub-11-2", name: "Financial Planning", slug: "financial-planning" },
      { id: "sub-11-3", name: "Tax Consulting", slug: "tax-consulting" },
    ],
    megaGroups: [
      {
        title: "Manage Your Finances",
        links: [
          { name: "Accounting & Bookkeeping", slug: "accounting" },
          { name: "Tax Consulting", slug: "tax-consulting" },
          { name: "Financial Modeling", slug: "financial-planning" },
          { name: "Financial Planning", slug: "financial-planning" },
        ],
      },
      {
        title: "Grow Your Money",
        links: [
          { name: "Investment Research", slug: "investment" },
          { name: "Crypto Consulting", slug: "crypto" },
          { name: "Pitch Deck", slug: "pitch-deck" },
          { name: "Fundraising Consulting", slug: "fundraising" },
        ],
      },
    ],
  },
  {
    id: "cat-12",
    slug: "consulting",
    name: "Consulting",
    icon: "🎯",
    description: "Expert advice from industry professionals",
    color: "#f0ffe6",
    image: "https://picsum.photos/seed/consulting/400/300",
    subcategories: [
      { id: "sub-12-1", name: "Business Consulting", slug: "business-consulting" },
      { id: "sub-12-2", name: "Marketing Consulting", slug: "marketing-consulting" },
      { id: "sub-12-3", name: "Legal Consulting", slug: "legal-consulting" },
    ],
    megaGroups: [
      {
        title: "Get Expert Advice",
        links: [
          { name: "Business Consulting", slug: "business-consulting" },
          { name: "Marketing Consulting", slug: "marketing-consulting" },
          { name: "Brand Strategy", slug: "brand-identity" },
          { name: "Product Consulting", slug: "product" },
        ],
      },
      {
        title: "Legal & Compliance",
        links: [
          { name: "Legal Consulting", slug: "legal-consulting" },
          { name: "Contract Writing", slug: "contracts" },
          { name: "Privacy & Compliance", slug: "compliance" },
          { name: "Trademark & IP", slug: "trademark" },
        ],
      },
    ],
  },
  {
    id: "cat-13",
    slug: "elearning-education",
    name: "E-Learning",
    icon: "📚",
    description: "Online courses, tutoring, and educational content creation",
    color: "#e6f7ff",
    image: "https://picsum.photos/seed/elearn/400/300",
    subcategories: [
      { id: "sub-13-1", name: "Course Creation", slug: "course-creation" },
      { id: "sub-13-2", name: "Online Tutoring", slug: "online-tutoring" },
      { id: "sub-13-3", name: "Curriculum Design", slug: "curriculum-design" },
      { id: "sub-13-4", name: "Quiz & Assessment", slug: "quiz-assessment" },
    ],
    megaGroups: [
      {
        title: "Create Courses",
        links: [
          { name: "Online Course Creation", slug: "course-creation" },
          { name: "Video Lectures", slug: "elearning-video" },
          { name: "Curriculum Design", slug: "curriculum-design" },
          { name: "LMS Setup", slug: "lms" },
        ],
      },
      {
        title: "Teach & Tutor",
        links: [
          { name: "Online Tutoring", slug: "online-tutoring" },
          { name: "Language Lessons", slug: "tutoring" },
          { name: "Coding Bootcamps", slug: "web-development" },
          { name: "Math & Science Tutoring", slug: "online-tutoring" },
        ],
      },
    ],
  },
  {
    id: "cat-14",
    slug: "gaming",
    name: "Gaming",
    icon: "🎮",
    description: "Game development, design, coaching, and gaming content",
    color: "#f0e6ff",
    image: "https://picsum.photos/seed/gaming/400/300",
    subcategories: [
      { id: "sub-14-1", name: "Game Development", slug: "game-development" },
      { id: "sub-14-2", name: "Game Design", slug: "game-design" },
      { id: "sub-14-3", name: "Game Coaching", slug: "game-coaching" },
      { id: "sub-14-4", name: "Gaming Assets", slug: "gaming-assets" },
    ],
    megaGroups: [
      {
        title: "Build Games",
        links: [
          { name: "Game Development", slug: "game-development" },
          { name: "Unity Development", slug: "game-development" },
          { name: "Unreal Engine", slug: "game-development" },
          { name: "Mobile Game Dev", slug: "mobile-development" },
          { name: "Game Design", slug: "game-design" },
        ],
      },
      {
        title: "Gaming Content",
        links: [
          { name: "Gaming Assets & NFTs", slug: "gaming-assets", isNew: true },
          { name: "Game Coaching", slug: "game-coaching" },
          { name: "Twitch & YouTube Gaming", slug: "video-editing" },
          { name: "3D Game Characters", slug: "3d-animation" },
        ],
      },
    ],
  },
  {
    id: "cat-15",
    slug: "legal",
    name: "Legal",
    icon: "⚖️",
    description: "Legal documents, contracts, and compliance services",
    color: "#fff4e6",
    image: "https://picsum.photos/seed/legal/400/300",
    subcategories: [
      { id: "sub-15-1", name: "Contract Writing", slug: "contracts" },
      { id: "sub-15-2", name: "Legal Research", slug: "legal-research" },
      { id: "sub-15-3", name: "Trademark & IP", slug: "trademark" },
      { id: "sub-15-4", name: "Privacy Policy", slug: "compliance" },
    ],
    megaGroups: [
      {
        title: "Legal Documents",
        links: [
          { name: "Contract Writing", slug: "contracts" },
          { name: "Terms & Conditions", slug: "compliance" },
          { name: "Privacy Policy", slug: "compliance" },
          { name: "NDA Writing", slug: "contracts" },
        ],
      },
      {
        title: "IP & Compliance",
        links: [
          { name: "Trademark Registration", slug: "trademark" },
          { name: "Copyright Services", slug: "trademark" },
          { name: "Legal Research", slug: "legal-research" },
          { name: "GDPR Compliance", slug: "compliance" },
        ],
      },
    ],
  },
  {
    id: "cat-16",
    slug: "health-wellness",
    name: "Health & Wellness",
    icon: "🌿",
    description: "Fitness plans, nutrition advice, and wellness coaching",
    color: "#e6ffe6",
    image: "https://picsum.photos/seed/health/400/300",
    subcategories: [
      { id: "sub-16-1", name: "Fitness Coaching", slug: "fitness-coaching" },
      { id: "sub-16-2", name: "Nutrition Plans", slug: "nutrition" },
      { id: "sub-16-3", name: "Mental Wellness", slug: "mental-wellness" },
      { id: "sub-16-4", name: "Yoga & Meditation", slug: "yoga" },
    ],
    megaGroups: [
      {
        title: "Fitness & Nutrition",
        links: [
          { name: "Personal Fitness Plans", slug: "fitness-coaching" },
          { name: "Diet & Nutrition Plans", slug: "nutrition" },
          { name: "Weight Loss Programs", slug: "fitness-coaching" },
          { name: "Sports Coaching", slug: "fitness-coaching" },
        ],
      },
      {
        title: "Mind & Wellness",
        links: [
          { name: "Mental Health Coaching", slug: "mental-wellness" },
          { name: "Yoga & Meditation", slug: "yoga" },
          { name: "Life Coaching", slug: "consulting" },
          { name: "Stress Management", slug: "mental-wellness" },
        ],
      },
    ],
  },
];

export const POPULAR_TABS = [
  "AI Services",
  "Video & Animation",
  "Logo Design",
  "Social Media",
  "SEO",
  "Illustration",
  "Translation",
  "Voice Over",
  "Web Development",
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
