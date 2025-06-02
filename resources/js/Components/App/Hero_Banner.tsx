import { useEffect, useState } from "react";

/**
 * A futuristic, multi-layer parallax hero section.
 * Drop <HeroCreative /> anywhere in your app.
 */
export default function HeroBanner() {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const onScroll = () => setOffsetY(window.scrollY);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Helper: slower speed for distant layers
  const layer = (factor: number) => ({
    transform: `translateY(${offsetY * factor}px)`,
  });

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0e0b1e] text-white px-6">
      {/* ——— Distant star field ——— */}
      <div
        className="absolute inset-0 bg-[url('/stars.svg')] bg-cover opacity-20"
        style={layer(0.1)}
      />

      {/* ——— Planet ring ——— */}
      <div
        className="absolute -bottom-[40%] left-[50%] w-[150vw] h-[150vw] rounded-full bg-gradient-to-r from-purple-700/40 to-indigo-600/40 blur-3xl"
        style={{ ...layer(0.05), translate: "-50% 0" }}
      />

      {/* ——— Main planet ——— */}
      <div
        className="absolute bottom-[-120px] right-[-160px] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-indigo-600 to-purple-800 shadow-2xl shadow-purple-900/50"
        style={layer(0.15)}
      />

      {/* ——— Rocket illustration ——— */}
      <img
        src="https://raw.githubusercontent.com/tailwindlabs/heroicons/master/src/24/solid/rocket-launch.svg"
        alt="Rocket"
        className="absolute bottom-10 md:bottom-16 right-10 md:right-20 w-24 md:w-32 drop-shadow-lg"
        style={layer(0.3)}
      />

      {/* ——— Central text content ——— */}
      <div className="relative z-10 text-center max-w-xl">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
          Explore&nbsp;
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
            the&nbsp;Future
          </span>
        </h1>
        <p className="mt-4 md:mt-6 text-gray-300 md:text-lg">
          Discover cutting-edge tech insights, inspiration, and tutorials for the
          innovators of tomorrow.
        </p>
        <button className="mt-8 inline-block bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-purple-600 hover:to-indigo-500 transition-all px-8 py-3 rounded-full font-semibold shadow-lg shadow-purple-800/40 hover:shadow-indigo-800/40">
          Get Started
        </button>
      </div>
    </section>
  );
}
