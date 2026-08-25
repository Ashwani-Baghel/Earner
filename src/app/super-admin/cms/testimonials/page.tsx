"use client";

import { useState } from "react";
import { SettingsPageTemplate } from "@/components/admin/settings/SettingsPageTemplate";
import { FormSection } from "@/components/admin/settings/FormSection";
import { Input } from "@/components/ui/Input";
import { useCmsSettings } from "@/hooks/useCmsSettings";
import { Plus, Trash2, GripVertical, Star, UploadCloud, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface Testimonial {
  id: string;
  name: string;
  profileImage: string;
  designation: string;
  company: string;
  review: string;
  rating: number;
  featured: boolean;
  displayOrder: number;
  isActive: boolean;
}

const DEFAULT_TESTIMONIALS = {
  title: "Loved by businesses worldwide",
  subtitle: "See what our clients are saying about their experience working with Earner freelancers.",
  items: [
    {
      id: "1",
      name: "Sarah Jenkins",
      profileImage: "https://i.pravatar.cc/150?u=sarah",
      designation: "CEO",
      company: "TechStart Inc",
      review: "Earner has completely transformed how we hire freelancers. The quality of talent is unmatched.",
      rating: 5,
      featured: true,
      displayOrder: 1,
      isActive: true,
    }
  ]
};

export default function TestimonialsCmsPage() {
  const { data, setData, loading, saving, handleSave, setField } = useCmsSettings("TESTIMONIALS", DEFAULT_TESTIMONIALS);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<string | null>(null);

  const testimonials: Testimonial[] = data.items || [];
  const title = data.title || "Loved by businesses worldwide";
  const subtitle = data.subtitle || "See what our clients are saying about their experience working with Earner freelancers.";

  const addTestimonial = () => {
    const newItem: Testimonial = {
      id: Math.random().toString(36).substring(7),
      name: "",
      profileImage: "",
      designation: "",
      company: "",
      review: "",
      rating: 5,
      featured: false,
      displayOrder: testimonials.length + 1,
      isActive: true
    };
    setData((prev: any) => ({ ...prev, items: [...(prev?.items || []), newItem] }));
  };

  const updateTestimonial = (id: string, field: keyof Testimonial, value: any) => {
    setData((prev: any) => ({ ...prev, items: (prev?.items || []).map((t: Testimonial) => t.id === id ? { ...t, [field]: value } : t) }));
  };

  const removeTestimonial = (id: string) => {
    if (confirm("Are you sure you want to remove this testimonial?")) {
      setData((prev: any) => ({ ...prev, items: (prev?.items || []).filter((t: Testimonial) => t.id !== id) }));
    }
  };

  const handleMedia = async (file: File, id: string) => {
    if (!file.type.startsWith("image/")) return toast.error("Only images allowed.");
    setUploadingId(id);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (json.url) updateTestimonial(id, "profileImage", json.url);
      else toast.error(json.error || "Failed to upload.");
    } catch (e) {
      toast.error("Error uploading image.");
    } finally {
      setUploadingId(null);
    }
  };

  const handleDrag = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(id);
    } else if (e.type === "dragleave" || e.type === "drop") {
      setDragActive(null);
    }
  };

  const handleDrop = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleMedia(e.dataTransfer.files[0], id);
    }
  };

  return (
    <SettingsPageTemplate 
      title="Testimonials" 
      loading={loading} 
      saving={saving} 
      onSave={handleSave}
    >
      <div className="mb-6 pb-6 border-b border-slate-100 flex justify-between items-center">
        <p className="text-slate-500 text-sm">
          Manage client reviews and success stories displayed on the frontend.
        </p>
        <button 
          onClick={addTestimonial}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={16} /> Add Testimonial
        </button>
      </div>

      <FormSection title="Section Headers" description="The main title and subtitle that appear above the testimonial slider.">
        <div className="space-y-4 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Section Title</label>
            <Input 
              value={title} 
              onChange={(e) => setField("title", e.target.value)} 
              placeholder="e.g. Loved by businesses worldwide" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Section Subtitle</label>
            <Input 
              value={subtitle} 
              onChange={(e) => setField("subtitle", e.target.value)} 
              placeholder="e.g. See what our clients are saying..." 
            />
          </div>
        </div>
      </FormSection>

      <div className="space-y-6 mt-8">
        {testimonials.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-500">No testimonials created yet.</p>
            <button onClick={addTestimonial} className="mt-3 text-teal-600 font-semibold hover:underline">Create your first testimonial</button>
          </div>
        ) : (
          testimonials.sort((a, b) => a.displayOrder - b.displayOrder).map((t, index) => (
            <FormSection 
              key={t.id}
              title={`Testimonial ${index + 1}`}
              description="Configure testimonial details and status."
            >
              <div className="flex flex-col lg:flex-row gap-6">
                
                {/* Left Controls */}
                <div className="lg:w-1/3 flex flex-col gap-4">
                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <GripVertical className="text-slate-400 cursor-move" size={20} />
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-slate-500 block mb-1">Display Order</label>
                      <Input 
                        type="number" 
                        value={t.displayOrder} 
                        onChange={(e) => updateTestimonial(t.id, "displayOrder", parseInt(e.target.value))} 
                        className="bg-white max-w-[80px]"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={t.isActive} 
                        onChange={(e) => updateTestimonial(t.id, "isActive", e.target.checked)}
                        className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                      />
                      <span className="text-sm font-bold text-slate-700">Active (Visible)</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={t.featured} 
                        onChange={(e) => updateTestimonial(t.id, "featured", e.target.checked)}
                        className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                      />
                      <span className="text-sm font-bold text-slate-700">Featured</span>
                    </label>
                  </div>

                  <button 
                    onClick={() => removeTestimonial(t.id)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-red-200 text-red-600 font-semibold hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>

                {/* Right Column: Details */}
                <div className="lg:w-2/3 space-y-4">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                      <Input value={t.name} onChange={(e) => updateTestimonial(t.id, "name", e.target.value)} placeholder="e.g. John Doe" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Profile Image</label>
                      <div className="flex gap-3">
                        <label 
                          onDragEnter={(e) => handleDrag(e, t.id)}
                          onDragLeave={(e) => handleDrag(e, t.id)}
                          onDragOver={(e) => handleDrag(e, t.id)}
                          onDrop={(e) => handleDrop(e, t.id)}
                          className={`flex-shrink-0 w-10 h-10 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden relative group transition-colors ${
                            dragActive === t.id ? "border-teal-500 bg-teal-50" : "border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleMedia(e.target.files[0], t.id)} />
                          {uploadingId === t.id ? (
                            <Loader2 size={16} className="text-teal-600 animate-spin" />
                          ) : t.profileImage ? (
                            <>
                              <img src={t.profileImage} alt="" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <UploadCloud size={14} className="text-white" />
                              </div>
                            </>
                          ) : (
                            <UploadCloud size={16} className="text-slate-400" />
                          )}
                        </label>
                        <Input 
                          value={t.profileImage} 
                          onChange={(e) => updateTestimonial(t.id, "profileImage", e.target.value)} 
                          placeholder="Or enter image URL..." 
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Designation</label>
                      <Input value={t.designation} onChange={(e) => updateTestimonial(t.id, "designation", e.target.value)} placeholder="e.g. Marketing Director" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                      <Input value={t.company} onChange={(e) => updateTestimonial(t.id, "company", e.target.value)} placeholder="e.g. Acme Corp" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Review</label>
                    <textarea 
                      value={t.review} 
                      onChange={(e) => updateTestimonial(t.id, "review", e.target.value)} 
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm resize-y"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                      Rating <Star size={14} className="text-amber-500 fill-amber-500" />
                    </label>
                    <select 
                      value={t.rating} 
                      onChange={(e) => updateTestimonial(t.id, "rating", parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm bg-white"
                    >
                      {[1, 2, 3, 4, 5].map(r => (
                        <option key={r} value={r}>{r} Stars</option>
                      ))}
                    </select>
                  </div>

                </div>
              </div>
            </FormSection>
          ))
        )}
      </div>
    </SettingsPageTemplate>
  );
}
