import Link from "next/link";

export function DoableCTA() {
  return (
    <section className="py-20 mb-20 bg-white">
      <div className="container-earner max-w-[85%] mx-auto">
        <div className="bg-[#003912] rounded-xl flex flex-col items-center justify-center py-20 px-8 text-center" style={{ backgroundImage: 'url("https://fiverr-res.cloudinary.com/image/upload/q_auto,f_auto,w_1400,dpr_2.0/v1/attachments/generic_asset/asset/50218c41d277f7d85feeaf3efb4549bd-1599072608124/bg-signup-1400-x1.png")', backgroundPosition: 'center', backgroundSize: 'cover' }}>
          <h2 className="text-white text-4xl md:text-5xl font-bold mb-8">
            Suddenly, it's all so doable.
          </h2>
          <Link
            href="/join"
            className="bg-white text-[#1dbf73] px-8 py-3 rounded-md font-bold text-[15px] hover:bg-gray-100 transition-colors inline-block"
          >
            Join Earner
          </Link>
        </div>
      </div>
    </section>
  );
}
