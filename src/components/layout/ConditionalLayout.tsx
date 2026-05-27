"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ReactNode } from "react";

export function ConditionalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  // Hide Navbar and Footer on admin dashboards
  const isDashboard = pathname?.startsWith("/admin");

  return (
    <>
      {!isDashboard && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isDashboard && <Footer />}
    </>
  );
}
