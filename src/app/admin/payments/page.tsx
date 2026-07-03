"use client";

import { useState } from "react";
import { PayoutsTable } from "@/components/admin/payments/PayoutsTable";
import { RefundsManager } from "@/components/admin/payments/RefundsManager";
import { TransactionHistory } from "@/components/admin/payments/TransactionHistory";

export default function AdminPayments() {
  const [activeTab, setActiveTab] = useState<"payouts" | "refunds" | "history">("payouts");

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Payments & Payouts</h1>
      
      {/* Tabs */}
      <div className="flex space-x-1 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab("payouts")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "payouts"
              ? "border-teal-600 text-teal-600"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          Seller Payouts
        </button>
        <button
          onClick={() => setActiveTab("refunds")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "refunds"
              ? "border-teal-600 text-teal-600"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          Refunds
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "history"
              ? "border-teal-600 text-teal-600"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          Transaction History
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "payouts" && <PayoutsTable />}
        {activeTab === "refunds" && <RefundsManager />}
        {activeTab === "history" && <TransactionHistory />}
      </div>
    </div>
  );
}
