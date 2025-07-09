import { useState } from "react";
import {
  AiOutlineShoppingCart,
  AiOutlineArrowRight,
  AiOutlineQuestionCircle,
   AiOutlineHeart,
} from "react-icons/ai";
import ProductImage from "../../components/UI/ProductImage";

import { CashOnDelivery } from "../../components/UI/CashOnDelivery";
import ProductDetailsNavbar from "../../components/Header/ProductDetailsNavbar";
import RelatedProductCard from "../../components/UI/RelatedProductCard";
import { NavbarIcons } from "../../components/UI/NavbarIcons";
import light from "../../../public/light.png";
const relatedProducts = [
  {
    _id: "1",
    name: "Comfort Scrub Top",
    originalPrice: 799,
    discountPrice: 499,
    ratings: 4.2,
    images: ["image1.png"],
  },
  {
    _id: "2",
    name: "Classic V-Neck Scrub",
    originalPrice: 899,
    discountPrice: 599,
    ratings: 3.8,
    images: ["image2.png"],
  },
  {
    _id: "3",
    name: "Premium Fit Scrub",
    originalPrice: 999,
    discountPrice: 749,
    ratings: 4.5,
    images: [],
  },
  {
    _id: "4",
    name: "Stylish Scrub Set",
    originalPrice: 1099,
    discountPrice: 849,
    ratings: 5,
    images: ["image4.png"],
  },
  {
    _id: "5",
    name: "Athletic Scrub Top",
    originalPrice: 849,
    discountPrice: 649,
    ratings: 4.0,
    images: ["image5.png"],
  },
];


