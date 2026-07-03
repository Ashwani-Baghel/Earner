"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function CartPage() {
  const { items, removeFromCart, clearCart, totalPrice } = useCart();
  const { formatPrice } = useCurrency();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="container-earner py-24 flex flex-col items-center justify-center text-center">
        <ShoppingCart size={64} className="text-[#e4e5e7] mb-6" />
        <h1 className="text-3xl font-bold text-[#404145] mb-4">Your cart is empty</h1>
        <p className="text-lg text-[#74767e] mb-8">
          Looks like you haven't added any services to your cart yet.
        </p>
        <Link href="/">
          <Button size="lg">Explore Services</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container-earner py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#404145]">Shopping Cart</h1>
        <Button variant="outline" onClick={clearCart} className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200">
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, index) => (
            <div key={`${item.gig.id}-${index}`} className="bg-white border border-[#e4e5e7] p-6 rounded-xl flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-48 h-32 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                <img 
                  src={item.gig.images?.[0] || "https://picsum.photos/seed/gig/400/300"} 
                  alt={item.gig.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-bold text-lg text-[#404145] mb-1 line-clamp-2">{item.gig.title}</h3>
                    <p className="text-sm text-[#74767e] capitalize mb-3">
                      Package: <span className="font-semibold text-[#404145]">{item.tier}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl text-[#404145]">{formatPrice(item.pkg.price)}</p>
                  </div>
                </div>

                <div className="mt-auto pt-4 flex items-center justify-between border-t border-[#e4e5e7]">
                  <button 
                    onClick={() => removeFromCart(item.gig.id)}
                    className="flex items-center gap-1.5 text-sm text-[#74767e] hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} /> Remove
                  </button>

                  <Button 
                    onClick={() => router.push(`/checkout/${item.gig.id}?tier=${item.tier}`)}
                    className="flex items-center gap-2"
                  >
                    Checkout Item <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border border-[#e4e5e7] p-6 rounded-xl sticky top-24">
            <h2 className="text-xl font-bold text-[#404145] mb-6">Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-[#74767e]">
                <span>Subtotal ({items.length} items)</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              {/* Future Service Fee Implementation
              <div className="flex justify-between text-[#74767e]">
                <span>Service Fee (5%)</span>
                <span>{formatPrice(totalPrice * 0.05)}</span>
              </div>
              */}
              <div className="border-t border-[#e4e5e7] pt-4 flex justify-between font-bold text-xl text-[#404145]">
                <span>Total</span>
                <span>{formatPrice(totalPrice)}</span>
                {/* <span>{formatPrice(totalPrice * 1.05)}</span> */}
              </div>
            </div>

            <p className="text-xs text-[#74767e] text-center mt-4">
              You can checkout individual items from your cart using the "Checkout Item" buttons on each gig.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
