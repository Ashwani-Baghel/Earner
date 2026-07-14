"use client";

import { useEffect, useState, use, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Lock, Shield, CreditCard, ChevronLeft, QrCode, CheckCircle2, Loader2, Share2, Copy, Check, Download, X, Smartphone } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import Image from "next/image";

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
  const [copied, setCopied] = useState(false);
  const [showMobileQR, setShowMobileQR] = useState(false);
  const qrCanvasRef = useRef<HTMLDivElement>(null);

  const item = items.find(i => i.gig.id === gigId && i.tier === tier);

  useEffect(() => {
    if (!item && items.length > 0) {
      router.replace("/cart");
    }
  }, [item, items.length, router]);

  if (!item) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full text-center border border-slate-200">
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
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || "Failed to initiate payment");
      }

      setPaymentData(data.data);

      // ─── Auto-redirect mobile users to their UPI app ────────────────────
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobile && paymentMethod === "upi" && data.data?.intentUrl) {
        window.location.href = data.data.intentUrl;
      }
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const simulateSuccess = () => {
    if (paymentData?.orderId) {
      router.push(`/checkout/success?orderId=${paymentData.orderId}`);
    }
  };

  // ─── Extract UPI ID from intentUrl ───────────────────────────────────────
  const getUpiId = (intentUrl: string | undefined) => {
    if (!intentUrl) return null;
    try {
      const params = new URL(intentUrl).searchParams;
      return params.get("pa"); // pa = payee address (UPI ID)
    } catch {
      return null;
    }
  };

  // ─── Copy UPI ID to clipboard ─────────────────────────────────────────────
  const handleCopyUpiId = async (upiId: string) => {
    await navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── Download QR as PNG ───────────────────────────────────────────────────
  const handleDownloadQR = () => {
    const canvas = document.querySelector("#qr-canvas canvas") as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `earner-payment-qr-${paymentData?.orderId || "code"}.png`;
    a.click();
  };

  // ─── Share QR via Web Share API ───────────────────────────────────────────
  const handleShare = async () => {
    const shareData = {
      title: "Earner Payment",
      text: `Pay ${formatCurrency(item?.pkg.price || 0)} for your order on Earner.\nUPI ID: ${getUpiId(paymentData?.intentUrl) || ""}`,
      url: paymentData?.paymentLink || window.location.href,
    };
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(shareData.url);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fa] pb-20 font-sans">
      
      {/* Sub Header for Return and Secure Checkout */}
      <div className="container-earner max-w-[1300px] mt-8 mb-6 flex justify-between items-center">
        <Link href="/cart" className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 font-medium transition-colors text-sm">
          <ChevronLeft size={16} /> Return to Cart
        </Link>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold border border-emerald-100 shadow-sm">
          <Lock size={14} className="text-emerald-600" />
          <span>256-bit Secure Checkout</span>
        </div>
      </div>

      <div className="container-earner max-w-[1300px]">
        {/* 3 Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Order Summary */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-100 p-6 sticky top-28">
              <h2 className="text-[17px] font-bold text-slate-900 mb-6 tracking-tight">Order Summary</h2>
              
              <div className="flex gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="w-[80px] h-[50px] relative rounded overflow-hidden shadow-sm shrink-0 bg-slate-100 border border-slate-200">
                  {item.gig.images && item.gig.images.length > 0 ? (
                    <img 
                      src={item.gig.images[0]} 
                      alt="Gig Cover" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <QrCode className="text-slate-300 w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 text-[13px] leading-snug line-clamp-2">
                    {item.gig.title}
                  </h3>
                  <div className="inline-flex items-center mt-1 px-1.5 py-0.5 bg-slate-50 rounded text-[11px] font-medium text-slate-500 border border-slate-100 capitalize">
                    {tier} Package
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-sm mb-6 pb-6 border-b border-slate-100">
                <div className="flex justify-between items-center text-slate-500 text-[13px]">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-800">{formatCurrency(item.pkg.price)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500 text-[13px]">
                  <span>Service Fee</span>
                  <span className="font-medium text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Waived
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-500 text-[13px]">
                  <span>Delivery Time</span>
                  <span className="font-medium text-slate-800">{item.pkg.deliveryTime} Days</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-6">
                <div>
                  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Incl. all taxes</p>
                </div>
                <div className="text-2xl font-bold text-emerald-600 tracking-tight">
                  {formatCurrency(item.pkg.price)}
                </div>
              </div>
              
              {/* Trust Badges */}
              <div className="space-y-2 mt-2">
                <div className="flex items-center gap-2.5 text-[12px] font-medium text-slate-600 bg-slate-50/80 p-3 rounded-lg border border-slate-100">
                  <Shield size={16} className="text-emerald-600 shrink-0" />
                  Buyer Protection
                </div>
                <div className="flex items-center gap-2.5 text-[12px] font-medium text-slate-600 bg-slate-50/80 p-3 rounded-lg border border-slate-100">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  Satisfaction Guarantee
                </div>
              </div>
            </div>
          </div>

          {/* MIDDLE COLUMN: Select Payment Method */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden">
              <div className="p-8">
                <h2 className="text-[22px] font-bold text-slate-900 mb-6">Select Payment Method</h2>
                
                {error && (
                  <div className="p-4 mb-6 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-sm font-medium">
                    {error}
                  </div>
                )}

                <div className="space-y-4 mb-8">
                  {/* UPI Option */}
                  <label className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "upi" ? "border-emerald-500 bg-emerald-50/30" : "border-slate-100 hover:border-slate-200"
                  }`}>
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                        <QrCode size={20} className="text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="text-[15px] font-bold text-slate-800">UPI / QR Code</h4>
                        <p className="text-[12px] text-slate-500 mt-0.5">Google Pay, PhonePe, Paytm & more</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "upi" ? "border-emerald-500" : "border-slate-300"
                    }`}>
                      {paymentMethod === "upi" && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                    </div>
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value="upi" 
                      checked={paymentMethod === "upi"} 
                      onChange={() => setPaymentMethod("upi")}
                      className="hidden" 
                    />
                  </label>

                    {/* Card Option */}
                  <label className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "card" ? "border-emerald-500 bg-emerald-50/30" : "border-slate-100 hover:border-slate-200"
                  }`}>
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                        <CreditCard size={20} className="text-slate-400" />
                      </div>
                      <div>
                        <h4 className="text-[15px] font-bold text-slate-800">Credit / Debit Card</h4>
                        <p className="text-[12px] text-slate-500 mt-0.5">Visa, Mastercard, AMEX</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "card" ? "border-emerald-500" : "border-slate-300"
                    }`}>
                      {paymentMethod === "card" && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                    </div>
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value="card" 
                      checked={paymentMethod === "card"} 
                      onChange={() => setPaymentMethod("card")}
                      className="hidden" 
                    />
                  </label>

                  {/* PayPal Option (Coming Soon) */}
                  <label className="relative flex items-center p-4 rounded-xl border-2 border-slate-100 bg-slate-50 opacity-70 cursor-not-allowed">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                        <span className="font-black text-slate-400 italic">P</span>
                      </div>
                      <div className="flex-1 flex justify-between items-center pr-4">
                        <div>
                          <h4 className="text-[15px] font-bold text-slate-500">PayPal</h4>
                          <p className="text-[12px] text-slate-400 mt-0.5">Secure international payments</p>
                        </div>
                        <span className="bg-slate-200 text-slate-500 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Coming Soon</span>
                      </div>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 border-slate-200 flex items-center justify-center bg-slate-100"></div>
                  </label>

                  {/* Crypto Option (Coming Soon) */}
                  <label className="relative flex items-center p-4 rounded-xl border-2 border-slate-100 bg-slate-50 opacity-70 cursor-not-allowed">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                        <span className="font-black text-slate-400">₿</span>
                      </div>
                      <div className="flex-1 flex justify-between items-center pr-4">
                        <div>
                          <h4 className="text-[15px] font-bold text-slate-500">Cryptocurrency</h4>
                          <p className="text-[12px] text-slate-400 mt-0.5">Pay with BTC, ETH, USDT</p>
                        </div>
                        <span className="bg-slate-200 text-slate-500 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Coming Soon</span>
                      </div>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 border-slate-200 flex items-center justify-center bg-slate-100"></div>
                  </label>
                </div>

                <Button
                  onClick={handleInitiatePayment}
                  disabled={loading}
                  className="w-full h-[52px] text-[16px] rounded-xl bg-[#009688] hover:bg-[#00897b] text-white font-bold shadow-md transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating Secure Link...
                    </>
                  ) : (
                    <>Pay {formatCurrency(item.pkg.price)} Now</>
                  )}
                </Button>
              </div>

              {/* Secure Footer inside Middle Column */}
              <div className="bg-slate-50 p-6 border-t border-slate-100">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-slate-200 shadow-sm">
                    <Shield size={18} className="text-slate-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-[13px]">100% Safe & Secure</h4>
                    <p className="text-slate-500 text-[12px] mt-1 leading-relaxed">
                      Your payment is held securely in escrow. Funds are only released once you approve the delivered work.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Scan to Pay (QR Code) */}
          <div className="lg:col-span-4">
            {paymentData ? (
              <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-100 p-6 flex flex-col items-center">
                <h2 className="text-[20px] font-bold text-slate-900 mb-1">Scan to Pay</h2>
                <p className="text-[13px] text-slate-500 mb-5 text-center">Scan QR with any UPI app</p>

                {/* QR Code (desktop visible) */}
                <div id="qr-canvas" className="p-4 bg-white rounded-[24px] border border-emerald-100 shadow-[0_0_40px_rgba(16,185,129,0.08)] mb-4 hidden lg:block">
                  <QRCodeCanvas
                    value={paymentData.intentUrl || paymentData.paymentLink || "https://earner.com"}
                    size={190}
                    level="H"
                    includeMargin={false}
                    bgColor="#ffffff"
                    fgColor="#0f172a"
                    className="rounded-xl"
                  />
                </div>

                {/* Mobile: show QR popup button instead */}
                <button
                  onClick={() => setShowMobileQR(true)}
                  className="lg:hidden flex items-center gap-2 px-5 py-3 bg-teal-50 border-2 border-teal-200 text-teal-700 rounded-xl font-bold text-sm mb-4 hover:bg-teal-100 transition-colors"
                >
                  <Smartphone size={18} /> View QR Code
                </button>

                {/* UPI App Logos */}
                <div className="flex gap-4 mb-5 opacity-60">
                  {["GPay", "Paytm", "PhonePe", "BHIM"].map((app) => (
                    <div key={app} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400">{app}</div>
                  ))}
                </div>

                {/* UPI ID Section */}
                {getUpiId(paymentData.intentUrl) && (
                  <div className="w-full mb-5">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">Or Pay Using UPI ID</p>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                      <span className="flex-1 font-mono text-[13px] font-bold text-slate-800 truncate">
                        {getUpiId(paymentData.intentUrl)}
                      </span>
                      <button
                        onClick={() => handleCopyUpiId(getUpiId(paymentData.intentUrl)!)}
                        className={`shrink-0 p-1.5 rounded-lg transition-all ${copied ? "bg-teal-100 text-teal-600" : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"}`}
                        title="Copy UPI ID"
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                    {copied && (
                      <p className="text-[11px] text-teal-600 text-center mt-1.5 font-medium">✓ UPI ID copied!</p>
                    )}
                  </div>
                )}

                {/* Action Buttons: Download & Share */}
                <div className="flex gap-2 w-full mb-5">
                  <button
                    onClick={handleDownloadQR}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[12px] font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
                  >
                    <Download size={14} /> Download QR
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[12px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-colors"
                  >
                    <Share2 size={14} /> Share
                  </button>
                </div>

                <div className="w-full border-t border-slate-100 pt-4 text-center">
                  <p className="text-[11px] text-slate-400 font-medium">Order ID: {paymentData.orderId || "ERN-PAY"}</p>
                  <button
                    onClick={simulateSuccess}
                    className="text-[12px] font-semibold text-emerald-600 mt-2 hover:underline"
                  >
                    Simulate Payment Success
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white/50 rounded-2xl border border-dashed border-slate-200 p-8 flex flex-col items-center justify-center h-full min-h-[400px] text-center opacity-70">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <QrCode size={24} className="text-slate-300" />
                </div>
                <h3 className="font-semibold text-slate-700 text-sm">QR Code will appear here</h3>
                <p className="text-[12px] text-slate-400 mt-2 max-w-[200px]">
                  Select UPI and click "Pay Now" to generate your secure payment code.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ─── Mobile QR Popup Modal ─────────────────────────────────────────── */}
      {showMobileQR && paymentData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end lg:hidden" onClick={() => setShowMobileQR(false)}>
          <div
            className="w-full bg-white rounded-t-3xl p-6 pb-10 flex flex-col items-center animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag Handle */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mb-6" />

            <h2 className="text-xl font-bold text-slate-900 mb-1">Scan to Pay</h2>
            <p className="text-sm text-slate-500 mb-5">Scan QR with any UPI app</p>

            {/* QR Code */}
            <div id="qr-canvas-mobile" className="p-4 bg-white rounded-[24px] border border-emerald-100 shadow-[0_0_40px_rgba(16,185,129,0.1)] mb-5">
              <QRCodeCanvas
                value={paymentData.intentUrl || paymentData.paymentLink || "https://earner.com"}
                size={210}
                level="H"
                includeMargin={false}
                bgColor="#ffffff"
                fgColor="#0f172a"
                className="rounded-xl"
              />
            </div>

            {/* UPI App Logos */}
            <div className="flex gap-4 mb-5 opacity-60">
              {["GPay", "Paytm", "PhonePe", "BHIM"].map((app) => (
                <div key={app} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400">{app}</div>
              ))}
            </div>

            {/* UPI ID */}
            {getUpiId(paymentData.intentUrl) && (
              <div className="w-full mb-5">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">Or Pay Using UPI ID</p>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                  <span className="flex-1 font-mono text-[13px] font-bold text-slate-800 truncate">
                    {getUpiId(paymentData.intentUrl)}
                  </span>
                  <button
                    onClick={() => handleCopyUpiId(getUpiId(paymentData.intentUrl)!)}
                    className={`shrink-0 p-1.5 rounded-lg transition-all ${copied ? "bg-teal-100 text-teal-600" : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"}`}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
                {copied && <p className="text-[11px] text-teal-600 text-center mt-1.5 font-medium">✓ UPI ID copied!</p>}
              </div>
            )}

            {/* Share & Download Buttons */}
            <div className="flex gap-3 w-full mb-4">
              <button
                onClick={handleDownloadQR}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
              >
                <Download size={16} /> Download
              </button>
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors"
              >
                <Share2 size={16} /> Share
              </button>
            </div>

            <button
              onClick={() => setShowMobileQR(false)}
              className="flex items-center gap-2 text-sm text-slate-500 font-medium hover:text-slate-800 transition-colors"
            >
              <X size={16} /> Close
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
