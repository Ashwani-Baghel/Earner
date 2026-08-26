import { Metadata } from "next";
import { TicketManager } from "./TicketManager";

export const metadata: Metadata = {
  title: "Support Tickets - Super Admin",
  description: "Manage customer support inquiries and tickets.",
};

export default function SupportTicketsPage() {
  return <TicketManager />;
}
