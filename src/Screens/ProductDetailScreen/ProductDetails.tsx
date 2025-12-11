// ProductCard.tsx
import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { getProductDetail } from "./ProductDetails.HooksUtils";
import RelatedProducts from "../../components/UIComponents/RelatedProductCard";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";

import ProductMediaSection from "./ProductMediaSection";
import ProductInfoSection from "./ProductInfoSection";
import PurchasePanel from "./PurchasePanel";
import ProductBottomSections from "./ProductBottomSections";

import { toImageUrl } from "./utils";

const demoImages = [
  "/MedicalImages/imagea.png",
  "/MedicalImages/imageb.png",
  "/MedicalImages/imagec.png",
  "/MedicalImages/imaged.jpg",
  "/MedicalImages/imaged.png",
  "/MedicalImages/imagef.png",
];

export default function ProductCard() {
  const { id } = useParams();

  const {
    data: product,
    isLoading: isPending,
    isError,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductDetail(id as string),
  });

  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [animating, setAnimating] = useState<boolean>(false);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [isVariantActive, setIsVariantActive] = useState<boolean>(false);
  const [selectedPack, setSelectedPack] = useState<{
    qty: number;
    price: number;
    label: string;
  } | null>(null);
  const [cartAnimation, setCartAnimation] = useState(false);

  const infoRef = useRef<HTMLDivElement | null>(null);
  const [imgSectionHeight, setImgSectionHeight] = useState(600);

  const { addToWishlist, removeFromWishlist, wishlist } = useWishlistStore(
    (s) => s,
  );
  const addToCart = useCartStore((s) => s.addToCart);

  // ✅ Build productMedia
  const productMedia: { type: "image" | "video"; src: string }[] =
    React.useMemo(() => {
      if (!product) {
        return demoImages.map((d) => ({ type: "image" as const, src: d }));
      }
      const media: { type: "image" | "video"; src: string }[] = [];

      if (
        Array.isArray((product as any).images) &&
        (product as any).images.length > 0
      ) {
        const imgs = (product as any).images;
        for (let i = 0; i < imgs.length; i++) {
          const maybeUrl = toImageUrl(imgs[i] as unknown as string);
          if (typeof maybeUrl === "string" && maybeUrl.length > 0) {
            media.push({ type: "image", src: maybeUrl });
          }
        }
      }

      if (media.length === 0 && Array.isArray((product as any).variants)) {
        const vars = (product as any).variants;
        for (let i = 0; i < vars.length; i++) {
          const thumb = vars[i]?.thumbnail;
          const maybeUrl = toImageUrl(thumb as unknown as string);
          if (typeof maybeUrl === "string" && maybeUrl.length > 0) {
            media.push({ type: "image", src: maybeUrl });
          }
        }
      }

      if (media.length === 0) {
        demoImages.forEach((d) => media.push({ type: "image", src: d }));
      }

      const shortVideo = (product as any)?.shortVideo;
      if (shortVideo) {
        const videoUrl =
          shortVideo.startsWith("http") || shortVideo.startsWith("/")
            ? shortVideo
            : `/videos/${shortVideo}`;
        media.push({ type: "video", src: videoUrl });
      }

      return media;
    }, [product]);

  const displayOriginalPrice =
    selectedVariant?.originalPrice ?? (product as any)?.originalPrice;
  const displayDiscountPrice =
    selectedVariant?.discountPrice ?? (product as any)?.discountPrice;

  const variantBulkOrders: { qty: number; price: number }[] =
    Array.isArray(selectedVariant?.bulkOrders) &&
    selectedVariant?.bulkOrders.length > 0
      ? selectedVariant.bulkOrders
          .slice()
          .sort((a: any, b: any) => a.qty - b.qty)
      : [];

  const computePerPiece = (pack: { qty: number; price: number } | null) => {
    if (!pack) return { perPiece: 0, savedPercent: 0 };
    const perPiece = pack.price / Math.max(pack.qty, 1);
    const orig = displayOriginalPrice ?? displayDiscountPrice ?? 0;
    const savedPercent = orig
      ? Math.round(((orig - perPiece) / orig) * 100)
      : 0;
    return { perPiece, savedPercent: Math.max(0, savedPercent) };
  };

  const { perPiece: selectedPerPiece, savedPercent: selectedSavedPercent } =
    computePerPiece(selectedPack);

  // ✅ Variant + pack initialization
  useEffect(() => {
    if (!product) return;
    if ((product as any)?.defaultVariant) {
      setSelectedVariant((product as any).defaultVariant);
    } else if ((product as any)?.variants?.length) {
      setSelectedVariant((product as any).variants[0]);
    } else {
      setSelectedVariant(null);
    }
    setIsVariantActive(false);
    setSelectedPack(null); // by default, no combo selected
  }, [product]);

  useEffect(() => {
    if (!selectedVariant) return;
    const vb = Array.isArray(selectedVariant.bulkOrders)
      ? selectedVariant.bulkOrders
      : [];
    if (vb.length > 0) {
      if (
        !selectedPack ||
        !vb.some(
          (b: any) =>
            b.qty === selectedPack.qty && b.price === selectedPack.price,
        )
      ) {
        setSelectedPack(null); // still require manual selection
      }
    }
  }, [selectedVariant]);

  useEffect(() => {
    if (infoRef.current) setImgSectionHeight(infoRef.current.offsetHeight);
    if (activeIdx >= productMedia.length) setActiveIdx(0);
  }, [productMedia.length, infoRef, activeIdx]);

  // ✅ Wishlist: unique by productId + variantId
  const inWishlist = wishlist.some(
    (w) =>
      w.productId === (product as any)?._id &&
      (w.variantId ?? null) === (selectedVariant?._id ?? null),
  );

  // ✅ Add to cart
  const handleAddCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product) return;
    const parsedMinMaxQty = JSON.parse(
      product.minmaxrule as unknown as string,
    ) as { minQty: string; maxQty: string };
    const intMinQty = parseInt(parsedMinMaxQty.minQty);

    const packQty = selectedPack?.qty ?? (isNaN(intMinQty) ? 1 : intMinQty);
    const packPrice =
      selectedPack?.price ??
      selectedVariant?.discountPrice ??
      selectedVariant?.originalPrice ??
      0;

     //console.log(selectedPack);
    // console.log(packPrice);
    const perPiece = selectedPack
      ? packPrice / Math.max(selectedPack.qty, 1)
      : packPrice;
     //console.log(perPiece);

    const shopId =
      typeof (product as any).shopId === "string"
        ? (product as any).shopId
        : ((product as any).shopId?._id ?? "");

    const taxClass = (product as any).taxClass ?? 0;
   
    const x = {
      productId: (product as any)._id,
      variantId: selectedVariant?._id ?? null,
      product,
      variant: selectedVariant,
      qty: packQty,
      price: perPiece,
      shopId,
      taxClass,
    }
    console.log(x);
    addToCart({
      productId: (product as any)._id,
      variantId: selectedVariant?._id ?? null,
      product,
      variant: selectedVariant,
      qty: packQty,
      price: perPiece,
      shopId,
      taxClass,
    });

    setCartAnimation(true);
    setTimeout(() => setCartAnimation(false), 1500);
  };

  // ✅ Add/remove wishlist with variant info
  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product || !selectedVariant) return;

    if (inWishlist) {
      removeFromWishlist((product as any)._id, selectedVariant._id ?? null);
    } else {
      addToWishlist(product, selectedVariant); // store expects product + variant
    }
  };

  const getMinOrderQtyFromRule = (ruleRaw: any) => {
    if (!ruleRaw) return null;
    try {
      const rule = typeof ruleRaw === "string" ? JSON.parse(ruleRaw) : ruleRaw;
      // possible keys seen in different payloads
      const rawMin =
        rule.minQty ??
        rule.minqty ??
        rule.min ??
        rule.minQuantity ??
        rule.min_order ??
        rule.minOrder ??
        null;
      const n = Number(rawMin);
      return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
    } catch (err) {
      // ignore parse errors
      return null;
    }
  };

  const productMinFromProduct = getMinOrderQtyFromRule(
    (product as any)?.minmaxrule,
  );
  const variantMinFromVariant = getMinOrderQtyFromRule(
    (selectedVariant as any)?.minmaxrule,
  );
  const minOrderQty = variantMinFromVariant ?? productMinFromProduct ?? null;

  if (isPending || !product) {
    return (
      <div className="flex items-center justify-center h-[80vh] w-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1C647C] mr-4" />
        <span className="text-xl text-gray-500">Loading product...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-center text-red-500 mt-20">Failed to load product.</p>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white font-sans pt-8 pb-12 px-0 ">
      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-[1600px] mx-auto box-border px-4">
        {/* Left: media & variants */}
        <div
          className="w-full lg:w-[40%] flex flex-col items-center justify-start"
          style={{
            minHeight: imgSectionHeight,
            alignSelf: "flex-start",
            paddingTop: "32px",
            paddingBottom: "32px",
          }}
        >
          <ProductMediaSection
            product={product}
            productMedia={productMedia}
            activeIdx={activeIdx}
            setActiveIdx={setActiveIdx}
            animating={animating}
            setAnimating={setAnimating}
            selectedVariant={selectedVariant}
            selectedPack={selectedPack}
            isVariantActive={isVariantActive}
            setIsVariantActive={setIsVariantActive}
          />

          {Array.isArray((product as any).variants) &&
            (product as any).variants.length > 1 && (
              <div className="mt-6 w-full flex flex-col items-center">
                <h3 className="text-lg font-semibold mb-2 text-[#1C647C]">
                  Choose Variant
                </h3>
                <div className="flex flex-wrap gap-3">
                  {(product as any).variants.map((v: any) => (
                    <button
                      key={v._id}
                      onClick={() => {
                        setSelectedVariant(v);
                        setIsVariantActive(true);
                        setSelectedPack(null);
                      }}
                      className={`px-4 py-2 border rounded-lg text-sm transition ${
                        selectedVariant?._id === v._id
                          ? "bg-[#1C647C] text-white"
                          : "bg-white text-gray-700 border-gray-300"
                      }`}
                    >
                      {v.colorOption ?? ""} {v.size ? ` | Size: ${v.size}` : ""}
                    </button>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* Right: Info + Purchase */}
        <div className="w-full lg:w-[60%] flex flex-col gap-8">
          <div className="flex flex-col lg:flex-row gap-4 w-full">
            <div ref={infoRef} className="w-full flex-1">
              <ProductInfoSection
                product={product}
                selectedVariant={selectedVariant}
                selectedPack={selectedPack}
                selectedPerPiece={selectedPerPiece}
                selectedSavedPercent={selectedSavedPercent}
                minOrderQty={minOrderQty}
              />
            </div>

            <PurchasePanel
              className="w-full flex-1"
              product={product}
              selectedVariant={selectedVariant}
              variantBulkOrders={variantBulkOrders}
              selectedPack={selectedPack}
              setSelectedPack={setSelectedPack}
              handleAddCart={handleAddCart}
              handleToggleWishlist={handleToggleWishlist}
              inWishlist={inWishlist}
              cartAnimation={cartAnimation}
              minOrderQty={minOrderQty}
            />
          </div>

          <ProductBottomSections
            product={product}
            selectedVariant={selectedVariant}
          />
        </div>
      </div>

      <div className="space-y-8 mt-12 w-full max-w-[1600px] mx-auto px-4">
        <hr className="border-t border-gray-400" />
        <h1 className="font-bold text-2xl mt-6 ml-2 text-[#1C647C]">
          Related Products
        </h1>
        <div className="flex flex-wrap justify-around mt-8">
          {product && (
            <RelatedProducts
              productType={(product as any).productType}
              productId={(product as any)._id}
            />
          )}
        </div>
      </div>
    </div>
  );
}
