import Link from "next/link";
import Image from "next/image";

const GUIDES = [
  {
    title: "Start a business from scratch",
    desc: "From idea to launch, build your business with a clear vision.",
    img: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80"
  },
  {
    title: "Building a professional brand",
    desc: "How to create a brand identity that communicates value and standards.",
    img: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80"
  },
  {
    title: "Digital marketing made easy",
    desc: "Learn the secrets to growing your brand online properly and easily.",
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80"
  }
];

export function GuidesSection() {
  return (
    <section className="py-24 bg-white">
      <div className="container-fiverr max-w-6xl">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-[#404145]">
            Guides to help you grow
          </h2>
          <Link href="/guides" className="text-[#404145] font-semibold hover:underline hidden md:block">
            See more guides
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {GUIDES.map((guide, idx) => (
            <div key={idx} className="flex flex-col group cursor-pointer h-full">
              <div className="relative w-full aspect-[4/3] rounded-md overflow-hidden mb-4 bg-gray-100">
                <Image
                  src={guide.img}
                  alt={guide.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
              </div>
              <h3 className="text-xl font-bold text-[#404145] mb-2">{guide.title}</h3>
              <p className="text-[#62646a] text-sm leading-relaxed">{guide.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
