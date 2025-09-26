import { useState, useEffect } from "react";
import {
  IoIosArrowDroprightCircle,
  IoIosArrowDropleftCircle,
} from "react-icons/io";

const sliderImages = [
  "/banner_home.png",
  "/banner_Equipment.png",
  "/banner_Consumables.png",
]; // put these inside /public

export default function ImageSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = sliderImages.length;

  function nextSlide() {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }

  function prevSlide() {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 3000); // change every 3 seconds

    return () => clearInterval(timer); // cleanup
  }, [totalSlides]);

  return (
    <section className="overflow-hidden relative">
      <article
        className="flex transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(-${currentSlide * 100}%)`,
        }}
      >
        {sliderImages.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`banner-${index}`}
            className="min-w-full h-[45vh] object-cover"
          />
        ))}
      </article>

      {/* Only show arrows if more than 1 image */}
      {totalSlides > 1 && (
        <article className="absolute inset-0 flex items-center justify-between px-4">
          <button onClick={prevSlide}>
            <IoIosArrowDropleftCircle
              size={40}
              color="white"
              className="drop-shadow-lg"
            />
          </button>
          <button onClick={nextSlide}>
            <IoIosArrowDroprightCircle
              size={40}
              color="white"
              className="drop-shadow-lg"
            />
          </button>
        </article>
      )}

      {/* Slide indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {sliderImages.map((_, index) => (
          <span
            key={index}
            className={`w-3 h-3 rounded-full cursor-pointer ${
              currentSlide === index ? "bg-[#1C647C]" : "bg-gray-300"
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </section>
  );
}
