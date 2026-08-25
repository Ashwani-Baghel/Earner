import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Blog - Earner",
  description: "Read the latest tips, guides, and news for freelancers and businesses on Earner.",
};

export default async function BlogFeedPage() {
  const blogs = await prisma.blog.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishDate: "desc" }
  });

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">Earner Blog</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover actionable tips, inspiring stories, and comprehensive guides to help you succeed as a freelancer or grow your business.
          </p>
        </div>

        {blogs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-200">
            <p className="text-slate-500 text-lg">No articles published yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <Link 
                href={`/blog/${blog.slug}`} 
                key={blog.id}
                className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group flex flex-col"
              >
                <div className="w-full h-56 bg-slate-200 relative overflow-hidden">
                  {blog.featuredImage ? (
                    <img 
                      src={blog.featuredImage} 
                      alt={blog.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">
                      No Image
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-teal-700 uppercase tracking-wide">
                    {blog.category}
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-teal-600 transition-colors line-clamp-2">
                    {blog.title}
                  </h2>
                  <p className="text-slate-600 text-sm line-clamp-3 mb-6">
                    {blog.seoDescription || "Read more about this topic inside the article."}
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-4">
                    <span className="font-medium text-slate-700">{blog.author}</span>
                    <span>
                      {blog.publishDate 
                        ? new Date(blog.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      }
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
