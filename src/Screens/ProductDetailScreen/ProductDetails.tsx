import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import {
  AiOutlineShoppingCart,
  AiOutlineArrowRight,
  AiOutlineQuestionCircle,
} from "react-icons/ai";

import { getProductDetail } from "./ProductDetails.HooksUtils";
import { CashOnDelivery } from "../../components/UI/CashOnDelivery";
import offer from "../../../public/offer.png";
import RelatedProducts from "../../components/UI/RelatedProductCard";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";

export default function ProductCard() {
  const { id } = useParams();
  const {
    data: product,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductDetail(id),
  });

  const addToCart = useCartStore((s) => s.addToCart);
  const { addToWishlist, removeFromWishlist, wishlist } = useWishlistStore((s) => s);

  const [selectedPack, setSelectedPack] = useState("100 Pack");
  const [selectedOffer, setSelectedOffer] = useState<{
    title: string;
    details: string;
  } | null>(null);

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

  // ✅ LOADING
  if (isPending || !product) {
    return (
      <div className="text-center mt-20 text-lg text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-2"></div>
        Loading product...
      </div>
    );
  }

  // ✅ ERROR
  if (isError) {
    return (
      <p className="text-center text-red-500 mt-20">Failed to load product.</p>
    );
  }

  const inWishlist = wishlist.some((p) => p._id === product._id);

  const handleAddCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({ product, qty: 1 });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    inWishlist ? removeFromWishlist(product._id) : addToWishlist(product);
  };

  return (
    <div className="max-w-6xl mx-auto font-sans mt-5">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Image */}
        <div className="w-full lg:w-[40%] space-y-4">
          <div className="aspect-square rounded flex items-center justify-center">
            <div className="aspect-w-1 aspect-h-1 w-full max-w-xs">
              {product?.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                  No Image Available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info + Purchase Panel */}
        <div className="w-full lg:w-[60%] space-y-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Product Info */}
            <div className="w-full lg:w-1/2 bg-white rounded p-4 overflow-y-auto space-y-6" style={{ height: "534px" }}>
              <div>
                <h2 className="text-[21.4px] font-semibold font-inter">{product.name}</h2>
                <div className="flex items-center text-sm text-gray-500 mb-2 gap-2">
                  <div style={{ color: "#FB9573" }}>
                    {"★".repeat(product?.ratings || 0)}{"☆".repeat(5 - (product?.ratings || 0))}
                  </div>
                  <span>({product?.reviews?.length || 0} reviews)</span>
                </div>
                <div className="mt-2">
                  <div className="flex justify-end">
                    <span className="text-sm text-gray-600">Pack of 100</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {product.originalPrice && (
                        <span className="line-through text-gray-400 text-sm">
                          ₹{product.originalPrice}
                        </span>
                      )}
                      <span className="text-white px-2 py-1 rounded font-medium text-[24px]" style={{ color: "#FB9573" }}>
                        ₹{product.discountPrice}
                      </span>
                    </div>
                    {product.discountPrice && product.stock && (
                      <span className="text-sm text-gray-600">
                        @ ₹{(product.discountPrice / product.stock).toFixed(2)}/piece
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-[20px]">
                <img src={offer} alt="Offer Icon" className="w-6 h-6" />
                <span className="text-base font-medium">Offers</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {offers.map((offer) => (
                  <div
                    key={offer.title}
                    className="flex flex-col justify-between w-[142px] h-[76px] rounded-[8px] border border-gray-300 px-[10px] py-[10px] text-sm"
                  >
                    <strong>{offer.title}</strong>
                    <div className="text-xs text-gray-600 truncate">
                      {offer.details}
                      <p
                        className="text-xs text-blue-600 cursor-pointer"
                        onClick={() => setSelectedOffer(offer)}
                      >
                        2 Offers
                      </p>
                    </div>
                  </div>
                ))}
              </div>

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

              <CashOnDelivery />
            </div>

            {/* Purchase Panel */}
            <div className="w-full lg:w-1/2 bg-gray-50 p-3 rounded shadow-md space-y-4 overflow-y-auto" style={{ height: "537px" }}>
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

              <div className="space-y-3">
                {packs.map((pack) => (
                  <label
                    key={pack}
                    className="flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all duration-200"
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
                          <span className="text-white text-[10px] px-4 py-[2px] rounded-full" style={{ backgroundColor: "#006666", border: "1px solid #1C647C" }}>
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

              <label className="flex justify-between items-center p-3 rounded-xl border border-gray-300 cursor-pointer">
                <AiOutlineQuestionCircle className="text-3xl text-[#1C647C] mb-5" />
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-dark font-medium">For bulk order</p>
                  <p className="text-sm">Contact Semarmart Admin</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center ml-4">
                  <AiOutlineArrowRight className="text-blue-600 text-lg" />
                </div>
              </label>

              <div className="flex gap-3">
                <button
                  onClick={handleAddCart}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl"
                  style={{ backgroundColor: "#ECFBFF", color: "#1C647C", border: "1px solid #1C647C" }}
                >
                  <AiOutlineShoppingCart size={18} />
                  Add to Cart
                </button>
                <button
                  onClick={handleToggleWishlist}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl px-3 py-1 text-black"
                  style={{ border: "1px solid #1C647C" }}
                >
                  {inWishlist ? "Remove from Wishlist" : "Add to Wish List"}
                </button>
              </div>

              <button
                className="w-full text-white py-2 rounded-2xl font-semibold text-lg"
                style={{ background: "linear-gradient(270deg, #FCB320 0%, #F04526 100%)" }}
              >
                Buy Now
              </button>
            </div>
          </div>

          {/* Bottom Sections */}
          <div className="space-y-6">
            <select className="w-full px-4 py-2 border rounded text-gray-700 text-base mt-2">
              <option value="product-description">Product Description</option>
            </select>

            <div>
              <h3 className="text-lg font-semibold mb-2">Product Highlights</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li className="flex justify-between items-center">
                  <span>{product?.shortdescription || "No highlights available."}</span>
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-green-500 text-white text-xs">✓</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Full Description</h3>
              <p className="text-sm text-gray-700">{product?.description || "No description available."}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Technical Details</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li className="flex justify-between"><span className="font-semibold">Brand:</span> <span>{product?.manufacturerName || "N/A"}</span></li>
                <li className="flex justify-between"><span className="font-semibold">SKU:</span> <span>{product?.sku || "N/A"}</span></li>
                <li className="flex justify-between"><span className="font-semibold">Weight:</span> <span>{product?.weight || "N/A"}</span></li>
                <li className="flex justify-between"><span className="font-semibold">Dimensions:</span> <span>{product?.dimension || "N/A"}</span></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Customer reviews</h3>
              {product?.reviews?.length === 0 ? (
                <p className="text-sm text-gray-500">No reviews yet.</p>
              ) : (
                <div className="flex gap-4 items-center mb-1">
                  <img src="https://i.pravatar.cc/40" alt="avatar" className="w-10 h-10 rounded-full" />
                  <div>
                    <div className="font-semibold">User</div>
                    <div className="text-orange-500">★★★★★</div>
                    <p className="text-sm text-gray-700 mt-1">Review goes here...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="space-y-6 mt-6">
        <hr className="border-t-1 border-gray-400" />
        <h1 className="font-medium text-[17.6px] mt-6 ml-2">Related Products</h1>
        <div className="flex flex-wrap justify-around mt-8">
          {product && (
            <RelatedProducts productType={product.productType} productId={product._id} />
          )}
        </div>
      </div>
    </div>
  );
}
