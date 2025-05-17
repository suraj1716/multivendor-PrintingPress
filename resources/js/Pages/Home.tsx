import ProductItem from '@/Components/App/ProductItem';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, PaginationProps, Product } from '@/types';
import { Head } from '@inertiajs/react';

export default function Home({
  products,
}: PageProps<{ products: PaginationProps<Product> }>) {
  return (
    <AuthenticatedLayout>
      <Head title="Welcome" />

      {/* Section 1: Fullscreen Hero Banner */}
    <section className="text-gray-600 body-font">
  <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
    <div className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6 mb-10 md:mb-0">
      <img className="object-cover object-center rounded" alt="hero" src="https://dummyimage.com/720x600"/>
    </div>
    <div className="lg:flex-grow md:w-1/2 lg:pl-24 md:pl-16 flex flex-col md:items-start md:text-left items-center text-center">
      <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900">Before they sold out
        <br className="hidden lg:inline-block"/>readymade gluten
      </h1>
      <p className="mb-8 leading-relaxed">Copper mug try-hard pitchfork pour-over freegan heirloom neutra air plant cold-pressed tacos poke beard tote bag. Heirloom echo park mlkshk tote bag selvage hot chicken authentic tumeric truffaut hexagon try-hard chambray.</p>
      <div className="flex justify-center">
        <button className="inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg">Button</button>
        <button className="ml-4 inline-flex text-gray-700 bg-gray-100 border-0 py-2 px-6 focus:outline-none hover:bg-gray-200 rounded text-lg">Button</button>
      </div>
    </div>
  </div>
</section>

      {/* Section 2: Product List (instead of Featured Carousel) */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.data.map((product: Product) => (
              <ProductItem key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Vendors Logo Carousel */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Vendors</h2>
          {/* Simple horizontal scroll container for logos */}
          <div className="flex space-x-12 overflow-x-auto no-scrollbar py-4">
            {/* Replace these with your actual vendor logos */}
            {[1, 2, 3, 4, 5, 6].map((vendor) => (
              <div key={vendor} className="flex-shrink-0 w-32 h-20 bg-white rounded shadow flex items-center justify-center">
                <span className="text-gray-400 font-semibold">Logo {vendor}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Testimonial */}
      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">What Our Customers Say</h2>
          <blockquote className="italic text-gray-600">
            “This is the best store I've ever used. Their products and customer service are amazing!”
          </blockquote>
          <p className="mt-4 font-semibold">- Jane Doe</p>
        </div>
      </section>

      {/* Section 5: Contact Form */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6 text-center">Get in Touch</h2>
          <form className="space-y-6 max-w-md mx-auto">
            <input
              type="text"
              placeholder="Name"
              className="input input-bordered w-full"
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="input input-bordered w-full"
              required
            />
            <textarea
              placeholder="Message"
              className="textarea textarea-bordered w-full"
              rows={4}
              required
            />
            <button type="submit" className="btn btn-primary w-full">
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-6 mt-12 text-center">
        &copy; {new Date().getFullYear()} Your Company. All rights reserved.
      </footer>
    </AuthenticatedLayout>
  );
}
