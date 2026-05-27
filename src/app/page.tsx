"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { HeroSection } from "@/components/home/HeroSection";
import { GigCategoryGrid } from "@/components/home/GigCategoryGrid";
import { PopularServices } from "@/components/home/PopularServices";
import { EverythingSection } from "@/components/home/EverythingSection";
import { GuidesSection } from "@/components/home/GuidesSection";
import { DoableCTA } from "@/components/home/DoableCTA";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "SELLER") {
        router.push("/seller/dashboard");
      } else {
        router.push("/buyer/dashboard");
      }
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-teal-600" size={36} />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <HeroSection />
      <GigCategoryGrid />
      <PopularServices />
      <EverythingSection />
      <GuidesSection />
      <DoableCTA />
    </div>
  );
}