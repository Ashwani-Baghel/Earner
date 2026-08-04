"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;
    
    // Non-sellers should not be here (the dashboard page handles redirecting to buyer/admin)
    if (!user || user.role !== "SELLER") {
      setChecking(false);
      return;
    }

    // Don't guard the onboarding page itself
    if (pathname === "/seller/onboarding") {
      setChecking(false);
      return;
    }

    // Use session storage to cache the check and prevent flashing / extra API calls
    if (sessionStorage.getItem("seller_onboarded") === "true") {
      setChecking(false);
      return;
    }

    const verifyOnboarding = async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          const sp = data.sellerProfile;
          
          const hasBio = sp?.bio && sp.bio.length >= 50;
          const hasSkills = sp?.skills && sp.skills.length > 0;
          const hasTagline = !!sp?.tagline;

          if (!hasBio || !hasSkills || !hasTagline) {
            router.push("/seller/onboarding");
            return; // keep checking true so it doesn't flash the page while routing
          } else {
            sessionStorage.setItem("seller_onboarded", "true");
          }
        }
      } catch (err) {
        console.error("Failed to check onboarding status", err);
      }
      setChecking(false);
    };

    verifyOnboarding();
  }, [user, loading, pathname, router]);

  if (loading || checking) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-teal-600" size={32} />
      </div>
    );
  }

  return <>{children}</>;
}
