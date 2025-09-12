import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import {
  AiOutlineShoppingCart,
  AiOutlineArrowRight,
  AiOutlineQuestionCircle,
  AiOutlineCheckCircle,
} from "react-icons/ai";

import { getProductDetail } from "./ProductDetails.HooksUtils";
import { CashOnDelivery } from "../../components/UIComponents/CashOnDelivery";
import offer from "../../../public/offer.png";
import RelatedProducts from "../../components/UIComponents/RelatedProductCard";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";

// Fixed images for demo showcase (public folder)
const demoImages = [
  "/MedicalImages/imagea.png",
  "/MedicalImages/imageb.png",
  "/MedicalImages/imagec.png",
  "/MedicalImages/imaged.jpg",
  "/MedicalImages/imaged.png",
  "/MedicalImages/imagef.png",
];

const PLACEHOLDER = "/placeholder.png";

/** Helper to convert backend filename to public URL:
 * - If value looks like a filename (no leading slash), produce `/images/<value>`
 * - If already an absolute path (starts with `/` or `http`), keep it.
 */
function toImageUrl(value?: string | null) {
  if (!value) return undefined;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/")) {
    // Already a root relative path
    return value;
  }
  return `/images/${value}`;
}

/** Helper for video url */
function toVideoUrl(value?: string | null) {
  if (!value) return undefined;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/")) return value;
  return `/videos/${value}`;
}

