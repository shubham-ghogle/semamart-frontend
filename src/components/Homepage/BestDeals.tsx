import React from "react";
import { IoMdCart } from "react-icons/io";
import { CiHeart } from "react-icons/ci";
interface Product {
  id: number;
  image: string;
  name: string;
  originalPrice?: string; // Optional field
  discountedPrice: string;
  discount?: string; // Optional field
}

const products: Product[] = [
  {
    id: 1,
    image: "https://themes.rslahmed.dev/rafcart/assets/images/banner-2.jpg",
    name: "Women's pleated short sleeve scrubs",
    originalPrice: "₹700.00",
    discountedPrice: "₹212.12",
    discount: "-70%",
  },
  {
    id: 2,
    image: "https://themes.rslahmed.dev/rafcart/assets/images/banner-2.jpg",
    name: "SME-SC01- Led Surgical OT Lights",
    discountedPrice: "₹10,000.00",
  },
  {
    id: 3,
    image: "https://themes.rslahmed.dev/rafcart/assets/images/banner-2.jpg",
    name: "SME-RI136- 400 W Surgical Cautery Machine",
    originalPrice: "₹31,898.00",
    discountedPrice: "₹28,999.00",
    discount: "-9%",
  },
  {
    id: 4,
    image: "https://themes.rslahmed.dev/rafcart/assets/images/banner-2.jpg",
    name: "SME-RI164- Metal Scissor",
    originalPrice: "₹231.00",
    discountedPrice: "₹210.00",
    discount: "-9%",
  },
];

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => (
  <div className="border rounded-lg   bg-white shadow hover:shadow-lg transition">
    <div className="relative">
      {product.discount && (
        <span className="absolute top-2 left-2 bg-teal-500 text-white text-xs font-semibold px-2 py-0.5 rounded">
          {product.discount}
        </span>
      )}
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-48 object-cover rounded"
      />
    </div>
    <div className="p-4">
      <h3 className="mt-4 text-gray-800 font-semibold text-base truncate">
        {product.name}
      </h3>
      <div className="flex items-center space-x-2 mt-2">
        {product.originalPrice && (
          <span className="line-through text-gray-500 text-sm">
            {product.originalPrice}
          </span>
        )}
        <span className="text-lg font-bold text-black">
          {product.discountedPrice}
        </span>
      </div>
      <div className="flex flex-col gap-2 mt-4">
        <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded font-medium flex justify-center items-center gap-2">
        <IoMdCart className="text-xl" /><span> Add to Cart</span>
        </button>
        <button className="w-full text-sm text-gray-500 hover:text-teal-600 flex justify-center items-center gap-2">
        <CiHeart className="text-xl"/> <span>Add to Wishlist</span>
        </button>
      </div>
    </div>
  </div>
);

const MostPopularProducts: React.FC = () => {
  return (
    <section className="p-4 ml-0 mr-0 md:ml-20 md:mr-20">
      <div className="flex justify-between items-center">
        <h2
          className="text-2xl font-bold text-gray-800"
          style={{ color: "#1D647E" }}
        >
          Most Popular
        </h2>
        <button
          className="hover:underline font-medium"
          style={{ color: "#1D647E" }}
        >
          View All
        </button>
      </div>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default MostPopularProducts;
