"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Lock, Shield, CreditCard, ChevronLeft, QrCode, CheckCircle2, Loader2, IndianRupee } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { QRCodeSVG } from "qrcode.react";

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
  
  // Payment State
  const [paymentData, setPaymentData] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card">("upi");

  const item = items.find(i => i.gig.id === gigId && i.tier === tier);

  useEffect(() => {
    if (!item && items.length > 0) {
      router.replace("/cart");
    }
  }, [item, items.length, router]);

  if (!item) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Item not found</h2>
          <p className="text-slate-500 mb-8">This gig is no longer in your cart.</p>
          <Link href="/cart">
            <Button className="w-full rounded-xl h-12 text-base font-semibold">Back to Cart</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleInitiatePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await auth!.currentUser?.getIdToken();
      if (!token) throw new Error("Please log in to make a payment.");

      const response = await fetch("/api/checkout/initiate-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          gigId: item.gig.id,
          tier: item.tier,
          price: item.pkg.price,
          sellerId: item.gig.seller?.uid || "cl_anon_seller_001"
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || "Failed to initiate payment");
      }

      // data.data should contain the API response fields like intentUrl, qrPageUrl, etc.
      setPaymentData(data.data);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check if we should simulate a successful payment polling (since we don't have a real websocket)
  // In a real app, the webhook updates the DB, and the frontend polls the DB or uses Firebase realtime listeners
  const simulateSuccess = () => {
    if (paymentData?.orderId) {
      router.push(`/checkout/success?orderId=${paymentData.orderId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 pb-20 font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40 transition-all duration-300">
        <div className="container-earner flex justify-between items-center h-20">
          <Link href="/cart" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors group">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
              <ChevronLeft size={18} />
            </div>
            <span>Return to Cart</span>
          </Link>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold border border-emerald-100 shadow-sm">
            <Lock size={14} className="text-emerald-600" />
            <span>256-bit Secure Checkout</span>
          </div>
        </div>
      </header>

      <div className="container-earner mt-8 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Payment Section */}
          <div className="flex-1 order-2 lg:order-1">
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden transform transition-all duration-500 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
              <div className="p-8 lg:p-10">
                <h2 className="text-2xl font-bold text-slate-900 mb-8 tracking-tight">Select Payment Method</h2>
                
                {error && (
                  <div className="p-4 mb-6 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
                    {error}
                  </div>
                )}

                {!paymentData ? (
                  <div className="space-y-6">
                    {/* Method Selector */}
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setPaymentMethod("upi")}
                        className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all duration-200 ${
                          paymentMethod === "upi"
                            ? "border-teal-500 bg-teal-50/50 text-teal-700 shadow-sm"
                            : "border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-600"
                        }`}
                      >
                        <div className={`p-3 rounded-xl ${paymentMethod === "upi" ? "bg-teal-100/50" : "bg-slate-100"}`}>
                          <QrCode size={24} className={paymentMethod === "upi" ? "text-teal-600" : "text-slate-500"} />
                        </div>
                        <span className="font-semibold text-sm">UPI / QR Code</span>
                      </button>
                      
                      <button
                        onClick={() => setPaymentMethod("card")}
                        className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all duration-200 ${
                          paymentMethod === "card"
                            ? "border-teal-500 bg-teal-50/50 text-teal-700 shadow-sm"
                            : "border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-600"
                        }`}
                      >
                        <div className={`p-3 rounded-xl ${paymentMethod === "card" ? "bg-teal-100/50" : "bg-slate-100"}`}>
                          <CreditCard size={24} className={paymentMethod === "card" ? "text-teal-600" : "text-slate-500"} />
                        </div>
                        <span className="font-semibold text-sm">Credit / Debit Card</span>
                      </button>
                    </div>

                    <div className="pt-6">
                      <Button
                        onClick={handleInitiatePayment}
                        disabled={loading}
                        className="w-full h-14 text-lg rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-lg shadow-teal-500/20 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none disabled:transform-none"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Processing Securely...
                          </>
                        ) : (
                          <>Pay {formatCurrency(item.pkg.price)} Now</>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center justify-center text-center py-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 mb-6">
                      <QrCode size={28} className="text-teal-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Scan to Pay</h3>
                    <p className="text-slate-500 mb-8 max-w-sm">
                      Open any UPI app (GPay, PhonePe, Paytm) and scan this QR code to complete your payment of <strong className="text-slate-800">{formatCurrency(paymentData.amount)}</strong>.
                    </p>

                    <div className="p-6 bg-white rounded-3xl shadow-lg border border-slate-100 mb-8 transform transition-transform hover:scale-105">
                      {/* Render the dynamic QR Code using the intentUrl provided by the API */}
                      <QRCodeSVG 
                        value={paymentData.intentUrl || paymentData.paymentLink || "fallback_url"} 
                        size={220} 
                        level={"H"}
                        includeMargin={true}
                        bgColor={"#ffffff"}
                        fgColor={"#0f172a"}
                      />
                    </div>

                    <div className="flex flex-col gap-4 w-full max-w-sm">
                      <a 
                        href={paymentData.paymentLink}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full h-12 flex items-center justify-center rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors shadow-md"
                      >
                        Open Payment Link
                      </a>
                      
                      <button 
                        onClick={simulateSuccess}
                        className="text-sm font-medium text-teal-600 hover:text-teal-700 underline underline-offset-4"
                      >
                        I have completed the payment
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Trust Badges */}
              <div className="bg-slate-50 p-6 lg:px-10 border-t border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-200">
                    <Shield size={20} className="text-slate-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">100% Safe & Secure</h4>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                      Your payment is held securely in escrow. Funds are only released to the seller once you approve the delivered work, ensuring your complete satisfaction.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-[420px] order-1 lg:order-2">
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 sticky top-28">
              <h2 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">Order Summary</h2>
              
              <div className="flex gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="w-24 h-16 relative rounded-xl overflow-hidden shadow-sm shrink-0 bg-slate-100">
                  {item.gig.images && item.gig.images.length > 0 ? (
                    <img 
                      src={item.gig.images[0]} 
                      alt="Gig Cover" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <QrCode className="text-slate-300" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 leading-snug">
                    {item.gig.title}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-700 capitalize">
                    {tier} Package
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-sm mb-6 pb-6 border-b border-slate-100">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900">{formatCurrency(item.pkg.price)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Service Fee</span>
                  <span className="font-medium text-teal-600 flex items-center gap-1">
                    <CheckCircle2 size={14} /> Waived
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Delivery Time</span>
                  <span className="font-medium text-slate-900">{item.pkg.deliveryTime} Days</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Total Payable</h3>
                  <p className="text-xs text-slate-500 mt-1">Includes all taxes and fees</p>
                </div>
                <div className="text-3xl font-black text-teal-600 tracking-tight flex items-baseline">
                  {formatCurrency(item.pkg.price)}
                </div>
              </div>
              
              {/* Trust Mini Badges */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <Shield size={16} className="text-teal-600" />
                  Buyer Protection
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <CheckCircle2 size={16} className="text-teal-600" />
                  Satisfaction Guarantee
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
