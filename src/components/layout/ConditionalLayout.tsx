"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ChatPopup } from "../chat/ChatPopup";
import { ReactNode } from "react";

export function ConditionalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  // Hide Navbar and Footer on admin dashboards
  const isDashboard = pathname?.startsWith("/admin");

  return (
    <>
      {!isDashboard && <Navbar />}
      <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden">{children}</main>
      {!isDashboard && <Footer />}
      {!isDashboard && <ChatPopup />}
    </>
  );
}
