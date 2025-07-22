import {
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import { ActionBtn } from "../UI/Buttons";

type ProductPageBtnsProps = {
  decrementCount: () => void;
  incrementCount: () => void;
  addToCartHandler: () => void;
  count: number;
  addToWishlistHandler: () => void;
  removeFromWishlistHandler: () => void;
  isInWishlist: boolean;
};

export default function ProductPageBtns({
  decrementCount,
  incrementCount,
  addToCartHandler,
  count,
  addToWishlistHandler,
  removeFromWishlistHandler,
  isInWishlist,
}: ProductPageBtnsProps) {
  return (
    <section className="flex gap-4 items-center mt-5">
      <article className="grid grid-cols-[1fr_1fr_1fr] w-[130px]  border">
        <button
          className="font-bold rounded-l px-4 py-2 hover:opacity-75 transition duration-300 ease-in-out"
          onClick={decrementCount}
        >
          -
        </button>
        <span className="text-slate-700 font-medium px-4 py-[11px]">
          {count}
        </span>
        <button
          className="font-bold rounded-r px-[14px] py-2 hover:opacity-75 transition duration-300 ease-in-out"
          onClick={incrementCount}
        >
          +
        </button>
      </article>
      <ActionBtn onClick={() => {
    console.log("🟡 ActionBtn clicked");
    addToCartHandler();
  }}>
        Add to Cart <AiOutlineShoppingCart className="ml-1" />
      </ActionBtn>
      <figure className="ml-auto">
        {isInWishlist ? (
          <AiFillHeart
            size={30}
            className="cursor-pointer"
            onClick={removeFromWishlistHandler}
            color={isInWishlist ? "red" : "#333"}
            title="Remove from wishlist"
          />
        ) : (
          <AiOutlineHeart
            size={30}
            className="cursor-pointer"
            onClick={addToWishlistHandler}
            title="Add to wishlist"
          />
        )}
      </figure>
    </section>
  );
}
