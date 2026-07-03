"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Lock, Shield, CreditCard, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/firebase";

interface CheckoutPageProps {
  params: Promise<{ gigId: string }>;
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tier = searchParams.get("tier") || "basic";
  const { gigId } = use(params);

  const { items } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Find the specific item in the cart
  const item = items.find(i => i.gig.id === gigId && i.tier === tier);

  useEffect(() => {
    if (!item && items.length > 0) {
      router.replace("/cart");
    }
  }, [item, items.length, router]);

  if (!item) {
    return (
      <div className="container-earner py-24 flex flex-col items-center text-center">
        <h2 className="text-2xl font-bold mb-4">Item not found in cart</h2>
        <Link href="/cart">
          <Button>Back to Cart</Button>
        </Link>
      </div>
    );
  }

  const handleMockPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = await auth!.currentUser?.getIdToken();
      if (!token) throw new Error("Please log in to make a payment.");

      const response = await fetch("/api/checkout/mock-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          gigId: item.gig.id,
          tier: item.tier,
          price: item.pkg.price,
          sellerId: item.gig.seller?.uid || "cl_anon_seller_001" // fallback for mock
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Payment failed");
      }

      router.push(`/checkout/success?orderId=${data.orderId}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f5f5f5] min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white border-b border-[#e4e5e7] py-6">
        <div className="container-earner flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#404145] flex items-center gap-2">
            <Lock size={24} className="text-[#1dbf73]" /> Secure Checkout
          </h1>
        </div>
      </div>

      <div className="container-earner mt-10">
        <Link href="/cart" className="inline-flex items-center gap-1 text-[#74767e] hover:text-[#404145] font-semibold mb-6 transition-colors">
          <ChevronLeft size={18} /> Back to cart
        </Link>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Left Column: Payment Form */}
          <div className="flex-1">
            <div className="bg-white rounded-xl border border-[#e4e5e7] p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-[#404145]">Payment Details</h2>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded">VISA</span>
                  <span className="px-2 py-1 bg-orange-50 text-orange-700 text-xs font-bold rounded">MC</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm font-semibold">
                  {error}
                </div>
              )}

              <form onSubmit={handleMockPayment} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-[#404145] mb-2">Card Number (Mock)</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="4242 4242 4242 4242"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-[#e4e5e7] focus:border-[#404145] focus:outline-none transition-colors"
                    />
                    <CreditCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c5c6c9]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-[#404145] mb-2">Expiration Date</label>
                    <input 
                      type="text" 
                      placeholder="MM/YY"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-[#e4e5e7] focus:border-[#404145] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#404145] mb-2">Security Code</label>
                    <input 
                      type="text" 
                      placeholder="CVC"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-[#e4e5e7] focus:border-[#404145] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#404145] mb-2">Name on Card</label>
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-[#e4e5e7] focus:border-[#404145] focus:outline-none transition-colors"
                  />
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full text-lg mt-4 h-14"
                  disabled={loading}
                >
                  {loading ? "Processing..." : `Confirm & Pay ${formatCurrency(item.pkg.price)}`}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-[#e4e5e7] flex items-center justify-center gap-2 text-sm text-[#74767e]">
                <Shield size={16} className="text-[#1dbf73]" />
                SSL Secure Payment (Mock Mode)
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-white rounded-xl border border-[#e4e5e7] overflow-hidden sticky top-24">
              <div className="p-6">
                <h2 className="text-xl font-bold text-[#404145] mb-6">Order Summary</h2>
                
                <div className="flex gap-4 mb-6">
                  <div className="w-24 h-16 bg-slate-100 rounded-md overflow-hidden shrink-0">
                    <img 
                      src={item.gig.images?.[0] || "https://picsum.photos/seed/gig/400/300"} 
                      alt={item.gig.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-[#404145] line-clamp-2 leading-snug">{item.gig.title}</h3>
                    <p className="text-xs text-[#74767e] mt-1 capitalize">{item.tier} Package</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-[#74767e]">
                    <span>Item Price</span>
                    <span>{formatCurrency(item.pkg.price)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-[#74767e]">
                    <span>Service Fee</span>
                    <span>{formatCurrency(0)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#fafafa] p-6 border-t border-[#e4e5e7]">
                <div className="flex justify-between items-center font-bold text-lg text-[#404145]">
                  <span>Total</span>
                  <span>{formatCurrency(item.pkg.price)}</span>
                </div>
                <div className="text-xs text-[#74767e] text-right mt-1">Delivery Time: {item.pkg.deliveryTime} Days</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
