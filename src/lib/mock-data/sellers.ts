import type { SellerProfile } from "../types";

export const SELLERS: SellerProfile[] = [
  {
    uid: "seller-1",
    username: "designpro_alex",
    displayName: "Alex Rivera",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=alex",
    tagline: "Expert Logo & Brand Identity Designer | 8+ Years Experience",
    description:
      "I'm a passionate graphic designer specializing in logo design and brand identity. With 8+ years of experience, I've worked with 500+ clients worldwide to create stunning, memorable brands. My designs are not just visually appealing — they tell your story.",
    location: "United States",
    memberSince: "2016-03-12",
    responseTime: "1 hour",
    languages: [
      { name: "English", level: "native" },
      { name: "Spanish", level: "conversational" },
    ],
    skills: ["Logo Design", "Brand Identity", "Illustrator", "Photoshop", "Figma"],
    education: [{ institution: "Art Center College of Design", degree: "BFA Graphic Design", year: "2014" }],
    rating: 4.9,
    reviewCount: 1482,
    completedOrders: 2341,
    level: "top",
    isOnline: true,
  },
  {
    uid: "seller-2",
    username: "webdev_sara",
    displayName: "Sara Johnson",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=sara",
    tagline: "Full-Stack Developer | React, Next.js, Node.js Expert",
    description:
      "Senior full-stack developer with 6 years of professional experience. I build scalable, performant web applications using modern tech stacks. Specializing in React, Next.js, TypeScript and Node.js backends.",
    location: "United Kingdom",
    memberSince: "2018-06-20",
    responseTime: "2 hours",
    languages: [
      { name: "English", level: "native" },
      { name: "French", level: "conversational" },
    ],
    skills: ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "AWS"],
    education: [{ institution: "University of Edinburgh", degree: "BSc Computer Science", year: "2017" }],
    rating: 4.8,
    reviewCount: 876,
    completedOrders: 1102,
    level: "level2",
    isOnline: false,
  },
  {
    uid: "seller-3",
    username: "videomaster_kai",
    displayName: "Kai Tanaka",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=kai",
    tagline: "Professional Video Editor & Motion Graphics Artist",
    description:
      "Cinematic video editor and motion graphics specialist. I create jaw-dropping animations, promotional videos, and brand content that engages your audience and drives results.",
    location: "Japan",
    memberSince: "2019-01-15",
    responseTime: "3 hours",
    languages: [
      { name: "English", level: "fluent" },
      { name: "Japanese", level: "native" },
    ],
    skills: ["After Effects", "Premiere Pro", "DaVinci Resolve", "Cinema 4D", "Motion Graphics"],
    education: [{ institution: "Tokyo Institute of Digital Arts", degree: "Digital Media", year: "2018" }],
    rating: 4.9,
    reviewCount: 2103,
    completedOrders: 3892,
    level: "top",
    isOnline: true,
  },
  {
    uid: "seller-4",
    username: "copy_queen_maya",
    displayName: "Maya Patel",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=maya",
    tagline: "SEO Copywriter & Content Strategist | 5-Star Rated",
    description:
      "Award-winning copywriter and content strategist helping brands communicate with clarity and convert readers into customers. Specializing in SEO content, email campaigns, and brand voice.",
    location: "India",
    memberSince: "2020-04-10",
    responseTime: "1 hour",
    languages: [
      { name: "English", level: "native" },
      { name: "Hindi", level: "native" },
    ],
    skills: ["Copywriting", "SEO Writing", "Blog Writing", "Email Marketing", "Content Strategy"],
    education: [{ institution: "Delhi University", degree: "MA English Literature", year: "2019" }],
    rating: 4.95,
    reviewCount: 634,
    completedOrders: 798,
    level: "level2",
    isOnline: true,
  },
  {
    uid: "seller-5",
    username: "aidev_marco",
    displayName: "Marco Bianchi",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=marco",
    tagline: "AI & Machine Learning Engineer | Python, TensorFlow, LLMs",
    description:
      "ML engineer and AI solutions architect with expertise in NLP, computer vision, and LLM fine-tuning. I build production-ready AI integrations and custom ML models.",
    location: "Italy",
    memberSince: "2021-09-01",
    responseTime: "4 hours",
    languages: [
      { name: "English", level: "fluent" },
      { name: "Italian", level: "native" },
    ],
    skills: ["Python", "TensorFlow", "PyTorch", "OpenAI API", "LangChain", "FastAPI"],
    education: [{ institution: "Politecnico di Milano", degree: "MSc Computer Engineering", year: "2020" }],
    rating: 4.7,
    reviewCount: 312,
    completedOrders: 415,
    level: "level1",
    isOnline: false,
  },
  {
    uid: "seller-6",
    username: "voice_artist_emma",
    displayName: "Emma Clarke",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=emma",
    tagline: "Professional Voice Over Artist | Commercial & Narration",
    description:
      "Warm, engaging, and versatile voice actress with a home recording studio setup. Perfect for commercials, e-learning, audiobooks, and corporate narrations.",
    location: "Canada",
    memberSince: "2017-11-22",
    responseTime: "2 hours",
    languages: [
      { name: "English", level: "native" },
      { name: "French", level: "fluent" },
    ],
    skills: ["Voice Over", "Audio Recording", "Narration", "Commercial VO", "Audiobook"],
    education: [{ institution: "Ryerson University", degree: "Theatre Arts", year: "2015" }],
    rating: 4.9,
    reviewCount: 1876,
    completedOrders: 2234,
    level: "top",
    isOnline: true,
  },
];

export function getSellerByUsername(username: string): SellerProfile | undefined {
  return SELLERS.find((s) => s.username === username);
}

export function getSellerById(uid: string): SellerProfile | undefined {
  return SELLERS.find((s) => s.uid === uid);
}
