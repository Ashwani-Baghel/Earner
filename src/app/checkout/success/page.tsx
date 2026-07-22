"use client";

import { useEffect, Suspense, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, FileText, LayoutDashboard } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { clearCart } = useCart();
  const router = useRouter();

  const hasCleared = useRef(false);

  useEffect(() => {
    if (!hasCleared.current) {
      clearCart();
      hasCleared.current = true;
    }
  }, [clearCart]);

  if (!orderId) {
    return (
      <div className="container-earner py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">No order specified.</h1>
        <Link href="/">
          <Button>Return Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#f5f5f5] p-4">
      <div className="bg-white max-w-md w-full rounded-2xl border border-[#e4e5e7] p-8 text-center shadow-sm">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-[#1dbf73]" />
        </div>
        
        <h1 className="text-3xl font-black text-[#404145] mb-2">Payment Successful!</h1>
        <p className="text-[#74767e] mb-8 leading-relaxed">
          Your order has been placed successfully. The seller has been notified and will start working on your requirements.
        </p>

        <div className="bg-[#fafafa] p-4 rounded-xl border border-[#e4e5e7] mb-8 text-left">
          <p className="text-sm font-semibold text-[#74767e] mb-1">Order ID</p>
          <p className="font-mono text-sm text-[#404145] font-bold">{orderId}</p>
        </div>

        <div className="space-y-3">
          <Link href={`/orders/${orderId}`} className="block">
            <Button size="lg" className="w-full flex items-center justify-center gap-2">
              <FileText size={18} /> View Order Details
            </Button>
          </Link>
          <Link href="/buyer/dashboard" className="block">
            <Button size="lg" variant="outline" className="w-full flex items-center justify-center gap-2">
              <LayoutDashboard size={18} /> Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
