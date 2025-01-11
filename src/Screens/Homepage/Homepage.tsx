import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../../components/Homepage/Homepage.hooks";

import Mostpopular from "../../components/Homepage/Mostpopular";
import BestSeller from "../../components/Homepage/BestSeller";
import RecentItem from "../../components/Homepage/RecentItem";

import Furniture from "../../assets/Medical-Equipments.png";
import Instruments from "../../assets/Medical-Instruments.png";
import Miscellaneous from "../../assets/Miscellaneous-Products.png";
import Equipments from "../../assets/Medical-Equipments.png";

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

export default function Homepage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = sliderImages.length;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const { status: productFetchingStatus } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    staleTime: Infinity,
  });

  const categories = [
    { name: "Medical Furniture", icon: Furniture },
    { name: "Medical Instruments", icon: Instruments },
    { name: "Medical Equipment's", icon: Equipments },
    { name: "Miscellaneous Products", icon: Miscellaneous },
  ];

  return (
    <section>
      <div className="w-full">
        {/* Categories Section */}
        <div className="hidden md:flex justify-center bg-gray-100 w-full">
          {categories.map((category, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center p-2 rounded-full"
            >
              <img
                src={category.icon}
                alt={category.name}
                className="w-20 h-20 object-contain cursor-pointer"
              />
              <p className="mt-2 text-center font-semibold text-sm">
                {category.name}
              </p>
            </div>
          ))}
        </div>

        {/* Image Slider Section */}
        <div className="overflow-hidden relative">
          <div
            className="flex transition-transform duration-500"
            style={{
              transform: `translateX(-${currentSlide * 100}%)`,
            }}
          >
            {sliderImages.map((image, index) => (
              <figure
                key={index}
                className="min-w-full min-h-[35vh] bg-no-repeat bg-cover bg-center"
                style={{
                  backgroundImage: `url(${image})`,
                }}
              ></figure>
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-between px-4">
            <button
              onClick={prevSlide}
              className="rounded-full w-10 h-10 text-xl bg-white shadow hover:shadow-lg focus:outline-none"
            >
              {"<"}
            </button>
            <button
              onClick={nextSlide}
              className="rounded-full w-10 h-10 text-xl bg-white shadow hover:shadow-lg focus:outline-none"
            >
              {">"}
            </button>
          </div>
        </div>

        {/* Best Deals Section */}
        <div className="mt-8">
          <Mostpopular />
          <BestSeller />
          <RecentItem />
        </div>
      </div>
    </section>
  );
}
