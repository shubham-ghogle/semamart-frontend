import { useState } from "react";
import {
  IoIosArrowDroprightCircle,
  IoIosArrowDropleftCircle,
} from "react-icons/io";

const sliderImages = ["/banner_Equipment.png"]; // path relative to /public

type ImageSliderProps = {
  image: string;
};

export default function ImageSlider({image}:ImageSliderProps){
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
        {/* {sliderImages.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`banner-${index}`}
            className="min-w-full h-[45vh] object-cover"
          />
          
        ))} */}
        <img
            src={image}
            alt={'banner'}
            className="min-w-full h-[45vh] object-cover"
          />
          
      </article>

      {/* Only show arrows if more than 1 image */}
      {totalSlides > 1 && (
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
      )}
    </section>
  );
}
