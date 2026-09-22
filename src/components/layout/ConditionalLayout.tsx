"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ChatPopup } from "../chat/ChatPopup";
import { SupportChatWidget } from "../chat/SupportChatWidget";
import { AnnouncementBar } from "./AnnouncementBar";
import { ReactNode } from "react";

export function ConditionalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  // Hide Navbar and Footer on admin dashboards
  const isDashboard = pathname?.startsWith("/admin") || pathname?.startsWith("/super-admin");

  return (
    <>
      {!isDashboard && <AnnouncementBar />}
      {!isDashboard && <Navbar />}
      <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden">{children}</main>
      {!isDashboard && <Footer />}
      {!isDashboard && <ChatPopup />}
      {!isDashboard && <SupportChatWidget />}
    </>
  );
}
