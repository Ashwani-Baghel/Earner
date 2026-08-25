"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BlogForm } from "@/components/admin/cms/BlogForm";

export default function CreateBlogPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8 border-b border-slate-200 pb-4">
        <Link 
          href="/super-admin/cms/blogs" 
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-4"
        >
          <ArrowLeft size={16} /> Back to Blogs
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Create New Blog</h1>
        <p className="text-slate-500 mt-1 text-sm">Draft a new article for your users.</p>
      </div>

      <BlogForm />
    </div>
  );
}
