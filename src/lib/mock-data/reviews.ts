import type { Review } from "../types";

export const REVIEWS: Review[] = [
  {
    id: "rev-1",
    gigId: "gig-1",
    reviewer: { uid: "u1", name: "James Wilson", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=james", country: "United States" },
    rating: 5,
    comment: "Alex is an absolute genius! The logo he designed perfectly captures our brand essence. He was attentive to feedback and delivered ahead of schedule. Will definitely hire again for future projects!",
    createdAt: "2024-11-15",
    helpful: 24,
  },
  {
    id: "rev-2",
    gigId: "gig-1",
    reviewer: { uid: "u2", name: "Sophie Martin", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=sophie", country: "France" },
    rating: 5,
    comment: "Outstanding quality and professionalism. Got exactly what I envisioned and more. The design process was smooth and efficient.",
    createdAt: "2024-10-28",
    helpful: 18,
  },
  {
    id: "rev-3",
    gigId: "gig-1",
    reviewer: { uid: "u3", name: "Ravi Kumar", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=ravi", country: "India" },
    rating: 4,
    comment: "Great logo design, very professional. Took one extra day but the result was worth it. Highly recommend!",
    sellerResponse: "Thank you Ravi! Apologies for the slight delay. I'm glad you love the final result!",
    createdAt: "2024-10-10",
    helpful: 7,
  },
  {
    id: "rev-4",
    gigId: "gig-3",
    reviewer: { uid: "u4", name: "Chen Wei", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=chen", country: "China" },
    rating: 5,
    comment: "Sarah built our entire e-commerce platform from scratch. Clean code, great performance, and she implemented everything exactly as we discussed. Exceptional developer!",
    createdAt: "2024-12-01",
    helpful: 31,
  },
  {
    id: "rev-5",
    gigId: "gig-3",
    reviewer: { uid: "u5", name: "Laura Becker", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=laura", country: "Germany" },
    rating: 5,
    comment: "Top-notch developer. Sara delivered our Next.js app on time, within budget, with clean TypeScript code. The performance scores are incredible.",
    createdAt: "2024-11-22",
    helpful: 15,
  },
  {
    id: "rev-6",
    gigId: "gig-5",
    reviewer: { uid: "u6", name: "Michael Torres", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=michael", country: "Mexico" },
    rating: 5,
    comment: "Kai produced an incredible promotional video for our app launch. The color grading and motion graphics were cinematic quality. Our conversion rate jumped 40% after using this video!",
    createdAt: "2024-11-30",
    helpful: 42,
  },
  {
    id: "rev-7",
    gigId: "gig-5",
    reviewer: { uid: "u7", name: "Amelia Hayes", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=amelia", country: "Australia" },
    rating: 5,
    comment: "Best video editor I've worked with on Fiverr. Exceeded expectations in every way. Fast delivery and amazing attention to detail.",
    createdAt: "2024-10-15",
    helpful: 22,
  },
  {
    id: "rev-8",
    gigId: "gig-7",
    reviewer: { uid: "u8", name: "Nathan Price", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=nathan", country: "United States" },
    rating: 5,
    comment: "Maya wrote 10 blog posts for us and every single one ranked on the first page within 3 months. Her SEO knowledge is unmatched. Worth every penny!",
    createdAt: "2024-12-05",
    helpful: 38,
  },
  {
    id: "rev-9",
    gigId: "gig-11",
    reviewer: { uid: "u9", name: "Fatima Al-Rashid", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=fatima", country: "UAE" },
    rating: 5,
    comment: "Emma's voice is absolutely beautiful and professional. Our e-learning course sounds a thousand times better. Fast delivery, perfect pronunciation, studio quality audio.",
    createdAt: "2024-12-10",
    helpful: 19,
  },
  {
    id: "rev-10",
    gigId: "gig-9",
    reviewer: { uid: "u10", name: "Peter Schmidt", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=peter", country: "Germany" },
    rating: 5,
    comment: "Marco built us a genuinely intelligent chatbot that handles 80% of our customer support queries automatically. ROI was immediate. Excellent work!",
    createdAt: "2024-11-18",
    helpful: 27,
  },
];

export function getReviewsByGigId(gigId: string): Review[] {
  return REVIEWS.filter((r) => r.gigId === gigId);
}

export function getAverageRating(gigId: string): number {
  const reviews = getReviewsByGigId(gigId);
  if (reviews.length === 0) return 0;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}
