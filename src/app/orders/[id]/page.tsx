import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Clock, CheckCircle, Package, ArrowLeft, RotateCcw, AlertCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

const STATUS_CONFIG = {
  ACTIVE: { icon: Clock, color: "text-teal-600", bg: "bg-[#e6f7ef]", label: "In Progress" },
  DELIVERED: { icon: Package, color: "text-[#1052d2]", bg: "bg-[#e6f0ff]", label: "Delivered" },
  COMPLETED: { icon: CheckCircle, color: "text-[#74767e]", bg: "bg-[#fafafa]", label: "Completed" },
  PENDING: { icon: AlertCircle, color: "text-[#f7a918]", bg: "bg-[#fff4e6]", label: "Pending Payment" },
  REVISION: { icon: RotateCcw, color: "text-purple-500", bg: "bg-purple-50", label: "In Revision" },
  CANCELLED: { icon: XCircle, color: "text-red-500", bg: "bg-red-50", label: "Cancelled" },
};

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      gig: {
        include: {
          media: true,
        }
      },
      seller: true,
      buyer: true,
    }
  });

  if (!order) {
    return notFound();
  }

  const statusInfo = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;
  const StatusIcon = statusInfo.icon;

  const gigImage = order.gig.media && order.gig.media.length > 0 
    ? order.gig.media[0].url 
    : "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=1000";

  return (
    <div className="bg-[#f5f5f5] min-h-screen py-10">
      <div className="container-earner max-w-4xl">
        <div className="mb-6">
          <Link href="/buyer/dashboard" className="inline-flex items-center text-[#74767e] hover:text-[#404145] text-sm font-semibold transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-[#e4e5e7] overflow-hidden shadow-sm">
          {/* Header */}
          <div className="p-6 md:p-8 border-b border-[#e4e5e7] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-[#404145] mb-2">Order Details</h1>
              <div className="flex items-center gap-3 text-sm text-[#74767e]">
                <span className="font-mono">#{order.id}</span>
                <span>•</span>
                <span>Ordered on {format(new Date(order.createdAt), "MMM d, yyyy")}</span>
              </div>
            </div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm ${statusInfo.bg} ${statusInfo.color}`}>
              <StatusIcon size={16} />
              {statusInfo.label}
            </div>
          </div>

          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-2 space-y-8">
              {/* Gig Info */}
              <div className="flex gap-4 items-start border border-[#e4e5e7] p-4 rounded-xl">
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 relative bg-gray-100">
                  <Image 
                    src={gigImage} 
                    alt={order.gig.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#404145] leading-tight mb-2">
                    {order.gig.title}
                  </h3>
                  <p className="text-sm text-[#74767e] mb-1">Seller: <span className="font-semibold text-[#404145]">{order.seller.name || "Anonymous"}</span></p>
                  <p className="text-sm text-[#74767e]">Package: <span className="font-semibold text-[#404145] capitalize">{order.packageTier}</span></p>
                </div>
              </div>

              {/* Requirements Section */}
              <div>
                <h3 className="text-lg font-bold text-[#404145] mb-3">Order Requirements</h3>
                <div className="bg-[#fafafa] border border-[#e4e5e7] p-4 rounded-xl text-[#62646a] text-sm">
                  {order.requirements || "No requirements submitted yet."}
                </div>
              </div>

              {/* Deliverables Section if any */}
              {order.deliverables && order.deliverables.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-[#404145] mb-3">Deliverables</h3>
                  <div className="space-y-3">
                    {order.deliverables.map((url, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border border-[#e4e5e7] rounded-lg">
                        <span className="text-sm font-semibold text-[#404145]">Delivery File {i + 1}</span>
                        <a href={url} target="_blank" rel="noreferrer" className="text-sm text-[#1dbf73] font-semibold hover:underline">
                          View File
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-[#fafafa] border border-[#e4e5e7] rounded-xl p-5">
                <h3 className="font-bold text-[#404145] mb-4">Summary</h3>
                
                <div className="space-y-3 mb-4 pb-4 border-b border-[#e4e5e7] text-sm">
                  <div className="flex justify-between text-[#62646a]">
                    <span>Item Price</span>
                    <span>{formatCurrency(order.price)}</span>
                  </div>
                  <div className="flex justify-between text-[#62646a]">
                    <span>Service Fee</span>
                    <span>{formatCurrency(order.price * 0.05)}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center font-bold text-lg text-[#404145] mb-6">
                  <span>Total</span>
                  <span>{formatCurrency(order.price * 1.05)}</span>
                </div>
                
                <Button className="w-full">
                  Contact Seller
                </Button>
              </div>

              {/* Timeline Info */}
              <div className="border border-[#e4e5e7] rounded-xl p-5 text-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[#74767e]">Expected Delivery</span>
                  <span className="font-semibold text-[#404145]">{format(new Date(order.dueDate), "MMM d")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#74767e]">Order Started</span>
                  <span className="font-semibold text-[#404145]">{format(new Date(order.createdAt), "MMM d")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
