import { Link, router } from "@inertiajs/react";
import { useEffect, useState } from "react";

export default function HeroBanner() {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setOffsetY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden text-white">
      {/* ----------- Mobile Layout ----------- */}
      <div className="block z-1 md:hidden relative min-h-screen">
        <img
          src="/storage/pullup-banner-web-01.jpg"
          alt="Mobile Hero Banner - Print Solutions"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />

        <div className=" relative z-1 flex flex-col items-center justify-center text-center min-h-[700px] px-4">
          <h1 className="text-3xl font-bold drop-shadow-lg">Print Solutions</h1>
          <p className="mt-2 text-white/80 text-sm">
            High-quality banners, flyers & custom prints.
          </p>
         <button
  onClick={() => router.visit(route('shop.search'))}
  className="mt-5 bg-gradient-to-r from-pink-500 to-yellow-400 px-6 py-2 rounded-full font-semibold shadow-md hover:opacity-90"
>
  Browse Products
</button>
        </div>
      </div>

      {/* ----------- Desktop Layout ----------- */}
   <div className="hidden md:flex relative min-h-screen bg-black">
  {/* Image full screen background */}
  <img
    src="/storage/pullup-banner-web-01.jpg"
    alt="Desktop Hero Banner - Print Solutions"
    className="absolute inset-0 w-full h-full object-cover"
  />

  {/* Button overlaid on top of image */}
  <div className="relative z-1 flex items-start justify-start p-24 min-h-screen">
    <button  onClick={() => router.visit(route('shop.search'))} className="bg-gradient-to-r mt-[65px] from-pink-500 to-yellow-400 px-8 py-3 rounded-full font-semibold shadow-lg hover:opacity-90">
      Browse Products
    </button>
  </div>
</div>


    </section>
  );
}
