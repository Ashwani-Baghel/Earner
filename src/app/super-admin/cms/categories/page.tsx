"use client";

import { useEffect, useState } from "react";
import { Folder, Plus, Trash2, Loader2, Save, X, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function CategoriesCMS() {
  const router = useRouter();
  const { user } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modals state
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [subModalOpen, setSubModalOpen] = useState(false);
  
  // Form state
  const [activeCategoryId, setActiveCategoryId] = useState<string>("");
  const [name, setName] = useState("");
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    if (user) fetchCategories();
  }, [user]);

  const fetchCategories = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/cms/categories", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCategories(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const submitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !user) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    
    setSaving(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/cms/categories", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ type: "category", name, slug })
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchCategories();
      router.refresh();
      setCatModalOpen(false);
      setName("");
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const submitSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !activeCategoryId || !user) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    
    setSaving(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/cms/categories", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ type: "subcategory", categoryId: activeCategoryId, name, slug, groupName })
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchCategories();
      router.refresh();
      setSubModalOpen(false);
      setName("");
      setGroupName("");
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id: string, type: "category" | "subcategory") => {
    if (!confirm("Are you sure you want to delete this?")) return;
    if (!user) return;
    setSaving(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/cms/categories?id=${id}&type=${type}`, { 
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchCategories();
      router.refresh();
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-teal-600" /></div>;
  }

  // Find existing groups for active category to populate datalist
  const activeCat = categories.find(c => c.id === activeCategoryId);
  const existingGroups = Array.from(new Set(
    (activeCat?.subcategories || []).map((s: any) => s.groupName).filter(Boolean)
  ));

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Categories CMS</h1>
          <p className="text-slate-500 mt-1">Manage the platform's primary categories and subcategories.</p>
        </div>
        <button
          onClick={() => { setName(""); setCatModalOpen(true); }}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="space-y-6">
        {categories.map((cat) => {
          // Group subcategories by groupName
          const groupedSubs: Record<string, any[]> = {};
          cat.subcategories?.forEach((sub: any) => {
            const group = sub.groupName || "Ungrouped";
            if (!groupedSubs[group]) groupedSubs[group] = [];
            groupedSubs[group].push(sub);
          });

          return (
            <div key={cat.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Folder className="text-teal-600" />
                  <h3 className="font-bold text-slate-900 text-lg">{cat.name}</h3>
                  <span className="text-xs text-slate-400 font-mono">{cat.slug}</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { 
                      setActiveCategoryId(cat.id); 
                      setName(""); 
                      setGroupName(""); 
                      setSubModalOpen(true); 
                    }} 
                    className="text-xs font-bold text-teal-600 hover:bg-teal-50 px-3 py-1.5 rounded-md flex items-center gap-1 border border-teal-100"
                  >
                    <Plus size={14} /> Subcategory
                  </button>
                  <button onClick={() => deleteItem(cat.id, "category")} className="text-slate-400 hover:text-red-600 p-2 rounded-md hover:bg-red-50 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              {cat.subcategories?.length > 0 && (
                <div className="p-6 space-y-6">
                  {Object.entries(groupedSubs).map(([group, subs]) => (
                    <div key={group} className="space-y-3">
                      {group !== "Ungrouped" && (
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <Settings2 size={14} className="text-slate-400" />
                          {group}
                        </h4>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {subs.map((sub: any) => (
                          <div key={sub.id} className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3 rounded-lg group hover:border-teal-200 transition-colors">
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{sub.name}</p>
                              <p className="text-xs text-slate-400">{sub.slug}</p>
                            </div>
                            <button 
                              onClick={() => deleteItem(sub.id, "subcategory")}
                              className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Category Modal */}
      {catModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Add Category</h2>
              <button onClick={() => setCatModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={submitCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                  placeholder="e.g. Programming & Tech"
                />
              </div>
              <button disabled={saving} type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2">
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save Category
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Subcategory Modal */}
      {subModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Add Subcategory</h2>
              <button onClick={() => setSubModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={submitSubcategory} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Heading / Group (Optional)</label>
                <input
                  type="text"
                  list="existing-groups"
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                  placeholder="e.g. Website Development"
                />
                <datalist id="existing-groups">
                  {existingGroups.map((g: any, i) => (
                    <option key={i} value={g} />
                  ))}
                </datalist>
                <p className="text-xs text-slate-500 mt-1">Select an existing heading or type a new one.</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Subcategory Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                  placeholder="e.g. Custom Websites"
                />
              </div>
              <button disabled={saving} type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2">
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save Subcategory
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
