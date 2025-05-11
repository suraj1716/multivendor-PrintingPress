import { Image } from "@/types";

interface CarouselProps {
  images: Image[];
  index: number;
  onIndexChange: (index: number) => void;
}

function Carousel({ images, index, onIndexChange }: CarouselProps) {
  return (
    <div className="flex justify-center items-start gap-4">
      {/* Vertical Thumbnails on Left */}
      <div className="flex flex-col gap-3">
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
              className="w-[50px] h-[50px] object-cover border hover:border-blue-500 transition-all duration-300"
            />
          </div>
        ))}
      </div>

      {/* Main Image */}
      <div className="relative w-[500px] h-[400px] overflow-hidden">
        <div className="w-full h-full relative group">
          <img
            src={images[index]?.large}
            alt="Selected Product"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 group-hover:cursor-zoom-in"
          />
          <div className="absolute inset-0 flex justify-center items-center">
            <span className="text-white text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Hover to Zoom
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}



export default Carousel;
