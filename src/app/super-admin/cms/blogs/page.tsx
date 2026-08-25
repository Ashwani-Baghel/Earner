"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, ExternalLink, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

type Blog = {
  id: string;
  title: string;
  slug: string;
  author: string;
  category: string;
  status: string;
  publishDate: string | null;
  createdAt: string;
};

export default function BlogsCMSPage() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBlogs = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/blogs", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch blogs");
      const data = await res.json();
      setBlogs(data.blogs);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBlogs();
    }
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/admin/blogs/${id}`, { 
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete blog");
      toast.success("Blog deleted successfully");
      fetchBlogs();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Blogs</h1>
          <p className="text-slate-500 mt-1 text-sm">Publish and manage blog articles and categories.</p>
        </div>
        <Link 
          href="/super-admin/cms/blogs/create"
          className="flex items-center gap-2 bg-teal-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
        >
          <Plus size={18} /> Create New Blog
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="animate-spin text-teal-600" size={32} />
          </div>
        ) : blogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No blogs found. Create your first blog post!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                  <th className="p-4 font-semibold">Title</th>
                  <th className="p-4 font-semibold">Author</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Created At</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {blogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-slate-900">{blog.title}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[200px]">/{blog.slug}</p>
                    </td>
                    <td className="p-4 text-sm text-slate-700">{blog.author}</td>
                    <td className="p-4 text-sm text-slate-700">{blog.category}</td>
                    <td className="p-4 text-sm text-slate-700">
                      <div>{new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      <div className="text-xs text-slate-500">{new Date(blog.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        blog.status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {blog.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {blog.status === "PUBLISHED" && (
                          <Link 
                            href={`/blog/${blog.slug}`}
                            target="_blank"
                            className="p-2 text-slate-400 hover:text-teal-600 transition-colors tooltip-trigger"
                            title="View Public Page"
                          >
                            <ExternalLink size={18} />
                          </Link>
                        )}
                        <Link 
                          href={`/super-admin/cms/blogs/${blog.id}`}
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit2 size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(blog.id)}
                          className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
