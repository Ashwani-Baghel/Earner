"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { BlogForm } from "@/components/admin/cms/BlogForm";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

export default function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch(`/api/admin/blogs/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch blog details");
        const data = await res.json();
        setInitialData(data.blog);
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (id && user) fetchBlog();
  }, [id, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="animate-spin text-teal-600" size={32} />
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="p-8 text-center text-slate-500">
        Blog not found.
        <br />
        <Link href="/super-admin/cms/blogs" className="text-teal-600 hover:underline mt-4 inline-block">
          Return to Blogs
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8 border-b border-slate-200 pb-4">
        <Link 
          href="/super-admin/cms/blogs" 
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-4"
        >
          <ArrowLeft size={16} /> Back to Blogs
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Edit Blog</h1>
        <p className="text-slate-500 mt-1 text-sm">Update your article content and settings.</p>
      </div>

      <BlogForm initialData={initialData} isEdit={true} />
    </div>
  );
}