export default function ProductCard() {
  const [selectedPack, setSelectedPack] = useState("100 Pack");
  const packs = ["100 Pack", "500 Pack", "1000 Pack"];
 const offers = [
    {
      title: "Bank Offers",
      details: "Get 10% off with HDFC Bank debit/credit cards.",
    },
    {
      title: "Partner Offers",
      details: "Flat ₹50 off when you pay via PhonePe.",
    },
    {
      title: "Cashback",
      details: "Get ₹14.00 cashback as Amazon Pay Balance.",
    },
    {
      title: "EMI options",
      details: "No Cost EMI available on orders above ₹3,000.",
    },
  ];

 const [selectedOffer, setSelectedOffer] = useState<{ title: string; details: string } | null>(null);

  return (
    <div className="max-w-6xl mx-auto  font-sans mt-5 ">

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* LEFT 40% */}
        <div className="w-full lg:w-[40%] space-y-4">
          {/* Product Image Placeholder */}
          <div className=" aspect-square rounded flex items-center justify-center">
            <ProductImage/>
          </div>
        </div>

        {/* RIGHT 60% */}
        <div className="w-full lg:w-[60%] space-y-6">
          {/* Top Section: 50/50 */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Product Detail Card */}
            <div
              className="w-full lg:w-1/2 bg-white rounded  p-4 overflow-y-auto space-y-6"
              style={{ height: "534px" }}
            >
              {/* Title & Rating */}
              <div>
                <h2 className="text-2xl font-semibold">Women’s pleated short sleeve scrubs</h2>
                <div className="flex items-center text-sm text-gray-500 mb-2 gap-2">
                  <div style={{ color: "rgba(251, 149, 115, 1)" }}>★★★★☆</div>
                  <span>(128 reviews)</span>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="line-through text-gray-400 text-sm">₹790.00</span>
                      <span className="text-orange-500 text-lg font-bold">₹499.00</span>
                    </div>
                    <span className="text-sm text-gray-600">Pack of 100</span>
                  </div>
                  <div className="flex justify-end">
                    <span className="text-sm text-gray-600">@ ₹4.99/piece</span>
                  </div>
                </div>
              </div>

              {/* Offers */}
              <div className="grid grid-cols-2 gap-4">
              {offers.map((offer) => (
                <div
                  key={offer.title}
                  className="flex flex-col justify-between w-[142px] h-[76px] rounded-[8px] border border-gray-300 px-[10px] py-[10px] text-sm"
                  
                >
                  <strong>{offer.title}</strong>
                  <p className="text-xs text-gray-600 truncate">
                    {offer.details}
                    <p className="text-xs text-blue-600 cursor-pointer"
                    onClick={() => setSelectedOffer(offer)}>
                    2 Offers
                  </p>
                  </p>
                  
                </div>
              ))}
            </div>

      {/* Right Side Toggle Panel */}
      {selectedOffer && (
        <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg border-l border-gray-300 p-5 z-50 transition-all">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">{selectedOffer.title}</h2>
            <button
              className="text-gray-500 hover:text-red-500 text-xl font-bold"
              onClick={() => setSelectedOffer(null)}
            >
              &times;
            </button>
          </div>
          <p className="text-sm text-gray-700">{selectedOffer.details}</p>
        </div>
      )}
              
             <CashOnDelivery/>

          
            </div>

            {/* Purchase Section */}
            <div
              className="w-full lg:w-1/2 bg-gray-50 p-3 rounded shadow-md space-y-4 overflow-y-auto"
              style={{ height: "537px" }}
            >
              {/* Delivery Input */}
              <div>
                <label className="text-sm font-medium">Delivery</label>
                <div className="flex items-center mt-1">
                  <input
                    type="text"
                    placeholder="Pin Code"
                    className="flex-grow border-0 border-b border-gray-400 focus:border-black focus:outline-none py-1 mr-4"
                  />
                  <button className="text-blue-500">Check</button>
                </div>
              </div>

              {/* Pack Options */}
             <div className="space-y-3">
  {packs.map((pack) => (
    <label
      key={pack}
      className={"flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all duration-200 "}
      style={{
        backgroundColor: selectedPack === pack ? "#ECFBFF" : "white",
      }}
    >
      <div className="flex items-start gap-3 w-full">
        <input
          type="radio"
          name="pack"
          value={pack}
          checked={selectedPack === pack}
          onChange={() => setSelectedPack(pack)}
          className="mt-1 w-4 h-4 accent-[#006666]"
        />

        <div className="flex flex-col w-full gap-1">
          <div className="flex justify-between items-center">
            <strong className="text-sm font-medium">{pack}</strong>
            <span
              className="text-white text-[10px] px-4 py-[2px] rounded-full"
              style={{
                backgroundColor: "#006666",
                border: "1px solid #1C647C",
              }}
            >
              You save 10%
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <p className="text-xs text-gray-600">@ ₹4.99/piece</p>
            <p className="text-orange-500 font-semibold text-sm">₹499.00</p>
          </div>
        </div>
      </div>
    </label>
  ))}
</div>

              {/* Bulk Order CTA */}
              <label className="flex justify-between items-center p-3 rounded-xl border border-gray-300 cursor-pointer">
                <AiOutlineQuestionCircle className="text-3xl text-[#1C647C] mb-5" />
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-dark font-medium">For bulk order</p>
                  <p className="text-sm  ">Contact Semarmart Admin</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center ml-4">
                  <AiOutlineArrowRight className="text-blue-600 text-lg" />
                </div>
              </label>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl"
                  style={{
                    backgroundColor: "#ECFBFF",
                    color: "#1C647C",
                    border: "1px solid #1C647C"
                  }}
                >
                  <AiOutlineShoppingCart size={18} />
                  Add to Cart
                </button>
                <button
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl px-3 py-1 text-black"
                  style={{ border: "1px solid #1C647C" }}
                >
                  Add to Wish List
                </button>
              </div>

              <button
                className="w-full text-white py-2 rounded-2xl font-semibold text-lg"
                style={{
                  background: "linear-gradient(270deg, #FCB320 0%, #F04526 100%)"
                }}
              >
                Buy Now
              </button>
            </div>
          </div>

          {/* Bottom Section: Description & More */}
          <div className="space-y-6">
            <select className="w-full px-4 py-2 border rounded text-gray-700 text-base mt-2">
              <option value="product-description">Product Description</option>
            </select>

            <div>
              <h3 className="text-lg font-semibold mb-2">Product Highlights</h3>
              <ul className="space-y-1 text-sm text-gray-700">
  <li className="flex justify-between items-center">
    <span>High-quality fabric for maximum comfort</span>
    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-green-500 text-white text-xs">
      ✓
    </span>
  </li>
  <li className="flex justify-between items-center">
    <span>Ideal for healthcare professionals</span>
    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-green-500 text-white text-xs">
      ✓
    </span>
  </li>
  <li className="flex justify-between items-center">
    <span>Available in various sizes</span>
    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-green-500 text-white text-xs">
      ✓
    </span>
  </li>
</ul>

            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Full Description</h3>
              <p className="text-sm text-gray-700">
                The Women’s Pleated Short Sleeve Scrubs are designed with the healthcare
                professional in mind, offering both style and functionality.
              </p>
            </div>

            <div>
  <h3 className="text-lg font-semibold mb-2">Technical Details</h3>
  <ul className="text-sm text-gray-700 space-y-1">
    <li className="flex justify-between">
      <span className="font-semibold">Material:</span>
      <span>Polyester Blend</span>
    </li>
    <li className="flex justify-between">
      <span className="font-semibold">Brand:</span>
      <span>Semarmart</span>
    </li>
    <li className="flex justify-between">
      <span className="font-semibold">SKU:</span>
      <span>SM12345</span>
    </li>
    <li className="flex justify-between">
      <span className="font-semibold">Warranty:</span>
      <span>1 Year</span>
    </li>
  </ul>
</div>

          <div className="space-y-6">
            <select className="w-full px-4 py-2 border rounded text-gray-700 text-base mt-2">
              <option value="product-description">Customer reviews</option>
            </select>
            </div>
            <div className=" pt-4 mt-6">
              <h3 className="text-lg font-semibold mb-2">Customer reviews</h3>
              <div className="flex gap-4 items-center mb-1">
                <img
                  src="https://i.pravatar.cc/40"
                  alt="avatar"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <div className="font-semibold">Sarah Johnson</div>
                  <div className="text-orange-500">★★★★★</div>
                </div>
              </div>
              <p className="text-sm text-gray-700 mt-1">
                These scrubs are incredibly comfortable and fit perfectly. The fabric is soft and
                breathable, making long shifts much more...
              </p>
            </div>
          </div>
        </div>
      </div>
    <div className="space-y-6 mt-6">
      <hr className="border-t-1 border-gray-400" />
      <hr className="border-t-1 border-gray-400" />
    </div>

    

      <div >
        <h1 className="font-medium text-[17.6px] leading-[100%] align-middle font-['Inter'] mt-6 ml-2">
          Related Products
        </h1>



        <div className="flex  flex-wrap justify-around mt-8">
          {relatedProducts.map((product) => (
            <RelatedProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>


    </div>
  );
}
