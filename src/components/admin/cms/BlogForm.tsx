"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { ImagePlus, Loader2, Save, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

type BlogFormProps = {
  initialData?: any;
  isEdit?: boolean;
};

export function BlogForm({ initialData, isEdit }: BlogFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ogFileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    content: initialData?.content || "",
    featuredImage: initialData?.featuredImage || "",
    author: initialData?.author || "",
    category: initialData?.category || "",
    tags: initialData?.tags?.join(", ") || "",
    status: initialData?.status || "DRAFT",
    publishDate: initialData?.publishDate ? new Date(initialData.publishDate).toISOString().split('T')[0] : "",
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
    ogImage: initialData?.ogImage || "",
  });

  // Load from draft memory if creating a new blog
  useEffect(() => {
    if (!isEdit) {
      const saved = localStorage.getItem("earner_blog_draft");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setFormData((prev) => ({ ...prev, ...parsed }));
        } catch (e) {}
      }
    }
  }, [isEdit]);

  // Save to draft memory whenever formData changes
  useEffect(() => {
    if (!isEdit) {
      localStorage.setItem("earner_blog_draft", JSON.stringify(formData));
    }
  }, [formData, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSlugify = () => {
    if (!formData.title) return;
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setFormData({ ...formData, slug });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: "featuredImage" | "ogImage") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading("Uploading image...");
    try {
      const form = new FormData();
      form.append("file", file);
      
      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });
      
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      
      setFormData({ ...formData, [fieldName]: data.url });
      toast.success("Image uploaded", { id: toastId });
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug || !formData.content || !formData.author || !formData.category) {
      toast.error("Please fill all required fields (Title, Slug, Content, Author, Category).");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tags ? formData.tags.split(",").map((t: string) => t.trim()) : [],
      };

      const url = isEdit ? `/api/admin/blogs/${initialData.id}` : "/api/admin/blogs";
      const method = isEdit ? "PUT" : "POST";

      const token = await user?.getIdToken();

      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save blog");

      toast.success(isEdit ? "Blog updated successfully" : "Blog created successfully");
      if (!isEdit) {
        localStorage.removeItem("earner_blog_draft");
      }
      router.push("/super-admin/cms/blogs");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Basic Info</h2>
            
            <div className="space-y-2">
              <Label htmlFor="title">Post Title *</Label>
              <Input 
                id="title" name="title" value={formData.title} onChange={handleChange}
                placeholder="Enter blog title" 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <Label htmlFor="slug">Slug (URL) *</Label>
                <button type="button" onClick={handleSlugify} className="text-xs text-teal-600 hover:underline">
                  Generate from title
                </button>
              </div>
              <Input 
                id="slug" name="slug" value={formData.slug} onChange={handleChange}
                placeholder="my-blog-post-url" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content (HTML/Text) *</Label>
              <textarea 
                id="content" name="content" value={formData.content} onChange={handleChange}
                placeholder="Write your blog content here..."
                className="w-full min-h-[400px] p-3 border border-slate-300 rounded-lg outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
              <p className="text-xs text-slate-500">You can use standard HTML tags like &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, etc.</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-800 border-b pb-2">SEO Settings</h2>
            
            <div className="space-y-2">
              <Label htmlFor="seoTitle">SEO Title</Label>
              <Input 
                id="seoTitle" name="seoTitle" value={formData.seoTitle} onChange={handleChange}
                placeholder="Title for search engines" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seoDescription">SEO Description</Label>
              <textarea 
                id="seoDescription" name="seoDescription" value={formData.seoDescription} onChange={handleChange}
                placeholder="Meta description for search engines"
                className="w-full h-24 p-3 border border-slate-300 rounded-lg outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-2">
              <Label>OG Image (Social Share Image)</Label>
              {formData.ogImage ? (
                <div className="relative w-full max-w-sm rounded-lg overflow-hidden border border-slate-200">
                  <img src={formData.ogImage} alt="OG" className="w-full h-auto object-cover" />
                  <button type="button" onClick={() => setFormData({ ...formData, ogImage: "" })} className="absolute top-2 right-2 bg-white text-red-500 p-1.5 rounded-full shadow-md hover:bg-red-50">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => ogFileInputRef.current?.click()}
                  className="w-full max-w-sm h-32 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-50 hover:border-teal-500 hover:text-teal-600 transition-colors"
                >
                  <ImagePlus size={24} className="mb-2" />
                  <span className="text-sm font-medium">Upload OG Image</span>
                </div>
              )}
              <input type="file" ref={ogFileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, "ogImage")} />
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Publishing</h2>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select 
                id="status" name="status" value={formData.status} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-medium"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>

            {formData.status === "PUBLISHED" && (
              <div className="space-y-2">
                <Label htmlFor="publishDate">Publish Date</Label>
                <Input 
                  id="publishDate" name="publishDate" type="date" value={formData.publishDate} onChange={handleChange}
                />
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isEdit ? "Update Blog" : "Publish Blog"}
            </Button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Metadata</h2>
            
            <div className="space-y-2">
              <Label htmlFor="author">Author *</Label>
              <Input 
                id="author" name="author" value={formData.author} onChange={handleChange}
                placeholder="e.g. Earner Team" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input 
                id="category" name="category" value={formData.category} onChange={handleChange}
                placeholder="e.g. Freelancing Tips" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input 
                id="tags" name="tags" value={formData.tags} onChange={handleChange}
                placeholder="e.g. guide, tips, remote work" 
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Featured Image</h2>
            
            {formData.featuredImage ? (
              <div className="relative w-full rounded-lg overflow-hidden border border-slate-200">
                <img src={formData.featuredImage} alt="Featured" className="w-full h-auto object-cover" />
                <button type="button" onClick={() => setFormData({ ...formData, featuredImage: "" })} className="absolute top-2 right-2 bg-white text-red-500 p-1.5 rounded-full shadow-md hover:bg-red-50">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-40 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-50 hover:border-teal-500 hover:text-teal-600 transition-colors"
              >
                <ImagePlus size={28} className="mb-2" />
                <span className="text-sm font-medium">Upload Featured Image</span>
              </div>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, "featuredImage")} />
          </div>

        </div>
      </div>
    </form>
  );
}
