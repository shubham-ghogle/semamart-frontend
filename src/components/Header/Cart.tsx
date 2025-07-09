import { RxCross1 } from "react-icons/rx";
import { IoBagHandleOutline } from "react-icons/io5";
import { HiOutlineMinus, HiPlus } from "react-icons/hi";
import { CartItem, useCartStore } from "../../store/cartStore";
import { useUserStore } from "../../store/userStore";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";

type CartProps = {
  cartOpenHandler: () => void;
};

export default function Cart({ cartOpenHandler }: CartProps) {
  const { cart } = useCartStore((state) => state);
  const user = useUserStore(state => state.user)

  const navigate = useNavigate()

  function checkoutHandler() {
    if (!user) {
      toast.warning("Please login to continue", { position: "top-left" })
      return
    }
    if (user.role === "Admin") {
      toast.warning("Please login as customer to continue", { position: "top-left" })
      return
    }

    cartOpenHandler()
    navigate("/checkout")
  }


  const totalPrice = cart.reduce(
    (acc, item) => acc + item.qty * item.product.discountPrice,
    0,
  );


  return (
    <article className="fixed top-0 left-0 w-screen bg-black/60 h-screen z-[1000]">
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white flex flex-col overflow-y-auto justify-between shadow-sm px-3">
        {cart && cart.length == 0 ? (
          <div className="w-full h-screen flex items-center justify-center">
            <div className="flex w-full justify-end pt-5 pr-5 fixed top-3 right-3">
              <RxCross1
                size={25}
                className="cursor-pointer"
                onClick={cartOpenHandler}
              />
            </div>
            <h5>Cart is empty!</h5>
          </div>
        ) : (
          <>
            <div>
              <div className="flex w-full justify-end pt-5 pr-5 ">
                <RxCross1
                  size={25}
                  className="cursor-pointer"
                  onClick={cartOpenHandler}
                />
              </div>
              {/* item length */}
              <div className="flex gap-2 mt-2">
                <IoBagHandleOutline size={25} />
                <h5 className="pl-2 text-[20px] font-[500]">
                  {cart && cart.length} item
                </h5>
              </div>

              {/* Cart Single item */}
              <br />
              <div className="w-full border-t">
                {cart &&
                  cart.map((i, index) => {
                    return <CartSingle data={i} key={index} />;
                  })}
              </div>
            </div>

            <div className="px-5 mb-3">
              {/* Check out btn */}
              <button onClick={checkoutHandler} className="bg-red-500 p-3 w-full rounded-md text-white">
                Checkout Now (₹{totalPrice})
              </button>
            </div>
          </>
        )
        }
      </div >
    </article >
  );
}

type CartSingleProps = {
  data: CartItem;
};
const CartSingle = ({ data }: CartSingleProps) => {
  const totalPrice = "₹" + data.product.discountPrice * data.qty;

  const { removeFromCart, changeQyt } = useCartStore((state) => state);

  return (
    <>
      <div className="border-b p-4">
        <div className="w-full flex items-center">
          <section>
            <button
              className="bg-red-500 aspect-square rounded-full p-1 grid place-items-center"
              onClick={() => changeQyt(data.product._id, 1)}
            >
              <HiPlus size={18} color="#fff" />
            </button>
            <span className="pl-[10px]">{data.qty}</span>
            <button
              className="bg-gray-200 aspect-square rounded-full p-1 grid place-items-center"
              onClick={() => changeQyt(data.product._id, -1)}
            >
              <HiOutlineMinus size={16} color="#7d879c" />
            </button>
          </section>
          <img
            src={"/baseUrl" + "/" + data.product.images[0]}
            className="w-[130px] h-min ml-2 mr-2 rounded-[5px]"
            alt="side card"
          />

          <section className="pl-[15px]">
            <h1>{data.product.name}</h1>
            <h4 className="font-[400] text-[15px] text-[#00000082]">
              ₹{data.product.discountPrice} * {data.qty}
            </h4>
            <h4 className="font-[400] text-[17px] pt-[3px]  text-[#d02222] font-Roboto ">
              {totalPrice}
            </h4>
          </section>
          <button className="ml-auto" onClick={() => removeFromCart(data.product._id)}>
            <RxCross1 size={99} color="#7d879c" />
          </button>
        </div>
      </div>
    </>
  );
};
