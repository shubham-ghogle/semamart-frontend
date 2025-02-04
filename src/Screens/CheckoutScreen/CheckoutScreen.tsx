import OrderDetailsField from "../../components/Seller/OrderDetailsFields"
import { useCartStore } from "../../store/cartStore"
import { useUserStore } from "../../store/userStore"
import { Seller } from "../../Types/types"

export default function CheckoutScreen() {
  const { user } = useUserStore(state => state)
  const { cart } = useCartStore(state => state)

  const address = user?.addresses[0]

  const b = cart.map(el => {
    const cartObj = {
      shopId: (el.product.shopId as Seller)._id,
      _id: el.product._id,
      qty: el.qty
    }
    return cartObj
  })

  const order = {
    cart: b,
    shippingAddress: address,
    user: user?._id,
    totalPrice: 100,
    paymentInfo: {
      id: "test_payment",
      status: "Succeeded",
      type: "Paypal"
    }
  }


  async function orderHnadler() {
    await fetch("/api/v2/order/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order)
    })

  }

  return (
    <div className="mt-16 bg-white max-w-5xl w-[90w] mx-auto">
      <section className="border-b mb-8">
        {cart &&
          cart.map((item) => (
            <article key={item.product._id} className="w-full flex items-center gap-2 mb-5">
              <img
                src={"/baseUrl" + "/" + item.product.images[0]}
                alt="Product item order img"
                className="w-[80x] h-[80px]"
              />
              <div className="w-full">
                <h5 className="pl-3 text-lg">{item.product.name}</h5>
                <h5 className="pl-3 text-lg text-darkGray">
                  US${item.qty} x {item.product.discountPrice}
                </h5>
              </div>
              <OrderDetailsField label="Total:" value={item.qty * item.product.discountPrice} />
            </article>
          ))}
      </section>
      <section>
        <h2 className="text-2xl mb-4">Addresses:</h2>
        {user && (
          user.addresses?.map(el => (
            <article>
              <OrderDetailsField label="Address Line 1" value={el.instituteAddress1} />
              <OrderDetailsField label="Address Line 2" value={el.instituteAddress2} />
              <OrderDetailsField label="district" value={el.district} />
              <OrderDetailsField label="State" value={el.state} />
              <OrderDetailsField label="Pincode" value={el.pincode} />
            </article>
          )))}
      </section>
      <section className="flex justify-end">
        <button
          onClick={orderHnadler}
          className="text-center py-2 px-4 bg-red-500 rounded text-white text-2xl mt-28"
        >
          order
        </button>
      </section>
    </div>
  )
}
