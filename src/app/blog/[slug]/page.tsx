import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ slug: string }>;
};

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = await prisma.blog.findUnique({
    where: { slug }
  });

  if (!blog || blog.status !== "PUBLISHED") {
    return { title: "Blog Not Found" };
  }

  return {
    title: blog.seoTitle || `${blog.title} - Earner Blog`,
    description: blog.seoDescription || blog.title,
    openGraph: {
      title: blog.seoTitle || blog.title,
      description: blog.seoDescription || blog.title,
      images: blog.ogImage ? [{ url: blog.ogImage }] : (blog.featuredImage ? [{ url: blog.featuredImage }] : []),
    },
  };
}

export default async function SingleBlogPage({ params }: Props) {
  const { slug } = await params;
  
  const blog = await prisma.blog.findUnique({
    where: { slug }
  });

  if (!blog || blog.status !== "PUBLISHED") {
    notFound();
  }

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Header Section */}
      <div className="bg-slate-900 text-white pt-24 pb-32 px-6 relative">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 text-sm font-medium"
          >
            <ArrowLeft size={16} /> Back to Blog
          </Link>
          
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-teal-600/20 text-teal-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {blog.category}
            </span>
            <span className="text-slate-400 text-sm">
              {blog.publishDate 
                ? new Date(blog.publishDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                : new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
              }
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8">
            {blog.title}
          </h1>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-lg font-bold text-slate-300">
              {blog.author.charAt(0)}
            </div>
            <div>
              <p className="font-semibold">{blog.author}</p>
              <p className="text-sm text-slate-400">Author</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {blog.featuredImage && (
        <div className="max-w-5xl mx-auto px-6 -mt-16 relative z-10 mb-16">
          <div className="w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
            <img 
              src={blog.featuredImage} 
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="max-w-3xl mx-auto px-6">
        <div 
          className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-a:text-teal-600 hover:prose-a:text-teal-700"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="mt-16 pt-8 border-t border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
