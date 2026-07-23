"use client";

import { useEffect, useState, use, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  Lock, Shield, CreditCard, ChevronLeft, QrCode, CheckCircle2,
  Loader2, Share2, Download, X, Smartphone, ChevronRight, Clock, Star, Copy
} from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { QRCodeCanvas } from "qrcode.react";

interface CheckoutPageProps {
  params: Promise<{ gigId: string }>;
}

// ─── Step indicator component ─────────────────────────────────────────────────
function StepIndicator({ step }: { step: number }) {
  const steps = ["Order Details", "Payment Method", "Confirm & Pay"];
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((label, i) => {
        const idx = i + 1;
        const isActive = idx === step;
        const isDone = idx < step;
        return (
          <div key={label} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              isActive ? "bg-teal-600 text-white shadow-md shadow-teal-600/20" :
              isDone ? "bg-teal-50 text-teal-700" :
              "bg-slate-100 text-slate-400"
            }`}>
              {isDone ? <CheckCircle2 size={12} /> : <span>{idx}</span>}
              {label}
            </div>
            {i < steps.length - 1 && (
              <ChevronRight size={14} className={isDone ? "text-teal-400" : "text-slate-300"} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tier = searchParams.get("tier") || "basic";
  const { gigId } = use(params);

  const { items } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1=details, 2=payment select, 3=QR/done

  // Payment State
  const [paymentData, setPaymentData] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card">("upi");
  const [showMobileQR, setShowMobileQR] = useState(false);
  const [qrCopied, setQrCopied] = useState(false);

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

  // INR conversion
  const inrAmount = Math.round(item.pkg.price);
  const inrFormatted = `₹${inrAmount.toLocaleString("en-IN")}`;

  // Computed order ref (available after payment initiated)
  const orderRef = paymentData?.orderId || paymentData?.txnId || "";

  // UPI intent URL — always uses inrAmount as the authoritative amount.
  // If the API returned an intentUrl we still patch its 'am' field to ensure
  // the INR amount (not the raw USD price) is what gets scanned.
  const upiIntentUrl = (() => {
    if (paymentData?.intentUrl) {
      try {
        // Parse the returned url and force-overwrite the amount
        const url = new URL(paymentData.intentUrl);
        url.searchParams.set("am", String(inrAmount));
        url.searchParams.set("cu", "INR");
        url.searchParams.set("pn", "Earner Platform");
        if (orderRef) url.searchParams.set("tr", orderRef);
        return url.toString();
      } catch {
        // if URL parsing fails fall through to build fresh
      }
    }
    // Build a fresh UPI intent URL with all required fields
    const params = new URLSearchParams({
      pa:   "earner@upi",
      pn:   "Earner Platform",
      am:   String(inrAmount),   // ← INR, not USD
      cu:   "INR",
      tn:   `Order for: ${(item.gig.title || "Gig").substring(0, 50)}`,
      mc:   "7372",
      mode: "02",
      ...(orderRef ? { tr: orderRef } : {}),
    });
    return `upi://pay?${params.toString()}`;
  })();

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
      setStep(3);

      // Auto-redirect mobile UPI users
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


  // ─── Creates a branded payment card PNG (QR + company info + amount) ────────
  const createPaymentCard = (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const qrCanvas =
        (document.querySelector("#qr-canvas canvas") as HTMLCanvasElement) ||
        (document.querySelector("#qr-canvas-mobile canvas") as HTMLCanvasElement);
      if (!qrCanvas) { resolve(null); return; }

      const qrSize   = qrCanvas.width;   // e.g. 210
      const pad      = 36;
      const hdrH     = 110;
      const ftrH     = 140;
      const W        = qrSize + pad * 2;
      const H        = hdrH + qrSize + pad + ftrH;

      const c   = document.createElement("canvas");
      c.width   = W;
      c.height  = H;
      const ctx = c.getContext("2d");
      if (!ctx) { resolve(null); return; }

      // ── White background ────────────────────────────────────────────────
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);

      // ── Teal header ─────────────────────────────────────────────────────
      ctx.fillStyle = "#0d9488";
      ctx.beginPath();
      ctx.roundRect(0, 0, W, hdrH, [16, 16, 0, 0]);
      ctx.fill();

      // Company name
      ctx.fillStyle = "#ffffff";
      ctx.font      = "bold 26px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Earner", W / 2, 42);

      // Tagline
      ctx.font      = "14px Arial, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.fillText("Secure Freelance Marketplace", W / 2, 64);

      // Amount — large, prominent
      ctx.font      = "bold 24px Arial, sans-serif";
      ctx.fillStyle = "#ccfbf1";  // teal-100
      ctx.fillText(`Amount: ${inrFormatted}`, W / 2, 96);

      // ── QR code ─────────────────────────────────────────────────────────
      ctx.drawImage(qrCanvas, pad, hdrH + pad / 2, qrSize, qrSize);

      // Thin divider above footer
      const ftrY = hdrH + qrSize + pad / 2 + 8;
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.moveTo(pad, ftrY);
      ctx.lineTo(W - pad, ftrY);
      ctx.stroke();

      // ── Footer info ─────────────────────────────────────────────────────
      const gigTitle = (item.gig.title || "Freelance Gig").substring(0, 45);
      const pkgLabel = `${tier.charAt(0).toUpperCase() + tier.slice(1)} Package  •  ${item.pkg.deliveryTime} Days Delivery`;
      const ordLabel = orderRef ? `Order ID: ${orderRef}` : "";

      ctx.textAlign = "center";

      ctx.font      = "13px Arial, sans-serif";
      ctx.fillStyle = "#334155";
      ctx.fillText(gigTitle, W / 2, ftrY + 26);

      ctx.font      = "12px Arial, sans-serif";
      ctx.fillStyle = "#64748b";
      ctx.fillText(pkgLabel, W / 2, ftrY + 46);

      if (ordLabel) {
        ctx.font      = "11px Arial, sans-serif";
        ctx.fillStyle = "#94a3b8";
        ctx.fillText(ordLabel, W / 2, ftrY + 66);
      }

      ctx.font      = "11px Arial, sans-serif";
      ctx.fillStyle = "#0d9488";
      ctx.fillText("Scan with GPay, PhonePe, Paytm or BHIM", W / 2, ftrY + 88);

      ctx.font      = "10px Arial, sans-serif";
      ctx.fillStyle = "#cbd5e1";
      ctx.fillText("earner.com  •  Powered by BankLinkr", W / 2, ftrY + 108);

      c.toBlob((blob) => resolve(blob), "image/png");
    });
  };

  // ─── Download branded payment card PNG ────────────────────────────────────────
  const handleDownloadQR = async () => {
    const blob = await createPaymentCard();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a   = document.createElement("a");
    a.href     = url;
    a.download = `earner-payment-${inrAmount}${orderRef ? `-${orderRef}` : ""}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // ─── Copy branded payment card image to clipboard ─────────────────────────────
  const handleCopyQR = async () => {
    try {
      const blob = await createPaymentCard();
      if (blob && navigator.clipboard && typeof ClipboardItem !== "undefined") {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob })
        ]);
        setQrCopied(true);
        setTimeout(() => setQrCopied(false), 2500);
        return;
      }
    } catch (err) {
      console.warn("Image copy failed, falling back to URL copy", err);
    }
    // Fallback: copy payment link URL
    const shareUrl = paymentData?.paymentLink || upiIntentUrl;
    await navigator.clipboard.writeText(shareUrl);
    setQrCopied(true);
    setTimeout(() => setQrCopied(false), 2500);
  };

  // ─── Share branded payment card via Web Share API ─────────────────────────────
  const handleShare = async () => {
    const shareUrl  = paymentData?.paymentLink || upiIntentUrl;
    const shareText = [
      `💳 Payment Request — Earner`,
      `Amount:  ${inrFormatted}`,
      `Service: ${(item.gig.title || "Freelance Gig").substring(0, 60)}`,
      `Package: ${tier.charAt(0).toUpperCase() + tier.slice(1)} (${item.pkg.deliveryTime} days)`,
      orderRef ? `Order ID: ${orderRef}` : "",
      ``,
      `Scan the attached QR code with GPay, PhonePe, Paytm or BHIM.`,
    ].filter(Boolean).join("\n");

    const blob = await createPaymentCard();

    // Try sharing branded image file first (mobile browsers)
    if (blob) {
      const file = new File([blob], "earner-payment-qr.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: `Pay ${inrFormatted} — Earner`,
            text:  shareText,
            files: [file],
          });
          return;
        } catch (err: any) {
          if (err.name === "AbortError") return;
          console.warn("File share failed, trying URL share", err);
        }
      }
    }

    // Fallback: share link with rich text
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Pay ${inrFormatted} — Earner`,
          text:  shareText,
          url:   shareUrl,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
    }
  };

  // ─── Order Summary panel (shown on all steps as left sidebar) ─────────────
  const OrderSummary = () => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-28">
      <h2 className="text-base font-bold text-slate-900 mb-5">Order Summary</h2>

      <div className="flex gap-3 mb-5 pb-5 border-b border-slate-100">
        <div className="w-[72px] h-[48px] relative rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
          {item.gig.images?.[0] ? (
            <img src={item.gig.images[0]} alt="Gig" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <QrCode size={18} className="text-slate-300" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 text-[13px] leading-snug line-clamp-2">{item.gig.title}</h3>
          <span className="inline-flex mt-1 px-1.5 py-0.5 bg-slate-50 rounded text-[10px] font-medium text-slate-500 border border-slate-100 capitalize">{tier} Package</span>
        </div>
      </div>

      <div className="space-y-3 text-[13px] mb-5 pb-5 border-b border-slate-100">
        <div className="flex justify-between text-slate-500">
          <span>Subtotal</span>
          <span className="font-medium text-slate-800">{inrFormatted}</span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>Service Fee</span>
          <span className="font-medium text-emerald-600 flex items-center gap-1"><CheckCircle2 size={11} /> Waived</span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>Delivery</span>
          <span className="font-medium text-slate-800 flex items-center gap-1"><Clock size={11} /> {item.pkg.deliveryTime} Days</span>
        </div>
      </div>

      <div className="flex justify-between items-end mb-5">
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total</p>
          <p className="text-[10px] text-slate-400">Incl. all taxes</p>
        </div>
        <p className="text-2xl font-black text-emerald-600">{inrFormatted}</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <Shield size={14} className="text-emerald-600 shrink-0" /> Buyer Protection
        </div>
        <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <CheckCircle2 size={14} className="text-emerald-600 shrink-0" /> Satisfaction Guarantee
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f9fa] pb-24 font-sans">

      {/* Top bar */}
      <div className="container-earner max-w-[1200px] mt-8 mb-6 flex justify-between items-center">
        <button
          onClick={() => step > 1 ? setStep((step - 1) as 1 | 2 | 3) : router.back()}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 font-medium transition-colors text-sm"
        >
          <ChevronLeft size={16} /> {step > 1 ? "Back" : "Return to Cart"}
        </button>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold border border-emerald-100">
          <Lock size={13} className="text-emerald-600" /> 256-bit Secure Checkout
        </div>
      </div>

      <div className="container-earner max-w-[1200px]">
        {/* Step Indicator */}
        <StepIndicator step={step} />

        {/* ─── STEP 1: Order Details ───────────────────────────────────────── */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left - Order Summary */}
            <div className="lg:col-span-4">
              <OrderSummary />
            </div>

            {/* Right - Gig Order Details */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-7 border-b border-slate-100">
                  <h2 className="text-xl font-bold text-slate-900 mb-1">Order Details</h2>
                  <p className="text-slate-500 text-sm">Review your gig details before proceeding to payment.</p>
                </div>

                <div className="p-7">
                  {/* Gig Info */}
                  <div className="flex gap-4 mb-7 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-20 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-200">
                      {item.gig.images?.[0] ? (
                        <img src={item.gig.images[0]} alt="Gig" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <QrCode size={22} />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 leading-snug mb-1">{item.gig.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-100 rounded-full font-bold capitalize">{tier} Package</span>
                        {item.gig.rating > 0 && (
                          <span className="flex items-center gap-1 text-[11px] text-slate-500">
                            <Star size={11} className="fill-amber-400 text-amber-400" />
                            {item.gig.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Package Features */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
                    {[
                      { label: "Package", value: `${tier.charAt(0).toUpperCase() + tier.slice(1)}` },
                      { label: "Delivery", value: `${item.pkg.deliveryTime} Days` },
                      { label: "Revisions", value: item.pkg.revisions === -1 ? "Unlimited" : String(item.pkg.revisions) },
                    ].map(({ label, value }) => (
                      <div key={label} className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                        <p className="font-bold text-slate-800 text-sm">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Package description */}
                  {item.pkg.description && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-7">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">What&apos;s Included</p>
                      <p className="text-slate-700 text-sm leading-relaxed">{item.pkg.description}</p>
                    </div>
                  )}

                  {/* Features list */}
                  {item.pkg.features && item.pkg.features.length > 0 && (
                    <div className="mb-7">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Features</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {item.pkg.features.map((feature: string, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                            <CheckCircle2 size={14} className="text-teal-500 shrink-0" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Total + Continue Button */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Total Amount</p>
                      <p className="text-2xl font-black text-emerald-600">{inrFormatted}</p>
                    </div>
                    <button
                      onClick={() => setStep(2)}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-base rounded-xl shadow-md shadow-teal-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Continue to Payment <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 2: Select Payment Method ──────────────────────────────── */}
        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4">
              <OrderSummary />
            </div>

            <div className="lg:col-span-8">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-7 border-b border-slate-100">
                  <h2 className="text-xl font-bold text-slate-900 mb-1">Select Payment Method</h2>
                  <p className="text-slate-500 text-sm">Choose how you would like to pay {inrFormatted}</p>
                </div>

                <div className="p-7">
                  {error && (
                    <div className="p-4 mb-6 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-sm font-medium">
                      {error}
                    </div>
                  )}

                  <div className="space-y-3 mb-8">
                    {/* UPI Option */}
                    <label className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === "upi" ? "border-teal-500 bg-teal-50/30" : "border-slate-100 hover:border-slate-200 bg-white"
                    }`}>
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                          <QrCode size={20} className="text-teal-600" />
                        </div>
                        <div>
                          <h4 className="text-[15px] font-bold text-slate-800">UPI / QR Code</h4>
                          <p className="text-[12px] text-slate-500 mt-0.5">GPay, PhonePe, Paytm, BHIM & more</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        paymentMethod === "upi" ? "border-teal-500" : "border-slate-300"
                      }`}>
                        {paymentMethod === "upi" && <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />}
                      </div>
                      <input type="radio" name="pm" value="upi" checked={paymentMethod === "upi"} onChange={() => setPaymentMethod("upi")} className="hidden" />
                    </label>

                    {/* Card Option */}
                    <label className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === "card" ? "border-teal-500 bg-teal-50/30" : "border-slate-100 hover:border-slate-200 bg-white"
                    }`}>
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                          <CreditCard size={20} className="text-slate-400" />
                        </div>
                        <div>
                          <h4 className="text-[15px] font-bold text-slate-800">Credit / Debit Card</h4>
                          <p className="text-[12px] text-slate-500 mt-0.5">Visa, Mastercard, RuPay, AMEX</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        paymentMethod === "card" ? "border-teal-500" : "border-slate-300"
                      }`}>
                        {paymentMethod === "card" && <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />}
                      </div>
                      <input type="radio" name="pm" value="card" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} className="hidden" />
                    </label>

                    {/* PayPal - Coming Soon */}
                    <div className="relative flex items-center p-4 rounded-xl border-2 border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                          <span className="font-black text-slate-400 italic text-lg">P</span>
                        </div>
                        <div className="flex-1 flex justify-between items-center pr-4">
                          <div>
                            <h4 className="text-[15px] font-bold text-slate-500">PayPal</h4>
                            <p className="text-[12px] text-slate-400 mt-0.5">Secure international payments</p>
                          </div>
                          <span className="bg-slate-200 text-slate-500 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Coming Soon</span>
                        </div>
                      </div>
                      <div className="w-5 h-5 rounded-full border-2 border-slate-200 bg-slate-100" />
                    </div>

                    {/* Crypto - Coming Soon */}
                    <div className="relative flex items-center p-4 rounded-xl border-2 border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                          <span className="font-black text-slate-400 text-lg">₿</span>
                        </div>
                        <div className="flex-1 flex justify-between items-center pr-4">
                          <div>
                            <h4 className="text-[15px] font-bold text-slate-500">Cryptocurrency</h4>
                            <p className="text-[12px] text-slate-400 mt-0.5">Pay with BTC, ETH, USDT</p>
                          </div>
                          <span className="bg-slate-200 text-slate-500 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Coming Soon</span>
                        </div>
                      </div>
                      <div className="w-5 h-5 rounded-full border-2 border-slate-200 bg-slate-100" />
                    </div>
                  </div>

                  {/* Pay Now Button */}
                  <button
                    onClick={handleInitiatePayment}
                    disabled={loading}
                    className="w-full h-[54px] flex items-center justify-center gap-2 text-[16px] rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-70 text-white font-bold shadow-md shadow-teal-600/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    {loading ? (
                      <><Loader2 className="h-5 w-5 animate-spin" /> Generating Secure Link...</>
                    ) : (
                      <>Pay {inrFormatted} Now</>
                    )}
                  </button>

                  {/* Secure note */}
                  <div className="flex gap-3 mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <Shield size={18} className="text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[13px] font-bold text-slate-700">100% Safe & Secure</p>
                      <p className="text-[12px] text-slate-500 mt-0.5 leading-relaxed">
                        Your payment is held securely in escrow. Funds are only released once you approve the delivered work.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 3: QR Code / Confirmation ─────────────────────────────── */}
        {step === 3 && paymentData && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4">
              <OrderSummary />
            </div>

            <div className="lg:col-span-8">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-7 border-b border-slate-100">
                  <h2 className="text-xl font-bold text-slate-900 mb-1">Scan to Pay</h2>
                  <p className="text-slate-500 text-sm">Scan the QR code with any UPI app to pay <strong>{inrFormatted}</strong></p>
                </div>

                <div className="p-7 flex flex-col items-center">
                  {/* QR Code */}
                  <div id="qr-canvas" className="p-5 bg-white rounded-[24px] border-2 border-teal-100 shadow-[0_0_50px_rgba(16,185,129,0.10)] mb-5 hidden lg:block">
                    <QRCodeCanvas
                      value={upiIntentUrl}
                      size={210}
                      level="H"
                      includeMargin={false}
                      bgColor="#ffffff"
                      fgColor="#0f172a"
                      className="rounded-xl"
                    />
                  </div>

                  {/* Amount badge on QR */}
                  <div className="hidden lg:flex items-center gap-2 bg-teal-50 border border-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-bold mb-5">
                    <CheckCircle2 size={15} /> Amount: {inrFormatted}
                  </div>

                  {/* Mobile: button to open popup */}
                  <button
                    onClick={() => setShowMobileQR(true)}
                    className="lg:hidden flex items-center gap-2 px-6 py-3 bg-teal-50 border-2 border-teal-200 text-teal-700 rounded-xl font-bold text-sm mb-5 hover:bg-teal-100 transition-colors"
                  >
                    <Smartphone size={18} /> View QR Code ({inrFormatted})
                  </button>

                  {/* UPI App Logos */}
                  <div className="flex gap-4 mb-6 opacity-60">
                    {["GPay", "Paytm", "PhonePe", "BHIM"].map((app) => (
                      <div key={app} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400">{app}</div>
                    ))}
                  </div>

                  {/* Action Buttons: Download, Copy & Share */}
                  <div className="flex gap-2 w-full max-w-sm mb-3">
                    <button
                      onClick={handleDownloadQR}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2.5 text-[12px] font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
                    >
                      <Download size={13} /> Download
                    </button>
                    <button
                      onClick={handleCopyQR}
                      className={`flex-1 flex items-center justify-center gap-1 px-3 py-2.5 text-[12px] font-semibold rounded-xl border transition-colors ${
                        qrCopied
                          ? "bg-teal-50 text-teal-700 border-teal-200"
                          : "text-slate-600 bg-slate-50 hover:bg-slate-100 border-slate-200"
                      }`}
                    >
                      <Copy size={13} /> {qrCopied ? "Copied!" : "Copy QR"}
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2.5 text-[12px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-colors"
                    >
                      <Share2 size={13} /> Share
                    </button>
                  </div>
                  {qrCopied && (
                    <p className="text-[11px] text-teal-600 font-medium mb-3 text-center">
                      ✓ QR image copied to clipboard!
                    </p>
                  )}

                  {/* Payment Details Panel */}
                  <div className="w-full max-w-sm border border-slate-100 rounded-xl overflow-hidden mb-4">
                    {/* Panel header */}
                    <div className="bg-teal-600 px-4 py-2.5 flex items-center justify-between">
                      <span className="text-white font-bold text-sm">Earner Platform</span>
                      <span className="text-teal-100 text-xs font-medium">Secure Payment</span>
                    </div>
                    {/* Details rows */}
                    <div className="divide-y divide-slate-50 bg-white">
                      <div className="flex justify-between items-center px-4 py-2.5">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Amount</span>
                        <span className="text-base font-black text-emerald-600">{inrFormatted}</span>
                      </div>
                      <div className="flex justify-between items-start px-4 py-2.5 gap-2">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0">Service</span>
                        <span className="text-[12px] font-medium text-slate-700 text-right line-clamp-2">{item.gig.title}</span>
                      </div>
                      <div className="flex justify-between items-center px-4 py-2.5">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Package</span>
                        <span className="text-[12px] font-medium text-slate-700 capitalize">{tier} · {item.pkg.deliveryTime}d</span>
                      </div>
                      {orderRef && (
                        <div className="flex justify-between items-center px-4 py-2.5">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Order ID</span>
                          <span className="text-[11px] font-mono text-slate-500">{orderRef}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center px-4 py-2.5">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">UPI ID</span>
                        <span className="text-[11px] font-mono text-teal-700">earner@upi</span>
                      </div>
                      <div className="flex justify-between items-center px-4 py-2.5">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Currency</span>
                        <span className="text-[12px] font-medium text-slate-700">INR (₹)</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={simulateSuccess}
                    className="text-[12px] font-semibold text-slate-400 hover:text-teal-600 transition-colors"
                  >
                    ✓ Simulate Payment Success (Dev Only)
                  </button>

                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Mobile QR Popup Modal ──────────────────────────────────────────── */}
      {showMobileQR && step === 3 && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end lg:hidden"
          onClick={() => setShowMobileQR(false)}
        >
          <div
            className="w-full bg-white rounded-t-3xl p-6 pb-10 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag Handle */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mb-6" />

            <h2 className="text-xl font-bold text-slate-900 mb-1">Scan to Pay</h2>
            <p className="text-sm text-slate-500 mb-2">Scan with any UPI app</p>

            {/* Amount Badge */}
            <div className="flex items-center gap-1.5 bg-teal-50 border border-teal-100 text-teal-700 px-3 py-1.5 rounded-full text-sm font-bold mb-5">
              <CheckCircle2 size={13} /> {inrFormatted}
            </div>

            {/* QR Code */}
            <div id="qr-canvas" className="p-4 bg-white rounded-[20px] border-2 border-teal-100 shadow-[0_0_40px_rgba(16,185,129,0.1)] mb-5">
              <QRCodeCanvas
                value={upiIntentUrl}
                size={220}
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

            {/* Download, Copy & Share */}
            <div className="flex gap-2 w-full mb-3">
              <button
                onClick={handleDownloadQR}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
              >
                <Download size={15} /> Download
              </button>
              <button
                onClick={handleCopyQR}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-sm font-semibold rounded-xl border transition-colors ${
                  qrCopied
                    ? "bg-teal-50 text-teal-700 border-teal-200"
                    : "text-slate-600 bg-slate-50 hover:bg-slate-100 border-slate-200"
                }`}
              >
                <Copy size={15} /> {qrCopied ? "Copied!" : "Copy QR"}
              </button>
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors"
              >
                <Share2 size={15} /> Share
              </button>
            </div>
            {qrCopied && (
              <p className="text-[11px] text-teal-600 font-medium mb-4 text-center">
                ✓ QR image copied to clipboard!
              </p>
            )}

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
  );
}
