import re

file_path = "src/components/layout/Navbar.tsx"

with open(file_path, "r") as f:
    content = f.read()

# I will replace everything between `return (` and `onMouseLeave={() => setExploreOpen(false)}`

replacement = """  return (
    <>
      <header className="sticky w-full top-0 z-40 bg-white text-[#404145] shadow-sm border-b border-[#e4e5e7]">
        <div className="w-full px-4 md:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* ── Left: Logo ── */}
            <div className="flex-1 flex items-center justify-start">
              <Link href={user ? dashboardHref : "/"} className="flex-shrink-0">
                <span className="text-3xl font-black tracking-tighter leading-none text-[#404145]">
                  Earner<span className="text-[#1dbf73]">.</span>
                </span>
              </Link>
            </div>

            {/* ── Center: Seller Nav or Buyer Search ── */}
            <div className="flex-shrink-0 flex justify-center">
              {isSellerView ? (
                <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-[#74767e]">
                  <Link href="/seller/dashboard" className="hover:text-[#1dbf73] transition-colors">Dashboard</Link>
                  
                  <div className="relative group cursor-pointer py-4">
                    <div className="flex items-center gap-1 hover:text-[#1dbf73] transition-colors">
                      My Business <ChevronDown size={13} className="group-hover:rotate-180 transition-transform"/>
                    </div>
                    <div className="absolute top-full left-0 bg-white border border-[#e4e5e7] shadow-xl rounded-lg py-2 w-48 hidden group-hover:block z-50 text-[#404145] font-medium">
                      <Link href="/orders" className="block px-4 py-2 hover:bg-[#f5f5f5]">Orders</Link>
                      <Link href="/seller/gigs" className="block px-4 py-2 hover:bg-[#f5f5f5]">Gigs</Link>
                      <Link href="/seller/dashboard" className="block px-4 py-2 hover:bg-[#f5f5f5]">Earnings</Link>
                    </div>
                  </div>

                  <div className="relative group cursor-pointer py-4">
                    <div className="flex items-center gap-1 hover:text-[#1dbf73] transition-colors">
                      Growth & Marketing <ChevronDown size={13} className="group-hover:rotate-180 transition-transform"/>
                    </div>
                    <div className="absolute top-full left-0 bg-white border border-[#e4e5e7] shadow-xl rounded-lg py-2 w-48 hidden group-hover:block z-50 text-[#404145] font-medium">
                      <Link href="/seller/dashboard" className="block px-4 py-2 hover:bg-[#f5f5f5]">Scale Your Business</Link>
                      <Link href="/seller/dashboard" className="block px-4 py-2 hover:bg-[#f5f5f5]">Contacts</Link>
                    </div>
                  </div>

                  <div className="relative group cursor-pointer py-4">
                    <div className="flex items-center gap-1 hover:text-[#1dbf73] transition-colors">
                      Analytics <ChevronDown size={13} className="group-hover:rotate-180 transition-transform"/>
                    </div>
                    <div className="absolute top-full left-0 bg-white border border-[#e4e5e7] shadow-xl rounded-lg py-2 w-48 hidden group-hover:block z-50 text-[#404145] font-medium">
                      <Link href="/seller/dashboard" className="block px-4 py-2 hover:bg-[#f5f5f5]">Overview</Link>
                      <Link href="/seller/dashboard" className="block px-4 py-2 hover:bg-[#f5f5f5]">Repeat Business</Link>
                    </div>
                  </div>
                </nav>
              ) : (
                <div className="hidden md:flex w-[400px] lg:w-[500px]">
                  <form onSubmit={handleSearch} className="flex w-full border border-[#c5c6c9] rounded-md overflow-hidden focus-within:border-[#404145] bg-white transition-colors" style={{ height: '40px' }}>
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="What service are you looking for today?"
                      className="flex-1 px-4 text-sm text-[#404145] bg-transparent outline-none placeholder-[#74767e]"
                    />
                    <button
                      type="submit"
                      className="bg-[#222325] w-12 flex items-center justify-center hover:bg-[#404145] transition-colors"
                    >
                      <Search size={16} color="white" />
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* ── Right Side: Navigation & Profile ── */}
            <div className="flex-1 flex justify-end">
              <div className="hidden lg:flex items-center gap-6 text-base font-semibold text-[#74767e]">
                
                {!isSellerView && (
                  <>
                    <div className="relative group">
                      <button className="flex items-center gap-1 transition-colors py-4 hover:text-[#1dbf73]">
                        Earner Pro <ChevronDown size={13} />
                      </button>
                    </div>

                    <div
                      className="relative"
                      onMouseEnter={() => setExploreOpen(true)}
                      onMouseLeave={() => setExploreOpen(false)}"""

# Use regex to replace everything between `  return (` and `                      onMouseLeave={() => setExploreOpen(false)}`
pattern = re.compile(r"  return \(\s*<>.*?onMouseLeave=\{\(\) => setExploreOpen\(false\)\}", re.DOTALL)
new_content = pattern.sub(replacement, content)

with open(file_path, "w") as f:
    f.write(new_content)

print("Patch applied.")
