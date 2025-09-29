import { useState, useEffect } from "react";
import {
  IoIosArrowDroprightCircle,
  IoIosArrowDropleftCircle,
} from "react-icons/io";

const sliderImages = [
  "/Cover Photo/E1-1.png",
  "/Cover Photo/E1-2.png",
  "/Cover Photo/E1-4.png",

  "/Cover Photo/E1-3.png",
  "/Cover Photo/Dental-Consumables.png",
  "/Cover Photo/Infection-Control-Consumables.png",
  "/Cover Photo/Laboratory-Consumables.png",
  "/Cover Photo/Pharma-2.png",
  "/Cover Photo/Pharma-4.png",
  "/Cover Photo/Radiology-Consumables.png",
  "/Cover Photo/Refurbished-Imaging-Equipment.png",
  "/Cover Photo/Refurbished-Laboratory-Equipment.png",
  "/Cover Photo/Refurbished-Patient-Monitors.png",
  "/Cover Photo/Refurbished-Surgical-Instruments.png",
  "/Cover Photo/Surgical-Consumables.png",
  "/Cover Photo/Wound-Care-Supplies.png",

];

export default function ImageSliderHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = sliderImages.length;

  function nextSlide() {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }

  function prevSlide() {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }

  // ✅ Auto-slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 3000); // 3s interval
    return () => clearInterval(timer);
  }, [totalSlides]);

  return (
    <section className="overflow-hidden relative">
      {/* Slides */}
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

      {/* Arrows */}
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

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {sliderImages.map((_, index) => (
          <span
            key={index}
            className={`w-3 h-3 rounded-full cursor-pointer ${currentSlide === index ? "bg-[#1C647C]" : "bg-gray-300"
              }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </section>
  );
}
