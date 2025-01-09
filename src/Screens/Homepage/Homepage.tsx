import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../../components/Homepage/Homepage.hooks";
import BestDeals from "../../components/Homepage/BestDeals";
import Furniture from "../../assets/Medical-Equipments.png";
import Instruments from "../../assets/Medical-Instruments.png";
import Miscellaneous from "../../assets/Miscellaneous-Products.png";
import Equipments from "../../assets/Medical-Equipments.png";

export default function Homepage() {
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
      <div className=" w-full ">
        {/* Categories Section */}
        <div className="hidden md:flex justify-center bg-gray-100 w-full">
          {categories.map((category, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center p-2  rounded-full    "
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
        <figure
          className="relative min-h-[35vh] bg-no-repeat bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://themes.rslahmed.dev/rafcart/assets/images/banner-2.jpg)",
          }}
        >
          <div className="absolute inset-0 flex items-center justify-between px-4">
            <button className="rounded-full w-10 h-10 text-xl bg-white shadow hover:shadow-lg focus:outline-none">
              {"<"}
            </button>
            <button className="rounded-full w-10 h-10 text-xl bg-white shadow hover:shadow-lg focus:outline-none">
              {">"}
            </button>
          </div>
        </figure>

        {/* Best Deals Section */}
        <div className="mt-8">
          <BestDeals status={productFetchingStatus} />
        </div>
      </div>
    </section>
  );
}
