import { Image } from "@/types";

interface CarouselProps {
  images: Image[];
  index: number;
  onIndexChange: (index: number) => void;
}

export default function Carousel({ images, index, onIndexChange }: CarouselProps) {
  return (
    <div className="lg:flex lg:items-start gap-4">
      {/* Thumbnails */}
      <div className="mt-2 w-full lg:order-1 lg:w-32 lg:flex-shrink-0">
        <div className="flex flex-row items-start gap-2 lg:flex-col">
          {images.map((image, i) => (
            <button
              key={image.id}
              type="button"
              onClick={() => onIndexChange(i)}
              className={`aspect-square h-20 overflow-hidden rounded-lg border-2 transition-all ${
                index === i ? "border-black" : "border-transparent"
              }`}
            >
              <img
                src={image.thumb}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Main Image */}
      <div className="lg:order-2 lg:ml-5 max-w-xl overflow-hidden rounded-lg relative w-[500px] h-[400px] group">
        <img
          src={images[index]?.large}
          alt="Selected Product"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110 group-hover:cursor-zoom-in"
        />
        <div className="absolute inset-0 flex justify-center items-center">
          <span className="text-white text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Hover to Zoom
          </span>
        </div>
      </div>
    </div>
  );
}
