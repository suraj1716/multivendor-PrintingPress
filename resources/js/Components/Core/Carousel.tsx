import { Image } from "@/types";
import { useState } from "react";

function Carousel({ images }: { images: Image[] }) {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Large Image View */}
      <div className="relative w-full max-w-2xl">
        <img
          src={selectedImage.large}
          alt="Selected Product"
          className="w-full h-[500px] object-cover transition-all duration-300"
        />
        {/* Optional zoom-in effect */}
        <div className="absolute inset-0 bg-black opacity-50 hover:opacity-0 transition-opacity">
          <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
            Hover to Zoom
          </span>
        </div>
      </div>

      {/* Thumbnail Row */}
      <div className="flex items-center gap-4 overflow-x-scroll py-2">
        {images.map((image, i) => (
          <div
            key={image.id}
            className={`cursor-pointer transition-transform duration-300 hover:scale-110 ${
              selectedImage.id === image.id ? "border-2 border-blue-500" : ""
            }`}
            onClick={() => setSelectedImage(image)}
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
