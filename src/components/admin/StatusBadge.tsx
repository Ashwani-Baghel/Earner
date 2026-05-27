// src/components/admin/StatusBadge.tsx
import React from "react";

type Variant =
  | "PENDING" | "ACTIVE" | "REJECTED" | "BANNED" | "DELETED" | "DRAFT" | "PAUSED"
  | "OPEN"    | "RESOLVED" | "DISMISSED"
  | "COMPLETED" | "CANCELLED" | "REFUNDED" | "DELIVERED" | "REVISION"
  | "BUYER"   | "SELLER"   | "ADMIN"   | "SUPER_ADMIN";

const MAP: Record<Variant, { label: string; classes: string }> = {
  PENDING:     { label: "Pending",    classes: "bg-amber-50  text-amber-700  border-amber-200"  },
  ACTIVE:      { label: "Active",     classes: "bg-teal-50   text-teal-700   border-teal-200"   },
  REJECTED:    { label: "Rejected",   classes: "bg-red-50    text-red-700    border-red-200"    },
  BANNED:      { label: "Banned",     classes: "bg-red-100   text-red-800    border-red-300"    },
  DELETED:     { label: "Deleted",    classes: "bg-slate-100 text-slate-500  border-slate-200"  },
  DRAFT:       { label: "Draft",      classes: "bg-slate-50  text-slate-500  border-slate-200"  },
  PAUSED:      { label: "Paused",     classes: "bg-orange-50 text-orange-700 border-orange-200" },
  OPEN:        { label: "Open",       classes: "bg-blue-50   text-blue-700   border-blue-200"   },
  RESOLVED:    { label: "Resolved",   classes: "bg-teal-50   text-teal-700   border-teal-200"   },
  DISMISSED:   { label: "Dismissed",  classes: "bg-slate-50  text-slate-500  border-slate-200"  },
  COMPLETED:   { label: "Completed",  classes: "bg-green-50  text-green-700  border-green-200"  },
  CANCELLED:   { label: "Cancelled",  classes: "bg-slate-100 text-slate-500  border-slate-200"  },
  REFUNDED:    { label: "Refunded",   classes: "bg-purple-50 text-purple-700 border-purple-200" },
  DELIVERED:   { label: "Delivered",  classes: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  REVISION:    { label: "Revision",   classes: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  BUYER:       { label: "Buyer",      classes: "bg-slate-100 text-slate-600  border-slate-200"  },
  SELLER:      { label: "Seller",     classes: "bg-teal-50   text-teal-700   border-teal-200"   },
  ADMIN:       { label: "Admin",      classes: "bg-purple-50 text-purple-700 border-purple-200" },
  SUPER_ADMIN: { label: "Super Admin",classes: "bg-red-50    text-red-700    border-red-200"    },
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = MAP[status as Variant] ?? { label: status, classes: "bg-slate-100 text-slate-600 border-slate-200" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}
