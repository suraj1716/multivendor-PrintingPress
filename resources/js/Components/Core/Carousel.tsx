import { Image } from "@/types";

interface CarouselProps {
  images: Image[];
  index: number;
  onIndexChange: (index: number) => void;
}

function Carousel({ images, index, onIndexChange }: CarouselProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Large Image View */}
      <div className="relative w-full max-w-2xl overflow-hidden">
        {/* Main Image with Zoom-In Effect */}
        <div className="w-full h-[500px] relative group">
          <img
            src={images[index]?.large}
            alt="Selected Product"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-125 group-hover:cursor-zoom-in"
          />
          {/* Hover Effect - Zoom Tooltip */}
          <div className="absolute inset-0 flex justify-center items-center">
            <span
              className="text-white text-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              Hover to Zoom
            </span>
          </div>
        </div>
      </div>

      {/* Thumbnail Row */}
      <div className="flex items-center gap-4 overflow-x-scroll py-2">
        {images.map((image, i) => (
          <div
            key={image.id}
            className={`cursor-pointer transition-transform duration-300 hover:scale-110 ${
              index === i ? "border-2 border-blue-500" : ""
            }`}
            onClick={() => onIndexChange(i)}
          >
            <img
              src={image.thumb}
              alt=""
              className="w-[40px] h-[40px] object-cover border hover:border-blue-500 transition-all duration-300"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Carousel;