export default function ProductCard() {
  const { id } = useParams();

  // keep name isPending like original by mapping isLoading -> isPending
  const {
    data: product,
    isLoading: isPending,
    isError,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductDetail(id as string),
  });

  // Image/gallery state
  const [activeIdx, setActiveIdx] = useState(0);
  const [animating, setAnimating] = useState(false);

  // For dynamic height calculation
  const infoRef = useRef<HTMLDivElement | null>(null);
  const [imgSectionHeight, setImgSectionHeight] = useState(600);

  // Build media gallery: images (product.images), then variant thumbnails fallback, then demo, then add video if exists
  const productMedia: { type: "image" | "video"; src: string }[] = (() => {
    if (!product) {
      return demoImages.map((d) => ({ type: "image" as const, src: d }));
    }

    const media: { type: "image" | "video"; src: string }[] = [];

    // product.images preferred
    if (Array.isArray((product as any).images) && (product as any).images.length > 0) {
      const mapped = (product as any).images
        .map((img: string) => toImageUrl(img))
        .filter(Boolean) as string[];
      mapped.forEach((src) => media.push({ type: "image", src }));
    }

    // fallback: variant thumbnails
    if (media.length === 0 && Array.isArray((product as any).variants)) {
      const mapped = (product as any).variants
        .map((v: any) => toImageUrl(v?.thumbnail))
        .filter(Boolean) as string[];
      mapped.forEach((src) => media.push({ type: "image", src }));
    }

    // fallback demo
    if (media.length === 0) {
      demoImages.forEach((d) => media.push({ type: "image", src: d }));
    }

    // add product video if exists (append at end)
    const shortVideo = (product as any)?.shortVideo;
    const videoUrl = toVideoUrl(shortVideo);
    if (videoUrl) {
      media.push({ type: "video", src: videoUrl });
    }

    return media;
  })();

  useEffect(() => {
    if (infoRef.current) {
      setImgSectionHeight(infoRef.current.offsetHeight);
    }
    // make sure activeIdx is valid when productMedia length changes
    if (activeIdx >= productMedia.length) {
      setActiveIdx(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, productMedia.length]);

  const handleThumbClick = (idx: number) => {
    if (activeIdx !== idx) {
      setAnimating(true);
      setTimeout(() => {
        setActiveIdx(idx);
        setAnimating(false);
      }, 250);
    }
  };

  const addToCart = useCartStore((s) => s.addToCart);
  const { addToWishlist, removeFromWishlist, wishlist } = useWishlistStore((s) => s);

  const [selectedPack, setSelectedPack] = useState("100 Pack");
  const [selectedOffer, setSelectedOffer] = useState<{ title: string; details: string } | null>(null);
  const [cartAnimation, setCartAnimation] = useState(false);

  const packs = ["100 Pack", "500 Pack", "1000 Pack"];
  const offers = [
    { title: "Bank Offers", details: "Get 10% off with HDFC Bank debit/credit cards." },
    { title: "Partner Offers", details: "Flat ₹50 off when you pay via PhonePe." },
    { title: "Cashback", details: "Get ₹14.00 cashback as Amazon Pay Balance." },
    { title: "EMI options", details: "No Cost EMI available on orders above ₹3,000." },
  ];

  // ✅ LOADING
  if (isPending || !product) {
    return (
      <div className="flex items-center justify-center h-[80vh] w-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1C647C] mr-4"></div>
        <span className="text-xl text-gray-500">Loading product...</span>
      </div>
    );
  }

  // ✅ ERROR
  if (isError) {
    return <p className="text-center text-red-500 mt-20">Failed to load product.</p>;
  }

  const inWishlist = wishlist.some((p: any) => p._id === product._id);

  const handleAddCart = (e: React.MouseEvent) => {
    e.preventDefault();
    // keep original behaviour: add product with qty 1
    addToCart({ product, qty: 1 });
    setCartAnimation(true);
    setTimeout(() => setCartAnimation(false), 1500);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    inWishlist ? removeFromWishlist(product._id) : addToWishlist(product);
  };

  // Attempt to derive selectedVariant:
  // 1) If the active media matches a variant.thumbnail, select that variant
  // 2) Otherwise fallback to first variant (if exists)
  const selectedVariant = (() => {
    const variants = (product as any).variants;
    if (Array.isArray(variants) && variants.length > 0) {
      const activeMedia = productMedia[activeIdx];
      if (activeMedia && activeMedia.type === "image") {
        const match = variants.find((v: any) => {
          const thumb = toImageUrl(v?.thumbnail);
          return thumb === activeMedia.src;
        });
        if (match) return match;
      }
      return variants[0];
    }
    return undefined;
  })();

  // Price display falls back to product top-level fields if variants not present
  const displayOriginalPrice = selectedVariant?.originalPrice ?? (product as any).originalPrice;
  const displayDiscountPrice = selectedVariant?.discountPrice ?? (product as any).discountPrice;
  const displayStock = selectedVariant?.stock ?? (product as any).stock;

  return (
    // prevent horizontal overflow site-wide for this page
    <div className="w-full min-h-screen bg-white font-sans pt-8 pb-12 px-0 overflow-x-hidden">
      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-[1600px] mx-auto box-border px-4">
        {/* Image & Media Section */}
        <div
          className="w-full lg:w-[40%] flex flex-col items-center justify-start"
          style={{
            minHeight: imgSectionHeight,
            alignSelf: "flex-start",
            paddingTop: "32px",
            paddingBottom: "32px",
          }}
        >
          <div className="w-full flex flex-col items-center">
            {/* Big Media with animation */}
            <div
              className="w-full max-w-[480px] h-[480px] rounded-xl bg-gray-50 flex items-center justify-center shadow-lg overflow-hidden relative mb-6"
              style={{
                minHeight: "480px",
                maxHeight: "600px",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              {productMedia[activeIdx]?.type === "image" ? (
                <img
                  src={productMedia[activeIdx].src}
                  alt={`${product.name} - ${activeIdx + 1}`}
                  className={`object-cover w-full h-full rounded-xl border border-gray-200 shadow transition-all duration-300 ${
                    animating ? "opacity-0 scale-95" : "opacity-100 scale-100"
                  }`}
                  style={{ position: "absolute", top: 0, left: 0 }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
                  }}
                />
              ) : (
                <video
                  src={productMedia[activeIdx].src}
                  controls
                  className="object-contain w-full h-full rounded-xl border border-gray-200 shadow bg-black"
                  style={{ position: "absolute", top: 0, left: 0 }}
                />
              )}
            </div>

            {/* Thumbnails — horizontally scrollable to avoid pushing layout */}
            <div className="flex gap-4 mt-2 justify-center w-full overflow-x-auto px-2">
              {productMedia.map((m, idx) => (
                <button
                  key={idx}
                  onClick={() => handleThumbClick(idx)}
                  className={`flex-none w-20 h-20 rounded-lg border-2 transition-all duration-200 overflow-hidden shadow ${activeIdx === idx ? "border-[#1C647C] scale-105" : "border-gray-200 opacity-80 hover:opacity-100"
                    }`}
                  style={{ background: "#fff", position: "relative" }}
                >
                  {m.type === "image" ? (
                    <img
                      src={m.src ?? PLACEHOLDER}
                      alt={`Thumbnail ${idx + 1}`}
                      className="object-cover w-full h-full"
                      onError={(e) => ((e.currentTarget as HTMLImageElement).src = PLACEHOLDER)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-black text-white text-xs relative">
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" className="opacity-90">
                          <path d="M5 3v18l15-9L5 3z" fill="currentColor"></path>
                        </svg>
                      </div>
                      <div className="text-[10px] z-10">Video</div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Info + Purchase Panel */}
        <div className="w-full lg:w-[60%] flex flex-col gap-8">
          <div className="flex flex-col lg:flex-row gap-8 w-full">
            {/* Product Info */}
            <div
              ref={infoRef}
              className="w-full lg:w-1/2 bg-white rounded-lg p-6 shadow-lg overflow-y-auto space-y-6"
              style={{ minHeight: "540px", maxHeight: "700px" }}
            >
              <div>
                <h2 className="text-2xl font-bold font-inter text-[#1C647C]">{(product as any).name}</h2>
                <div className="flex items-center text-base text-gray-500 mb-2 gap-2">
                  <div style={{ color: "#FB9573" }}>
                    {"★".repeat(Math.round((product as any).ratings || 0))}
                    {"☆".repeat(5 - Math.round((product as any).ratings || 0))}
                  </div>
                  <span>({(product as any)?.reviews?.length || 0} reviews)</span>
                </div>

                <div className="mt-2">
                  <div className="flex justify-end">
                    <span className="text-sm text-gray-600">{selectedVariant?.size ?? selectedPack}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {displayOriginalPrice ? (
                        <span className="line-through text-gray-400 text-base">₹{displayOriginalPrice}</span>
                      ) : null}

                      <span className="px-2 py-1 rounded font-bold text-[28px]" style={{ color: "#FB9573" }}>
                        ₹{displayDiscountPrice ?? displayOriginalPrice ?? "—"}
                      </span>
                    </div>

                    {displayDiscountPrice !== undefined && displayStock !== undefined && (
                      <span className="text-sm text-gray-600">@ ₹{(displayDiscountPrice / Math.max(displayStock, 1)).toFixed(2)}/piece</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <img src={offer} alt="Offer Icon" className="w-7 h-7" />
                <span className="text-base font-semibold text-[#1C647C]">Offers</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                {offers.map((offerObj) => (
                  <div key={offerObj.title} className="flex flex-col justify-between w-[160px] h-[80px] rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-50">
                    <strong>{offerObj.title}</strong>
                    <div className="text-xs text-gray-600 truncate">
                      {offerObj.details}
                      <p className="text-xs text-blue-600 cursor-pointer" onClick={() => setSelectedOffer(offerObj)}>2 Offers</p>
                    </div>
                  </div>
                ))}
              </div>

              {selectedOffer && (
                <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg border-l border-gray-300 p-5 z-50 transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">{selectedOffer.title}</h2>
                    <button className="text-gray-500 hover:text-red-500 text-xl font-bold" onClick={() => setSelectedOffer(null)}>&times;</button>
                  </div>
                  <p className="text-sm text-gray-700">{selectedOffer.details}</p>
                </div>
              )}

              <CashOnDelivery />
            </div>

            {/* Purchase Panel */}
            <div className="w-full lg:w-1/2 bg-gray-50 p-6 rounded-lg shadow-lg space-y-5 overflow-y-auto" style={{ minHeight: "540px", maxHeight: "700px" }}>
              <div>
                <label className="text-base font-semibold text-[#1C647C]">Delivery</label>
                <div className="flex items-center mt-2">
                  <input type="text" placeholder="Pin Code" className="grow border-0 border-b border-gray-400 focus:border-[#1C647C] focus:outline-none py-2 mr-4 text-base" />
                  <button className="text-blue-500 font-semibold">Check</button>
                </div>
              </div>

              <div className="space-y-3">
                {packs.map((pack) => (
                  <label
                    key={pack}
                    className="flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all duration-200"
                    style={{ backgroundColor: selectedPack === pack ? "#ECFBFF" : "white" }}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <input type="radio" name="pack" value={pack} checked={selectedPack === pack} onChange={() => setSelectedPack(pack)} className="mt-1 w-4 h-4 accent-[#006666]" />
                      <div className="flex flex-col w-full gap-1">
                        <div className="flex justify-between items-center">
                          <strong className="text-base font-semibold">{pack}</strong>
                          <span className="text-white text-xs px-4 py-[2px] rounded-full" style={{ backgroundColor: "#006666", border: "1px solid #1C647C" }}>
                            You save 10%
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <p className="text-xs text-gray-600">@ ₹4.99/piece</p>
                          <p className="text-orange-500 font-semibold text-base">₹499.00</p>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <label className="flex justify-between items-center p-3 rounded-xl border border-gray-300 cursor-pointer">
                <AiOutlineQuestionCircle className="text-3xl text-[#1C647C] mb-5" />
                <div className="flex flex-col gap-1">
                  <p className="text-base text-dark font-semibold">For bulk order</p>
                  <p className="text-base">Contact Semamart Admin</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center ml-4">
                  <AiOutlineArrowRight className="text-blue-600 text-lg" />
                </div>
              </label>

              <div className="flex gap-4">
                <button onClick={handleAddCart} className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-2 font-semibold text-[#1C647C] bg-[#ECFBFF] border border-[#1C647C] transition-all relative" style={{ position: "relative" }}>
                  <AiOutlineShoppingCart size={20} />
                  Add to Cart
                  {cartAnimation && (
                    <span className="absolute left-1/2 -translate-x-1/2 -top-10 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce z-50">
                      <AiOutlineCheckCircle size={20} />
                      Added to Cart!
                    </span>
                  )}
                </button>

                <button onClick={handleToggleWishlist} className="flex-1 flex items-center justify-center gap-2 rounded-2xl px-3 py-2 text-black border border-[#1C647C] font-semibold">
                  {inWishlist ? "Remove Wishlist" : "Add to Wish List"}
                </button>
              </div>

              <button className="w-full text-white py-3 rounded-2xl font-semibold text-lg mt-2" style={{ background: "linear-gradient(270deg, #FCB320 0%, #F04526 100%)" }}>
                Buy Now
              </button>
            </div>
          </div>

          {/* Bottom Sections */}
          <div className="space-y-8 mt-8">
            <select className="w-full px-4 py-3 border rounded-lg text-gray-700 text-base mt-2 bg-gray-50">
              <option value="product-description">Product Description</option>
            </select>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-[#1C647C]">Product Highlights</h3>
              <ul className="space-y-1 text-base text-gray-700">
                <li className="flex justify-between items-center">
                  <span>{(product as any)?.shortdescription || "No highlights available."}</span>
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-green-500 text-white text-base">✓</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-[#1C647C]">Full Description</h3>
              <p className="text-base text-gray-700">{(product as any)?.description || "No description available."}</p>
            </div>

            {/* Customer-facing Technical Details */}
            <div>
              <h3 className="text-lg font-semibold mb-2 text-[#1C647C]">Technical Details</h3>
              <ul className="text-base text-gray-700 space-y-1">
                <li className="flex justify-between"><span className="font-semibold">Brand:</span> <span>{(product as any)?.manufacturerName || "N/A"}</span></li>
                <li className="flex justify-between"><span className="font-semibold">SKU:</span> <span>{(product as any)?.sku || "N/A"}</span></li>
                <li className="flex justify-between"><span className="font-semibold">HSN:</span> <span>{(product as any)?.hsn || "N/A"}</span></li>
                <li className="flex justify-between"><span className="font-semibold">Product Type:</span> <span>{(product as any)?.productType || "N/A"}</span></li>
                <li className="flex justify-between"><span className="font-semibold">Weight:</span> <span>{(product as any)?.weight || "N/A"}</span></li>
                <li className="flex justify-between"><span className="font-semibold">Dimensions:</span> <span>{(product as any)?.dimension || "N/A"}</span></li>
                <li className="flex justify-between"><span className="font-semibold">Unit:</span> <span>{(product as any)?.unitOfMeasure || "N/A"}</span></li>
                <li className="flex justify-between"><span className="font-semibold">Stock:</span> <span>{displayStock ?? "N/A"}</span></li>
                <li className="flex justify-between"><span className="font-semibold">Delivery Lead Time:</span> <span>{(product as any)?.deliveryLeadTime || "N/A"}</span></li>
                <li className="flex justify-between"><span className="font-semibold">Expiry:</span> <span>{(product as any)?.expiry ? new Date((product as any).expiry).toLocaleDateString() : "N/A"}</span></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-[#1C647C]">Customer reviews</h3>
              {(product as any)?.reviews?.length === 0 ? (
                <p className="text-base text-gray-500">No reviews yet.</p>
              ) : (
                <div className="flex gap-4 items-center mb-1">
                  <img src="https://i.pravatar.cc/40" alt="avatar" className="w-12 h-12 rounded-full" />
                  <div>
                    <div className="font-semibold">User</div>
                    <div className="text-orange-500">★★★★★</div>
                    <p className="text-base text-gray-700 mt-1">Review goes here...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="space-y-8 mt-12 w-full max-w-[1600px] mx-auto px-4">
        <hr className="border-t border-gray-400" />
        <h1 className="font-bold text-2xl mt-6 ml-2 text-[#1C647C]">Related Products</h1>
        <div className="flex flex-wrap justify-around mt-8">
          {product && <RelatedProducts productType={(product as any).productType} productId={(product as any)._id} />}
        </div>
      </div>
    </div>
  );
}
