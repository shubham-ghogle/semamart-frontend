import { useState } from "react";
import {
  IoIosArrowDroprightCircle,
  IoIosArrowDropleftCircle,
} from "react-icons/io";

const sliderImages = [
  "https://themes.rslahmed.dev/rafcart/assets/images/banner-2.jpg",
  "https://themes.rslahmed.dev/rafcart/assets/images/banner-1.jpg",
  "https://themes.rslahmed.dev/rafcart/assets/images/banner-3.jpg",
  "https://themes.rslahmed.dev/rafcart/assets/images/category-1.jpg",
  "https://themes.rslahmed.dev/rafcart/assets/images/banner-2.jpg",
  "https://themes.rslahmed.dev/rafcart/assets/images/banner-1.jpg",
  "https://themes.rslahmed.dev/rafcart/assets/images/banner-3.jpg",
  "https://themes.rslahmed.dev/rafcart/assets/images/category-1.jpg",
  "https://themes.rslahmed.dev/rafcart/assets/images/banner-2.jpg",
  "https://themes.rslahmed.dev/rafcart/assets/images/banner-1.jpg",
  "https://themes.rslahmed.dev/rafcart/assets/images/banner-3.jpg",
  "https://themes.rslahmed.dev/rafcart/assets/images/category-1.jpg",
];

export default function ImageSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = sliderImages.length;

  function nextSlide() {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }

  function prevSlide() {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }

  return (
    <section className="overflow-hidden relative">
      <article
        className="flex transition-transform duration-500"
        style={{
          transform: `translateX(-${currentSlide * 100}%)`,
        }}
      >
        {sliderImages.map((image, index) => (
          <figure
            key={index}
            className="min-w-full min-h-[45vh] bg-no-repeat bg-cover bg-center"
            style={{
              backgroundImage: `url(${image})`,
            }}
          ></figure>
        ))}
      </article>
      <article className="absolute inset-0 flex items-center justify-between px-4">
        <button onClick={prevSlide}>
          <IoIosArrowDropleftCircle
            size={40}
            color="white"
            className="drop-shadow-lg"
            strokeWidth={1}
            stroke="black"
          />
        </button>
        <button onClick={nextSlide}>
          <IoIosArrowDroprightCircle
            size={40}
            color="white"
            className="drop-shadow-lg"
            strokeWidth={1}
            stroke="black"
          />
        </button>
      </article>
    </section>
  );
}
