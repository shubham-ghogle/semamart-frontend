import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import ProductMedia from "../../components/Product/ProductMedia";
import RatingsStarView from "../../components/UI/RatingStarView";
import ProductPrice from "../../components/Product/ProductPrice";
import { useState } from "react";
import { useCartStore } from "../../store/cartStore";
import ProductPageBtns from "../../components/Product/ProductPageBtns";
import { useWishlistStore } from "../../store/wishlistStore";
import ProductDetailsInfo from "../../components/Product/ProductDetailsInfo";
import { getProductDetail } from "./ProductDetails.HooksUtils";


export default function ProductDetailsScreen() {
  const { id } = useParams();
  const { data: product, status } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductDetail(id),
  });

  const [count, setCount] = useState(1);

  //adding to cart and persisting it in localStorage
  const { addToCart, cart } = useCartStore((state) => state);
  function addToCartHandler() {
    if (!product) return;
    const isItemInCart = cart.some((el) => el.product._id === product._id);
    if (isItemInCart) {
      alert("Item already in the cart");
      return;
    }
    const item = { product, qty: count };
    addToCart(item);
  }

  //wishlist handlers
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlistStore(
    (state) => state,
  );
  const isInWishlist = wishlist.some((pro) => pro._id === product?._id);

  function addToWishlistHandler() {
    if (!product) return;
    if (isInWishlist) return;
    addToWishlist(product);
  }
  function removeFromWishlistHandler() {
    if (!product) return;
    removeFromWishlist(product._id);
  }

  //number of items to add in the cart
  function incrementCount() {
    setCount(count + 1);
  }
  function decrementCount() {
    if (count > 1) {
      setCount(count - 1);
    }
  }

  if (status === "pending") return <div>Loading...</div>;

  if (status === "error") return <div>error...</div>;

  return (
    <section className="w-[80vw] mx-auto mt-8">
      <div className="grid grid-cols-2 gap-4 h-[60vh] max-h-[600px]">
        {product && <ProductMedia product={product} />}
        <article>
          <div className="border-b pb-3">
            <h1 className="text-3xl font-semibold mb-2">{product?.name}</h1>
            <RatingsStarView rating={product.ratings || 0} />
          </div>
          <div className="mt-6 border-b pb-6">
            <ProductPrice product={product} />
            <ProductPageBtns
              decrementCount={decrementCount}
              incrementCount={incrementCount}
              addToCartHandler={addToCartHandler}
              count={count}
              isInWishlist={isInWishlist}
              addToWishlistHandler={addToWishlistHandler}
              removeFromWishlistHandler={removeFromWishlistHandler}
            />
          </div>
          <div className="mt-5 border-t-slate-200">
            <p>{product?.description}</p>
          </div>
        </article>
      </div>
      <ProductDetailsInfo product={product} />
    </section>
  );
}
