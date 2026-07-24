"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ChevronRight, Loader2, Edit, Trash2, MoreHorizontal, Package } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function SellerGigsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [fetching, setFetching] = useState(true);
  const [gigs, setGigs] = useState<any[]>([]);

  // Delete modal state
  const [gigToDelete, setGigToDelete] = useState<any>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/"); return; }
    if (user.hasRole && user.role === "BUYER") { router.push("/buyer/dashboard"); return; }
    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") { router.push("/admin"); return; }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !user.hasRole || user.role !== "SELLER") return;

    const fetchData = async () => {
      try {
        const token = await user.getIdToken();
        const gigsRes = await fetch("/api/gigs?mine=true", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (gigsRes.ok) {
          const data = await gigsRes.json();
          setGigs(data);
        }
      } catch (err) {
        console.error("Failed to fetch gigs:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [user]);

  const handleDelete = async () => {
    if (!gigToDelete || !user) return;
    setIsDeleting(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/gigs/${gigToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete gig");

      toast.success("Gig deleted successfully");
      setGigs(prev => prev.filter(g => g.id !== gigToDelete.id));
      setGigToDelete(null);
      setDeleteConfirmText("");
    } catch (err: any) {
      toast.error(err.message || "Could not delete gig.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading || fetching) return (
    <div className="flex items-center justify-center min-h-[100vh]">
      <Loader2 className="animate-spin text-teal-600" size={36} />
    </div>
  );

  return (
    <div className="bg-[#f7f7f7] min-h-screen pb-20">
      <div className="max-w-6xl mx-auto pt-8 px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">My Gigs</h1>
            <p className="text-sm text-[#74767e]">Manage your active services, edit details, or create new ones.</p>
          </div>
          <Link href="/seller/gigs/new" className="bg-slate-900 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap">
            Create New Gig
          </Link>
        </div>

        {gigs.length > 0 ? (
          <div className="premium-card p-0 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold whitespace-nowrap">
                    <th className="px-8 py-4">Gig Details</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Created On</th>
                    <th className="px-6 py-4 text-right">Orders</th>
                    <th className="px-6 py-4 text-right">Rating</th>
                    <th className="px-8 py-4 text-right">Starting At</th>
                    <th className="px-6 py-4"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {gigs.map((gig, index) => {
                    const isLast = index === gigs.length - 1 && gigs.length > 1;
                    return (
                      <tr key={gig.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-5">
                          <Link href={`/seller/gigs/edit/${gig.id}`} className="flex items-center gap-4">
                            <div className="w-16 h-12 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0 border border-slate-200">
                              {gig.images?.[0] ? (
                                <img src={gig.images[0]} alt={gig.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              ) : (
                                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs">No img</div>
                              )}
                            </div>
                            <div className="max-w-[220px] sm:max-w-[300px]">
                              <p title={gig.title} className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-teal-600 transition-colors break-words whitespace-normal">{gig.title}</p>
                              <p className="text-xs text-slate-500 mt-1">{gig.category}</p>
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${gig.status === 'ACTIVE' ? 'bg-teal-50 text-teal-700' :
                            gig.status === 'PENDING' ? 'bg-amber-50 text-amber-700' :
                              gig.status === 'DRAFT' ? 'bg-slate-100 text-slate-700' :
                                'bg-red-50 text-red-700'
                            }`}>
                            {gig.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-600 whitespace-nowrap">
                          <div className="font-medium text-slate-900">{format(new Date(gig.createdAt), 'MMM d, yyyy')}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{format(new Date(gig.createdAt), 'h:mm a')}</div>
                        </td>
                        <td className="px-6 py-5 text-right font-bold text-slate-900 text-sm">
                          {gig.orders}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="text-sm font-bold text-slate-900">{gig.rating > 0 ? gig.rating.toFixed(1) : "—"}</span>
                            {gig.reviewCount > 0 && <span className="text-xs text-slate-400">({gig.reviewCount})</span>}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right font-bold text-teal-700 text-sm">
                          {gig.basicPackage?.price ? `₹${Math.round(gig.basicPackage.price).toLocaleString("en-IN")}` : "—"}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="relative inline-block text-left">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setOpenDropdownId(openDropdownId === gig.id ? null : gig.id);
                              }}
                              className="p-2 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
                              title="Actions"
                            >
                              <MoreHorizontal size={20} className="text-slate-500" />
                            </button>

                            {openDropdownId === gig.id && (
                              <>
                                {/* Transparent overlay to close dropdown */}
                                <div className="fixed inset-0 z-40" onClick={() => setOpenDropdownId(null)} />

                                {/* Dropdown Menu */}
                                <div className={`absolute right-0 w-40 bg-white border border-slate-200 shadow-xl rounded-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100 ${isLast ? 'bottom-full mb-1 origin-bottom-right' : 'top-full mt-1 origin-top-right'}`}>
                                  <Link
                                    href={`/seller/gigs/edit/${gig.id}`}
                                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors w-full text-left"
                                  >
                                    <Edit size={16} className="text-slate-400" />
                                    Edit Gig
                                  </Link>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setGigToDelete(gig);
                                      setOpenDropdownId(null);
                                    }}
                                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                                  >
                                    <Trash2 size={16} className="text-red-400" />
                                    Delete Gig
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="premium-card p-12 text-center shadow-sm">
             <Package size={48} className="text-[#b5b6ba] mx-auto mb-4" />
             <h2 className="text-xl font-bold text-[#404145] mb-2">No Gigs Found</h2>
             <p className="text-sm text-[#74767e] mb-6">You don't have any gigs set up yet. Create your first gig to start selling!</p>
             <Link href="/seller/gigs/new" className="inline-block bg-teal-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-teal-700 transition-colors shadow-sm">
                Create a Gig
             </Link>
          </div>
        )}

      </div>

      {/* Delete Confirmation Modal */}
      {gigToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in-up">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <Trash2 size={20} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Delete Gig?</h3>
            </div>

            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              This action cannot be undone. To permanently delete this gig, please type the gig ID to confirm: <br /><br />
              <strong className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-800 break-all">{gigToDelete.id}</strong>
            </p>

            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 mb-6 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              placeholder="Paste Gig ID here..."
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setGigToDelete(null); setDeleteConfirmText(""); }}
                className="px-5 py-2.5 text-sm text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={deleteConfirmText !== gigToDelete.id || isDeleting}
                onClick={handleDelete}
                className="px-5 py-2.5 text-sm bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors shadow-sm"
              >
                {isDeleting && <Loader2 size={16} className="animate-spin mr-2" />}
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
