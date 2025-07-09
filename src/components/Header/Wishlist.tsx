import { IoBagHandleOutline } from "react-icons/io5";
import { RxCross1 } from "react-icons/rx";
import { useWishlistStore } from "../../store/wishlistStore";
import { Product } from "../../Types/types";

type WishlistProps = {
  wishlistOpenHandler: () => void
}

export default function Wishlist({ wishlistOpenHandler }: WishlistProps) {
  const wishlist = useWishlistStore(state => state.wishlist)

  return (
    <article className="fixed top-0 left-0 w-screen bg-black/60 h-screen z-[1000]">
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white flex flex-col overflow-y-auto justify-between shadow-sm px-3">
        {wishlist && wishlist.length == 0 ? (
          <div className="w-full h-screen flex items-center justify-center">
            <div className="flex w-full justify-end pt-5 pr-5 fixed top-3 right-3">
              <RxCross1
                size={25}
                className="cursor-pointer"
                onClick={wishlistOpenHandler}
              />
            </div>
            <h5>Wishlist is empty!</h5>
          </div>
        ) : (
          <>
            <div>
              <div className="flex w-full justify-end pt-5 pr-5 ">
                <RxCross1
                  size={25}
                  className="cursor-pointer"
                  onClick={wishlistOpenHandler}
                />
              </div>
              {/* item length */}
              <div className="flex gap-2 mt-2">
                <IoBagHandleOutline size={25} />
                <h5 className="pl-2 text-[20px] font-[500]">
                  {wishlist && wishlist.length} item
                </h5>
              </div>

              {/* Cart Single item */}
              <br />
              <div className="w-full border-t">
                {wishlist &&
                  wishlist.map((i, index) => {
                    return <CartSingle data={i} key={index} />;
                  })}
              </div>
            </div>
            {/* <div className="px-5 mb-3"> */}
            {/*   {/* Check out btn */}
            {/*   <button onClick={checkoutHandler} className="bg-red-500 p-3 w-full rounded-md text-white"> */}
            {/*     Checkout Now (₹{totalPrice}) */}
            {/*   </button> */}
            {/* </div> */}
          </>
        )
        }
      </div >
    </article >
  )
}

type CartSingleProps = {
  data: Product;
};
const CartSingle = ({ data }: CartSingleProps) => {

  const removeFromWishlist = useWishlistStore(state => state.removeFromWishlist)

  return (
    <>
      <div className="border-b p-4">
        <div className="w-full flex items-center">
          <img
            src={"/baseUrl" + "/" + data.images[0]}
            className="w-[130px] h-min ml-2 mr-2 rounded-[5px]"
            alt="side card"
          />

          <section className="pl-[15px]">
            <h1>{data.name}</h1>
            <h4 className="font-[400] text-[15px] text-[#00000082]">
              ₹{data.discountPrice}
              {/* * {data.qty} */}
            </h4>
            {/* <h4 className="font-[400] text-[17px] pt-[3px]  text-[#d02222] font-Roboto "> */}
            {/*   {totalPrice} */}
            {/* </h4> */}
          </section>
          <button className="ml-auto" onClick={() => removeFromWishlist(data._id)}>
            <RxCross1 size={99} color="#7d879c" />
          </button>
        </div>
      </div>
    </>
  );
};

