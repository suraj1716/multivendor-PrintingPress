import Hero_Banner from "@/Components/App/Hero_Banner";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { PageProps, PaginationProps, Product } from "@/types";
import { useEffect } from "react";
import AOS from 'aos';
import 'aos/dist/aos.css';
import ProductItem from "@/Components/App/ProductItem";
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation  } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/autoplay'
import 'swiper/css/navigation';
import HeroBanner from "@/Components/App/Hero_Banner";
// other imports...

export default function Home({
  products,
}: PageProps<{ products: PaginationProps<Product> }>) {

    console.log(products.data);

useEffect(() => {
  AOS.init({
    duration: 800,
    once: true,
  });

  // Remove opacity-0 after AOS is ready to prevent flicker
  setTimeout(() => {
    document.querySelectorAll('.aos-init').forEach((el) => {
      el.classList.remove('opacity-0');
    });
  }, 100); // small delay ensures AOS is initialized
}, []);


  return (
    <div className="overflow-x-hidden">
      <AuthenticatedLayout>
        {/* Use Hero_Banner */}
       <HeroBanner />



<main className="w-full mb-10 mt-20">
  {/* Header */}
  <div className="flex items-center justify-between px-20 mb-4">
    <h2 className="text-xl font-semibold text-gray-800">Products</h2>
    <a
      href="/products"
      className="text-sm text-indigo-600 hover:underline font-medium"
    >
      See all products →
    </a>
  </div>

  {products.data.length === 0 ? (
    <div className="text-center py-20 text-gray-500">No products found.</div>
  ) : (
    <div className="relative px-4">
      <Swiper
        modules={[Autoplay, Navigation]}
        autoplay={{
          delay: 2000,
          disableOnInteraction: false,
        }}
        navigation
        loop
        spaceBetween={320}
        breakpoints={{
          320: { slidesPerView: 1.2 },
          480: { slidesPerView: 1.5 },
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
          1280: { slidesPerView: 5 },
        }}
        className="product-carousel"
      >
        {products.data.map((product) => (
          <SwiperSlide key={product.id}>
            <div className="h-full">
              <ProductItem product={product} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )}
</main>






<section className="text-gray-600 body-font">
  <div className="container px-5 py-24 mx-auto">
    <div className="flex flex-wrap -mx-4 -my-8">
      {[1, 2, 3].map((item, i) => (
        <div
          key={i}
          className="py-8 px-4 lg:w-1/3 opacity-0 animate-fadeUp delay-[100ms]"
          style={{ animationDelay: `${i * 200}ms` }}
        >
          <div className="h-full flex items-start hover:scale-[1.02] transition-transform duration-300 ease-in-out">
            <div className="w-12 flex-shrink-0 flex flex-col text-center leading-none">
              <span className="text-gray-500 pb-2 mb-2 border-b-2 border-gray-200">Jul</span>
              <span className="font-medium text-lg text-gray-800 title-font leading-none">18</span>
            </div>
            <div className="flex-grow pl-6">
              <h2 className="tracking-widest text-xs title-font font-medium text-indigo-500 mb-1">CATEGORY</h2>
              <h1 className="title-font text-xl font-medium text-gray-900 mb-3">
                {["The 400 Blows", "Shooting Stars", "Neptune"][i]}
              </h1>
              <p className="leading-relaxed mb-5">
                Photo booth fam kinfolk cold-pressed sriracha leggings jianbing microdosing tousled waistcoat.
              </p>
              <a className="inline-flex items-center cursor-pointer hover:opacity-80 transition-opacity">
                <img
                  alt="blog"
                  src={`https://dummyimage.com/10${3 - i}x10${3 - i}`}
                  className="w-8 h-8 rounded-full flex-shrink-0 object-cover object-center"
                />
                <span className="flex-grow flex flex-col pl-3">
                  <span className="title-font font-medium text-gray-900">
                    {["Alper Kamu", "Holden Caulfield", "Henry Letham"][i]}
                  </span>
                </span>
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>






        {/* Other sections like Product List, Vendors, Testimonials, etc. */}
      </AuthenticatedLayout>
    </div>
  );
}
