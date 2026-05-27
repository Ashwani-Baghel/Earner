// ─── User & Auth ──────────────────────────────────────────────────────────────

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isSeller: boolean;
  createdAt: string;
}

export interface SellerProfile {
  uid: string;
  username: string;
  displayName: string;
  avatar: string;
  tagline: string;
  description: string;
  location: string;
  memberSince: string;
  responseTime: string;
  languages: Language[];
  skills: string[];
  education: Education[];
  rating: number;
  reviewCount: number;
  completedOrders: number;
  level: SellerLevel;
  isOnline: boolean;
}

export type SellerLevel = "new" | "level1" | "level2" | "top" | "pro";

export interface Language {
  name: string;
  level: "basic" | "conversational" | "fluent" | "native";
}

export interface Education {
  institution: string;
  degree: string;
  year: string;
}

// ─── Gig ──────────────────────────────────────────────────────────────────────

export interface Gig {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  tags: string[];
  seller: SellerProfile;
  packages: GigPackages;
  images: string[];
  videoUrl?: string;
  rating: number;
  reviewCount: number;
  featured?: boolean;
  bestSeller?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GigPackages {
  basic: GigPackage;
  standard: GigPackage;
  premium: GigPackage;
}

export interface GigPackage {
  name: string;
  description: string;
  price: number;
  deliveryTime: number;
  revisions: number;
  features: string[];
}

export type PackageTier = "basic" | "standard" | "premium";

// ─── Review ───────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  gigId: string;
  reviewer: {
    uid: string;
    name: string;
    avatar: string;
    country: string;
  };
  rating: number;
  comment: string;
  sellerResponse?: string;
  createdAt: string;
  helpful: number;
}

// ─── Category ─────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string;
  description: string;
  subcategories: Subcategory[];
  color: string;
  image: string;
  megaGroups?: MegaGroup[];
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
}

export interface MegaGroup {
  title: string;
  links: MegaLink[];
}

export interface MegaLink {
  name: string;
  slug: string;
  isNew?: boolean;
}

// ─── Order ────────────────────────────────────────────────────────────────────

export interface Order {
  id: string;
  gigId: string;
  gigTitle: string;
  gigImage: string;
  seller: { username: string; displayName: string; avatar: string };
  buyer: { username: string; displayName: string; avatar: string };
  package: GigPackage;
  packageTier: PackageTier;
  status: OrderStatus;
  price: number;
  dueDate: string;
  createdAt: string;
  requirements?: string;
  deliverables?: string[];
}

export type OrderStatus =
  | "pending"
  | "active"
  | "delivered"
  | "revision"
  | "completed"
  | "cancelled"
  | "late";

// ─── Message ──────────────────────────────────────────────────────────────────

export interface Conversation {
  id: string;
  with: {
    uid: string;
    username: string;
    displayName: string;
    avatar: string;
    isOnline: boolean;
  };
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  gigTitle?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  attachments?: Attachment[];
  createdAt: string;
  read: boolean;
}

export interface Attachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

// ─── Search & Filters ─────────────────────────────────────────────────────────

export interface SearchFilters {
  query: string;
  category: string;
  subcategory: string;
  minPrice: number | null;
  maxPrice: number | null;
  deliveryTime: number | null;
  sellerLevel: SellerLevel | null;
  rating: number | null;
  language: string | null;
  onlineSellers: boolean;
}

export type SortOption =
  | "relevance"
  | "best_selling"
  | "newest"
  | "level"
  | "price_asc"
  | "price_desc";

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export interface DashboardStats {
  totalEarnings: number;
  activeOrders: number;
  completedOrders: number;
  impressions: number;
  clicks: number;
  conversions: number;
  responseRate: number;
  avgRating: number;
}
