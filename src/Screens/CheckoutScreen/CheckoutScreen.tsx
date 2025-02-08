import { useState } from "react"
import OrderDetailsField from "../../components/Seller/OrderDetailsFields"
import AddressCard from "../../components/User/AddressCard"
import { useCartStore } from "../../store/cartStore"
import { useUserStore } from "../../store/userStore"
import { Seller } from "../../Types/types"

export default function CheckoutScreen() {
  const { user } = useUserStore(state => state)
  const { cart } = useCartStore(state => state)

  const [selectedAddressIndex, setSelectedAddressIndex] = useState<null | number>(null)

  const address = user?.addresses[selectedAddressIndex || 0] // BUG

  const cartToApi = cart.map(el => {
    const cartObj = {
      shopId: (el.product.shopId as Seller)._id,
      _id: el.product._id,
      qty: el.qty
    }
    return cartObj
  })

  const totalPrice = cart.reduce((acc, curr) => ((curr.qty * curr.product.discountPrice) + acc), 0)

  const order = {
    cart: cartToApi,
    shippingAddress: address,
    user: user?._id,
    totalPrice: totalPrice,
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
        <h2 className="text-2xl mb-4">Select Address:</h2>
        <section className="grid grid-cols-4 gap-4">
          {user && (
            user.addresses?.map((el, i) => (
              <article key={i}
                className={"border-accentYellow rounded-lg cursor-pointer " + (selectedAddressIndex === i ? "border" : " ")}
                onClick={() => setSelectedAddressIndex(i)}
              >
                <AddressCard address={el} name={user.firstName + " " + user.lastName} />
              </article>
            )))}
        </section>
      </section>
      <section className="flex justify-end">
        <button
          onClick={orderHnadler}
          className="text-center py-2 px-4 bg-red-500 rounded text-white text-2xl mt-28 disabled:bg-gray-700"
          disabled={selectedAddressIndex === null}
        >
          {selectedAddressIndex !== null ? "order" : "please select address"}
        </button>
      </section>
    </div>
  )
}
