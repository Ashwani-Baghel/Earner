import { Metadata } from "next";
import { DisputeManager } from "./DisputeManager";

export const metadata: Metadata = {
  title: "All Disputes - Super Admin",
  description: "Manage and resolve all platform disputes.",
};

export default function AllDisputesPage() {
  return <DisputeManager />;
}
