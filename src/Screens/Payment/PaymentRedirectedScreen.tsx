import { useParams } from "react-router"

export default function PaymentRedirectedScreen(){
    const {hdfcOrderId} = useParams()
    // const clear = useCartStore(s=>s.clearCart)

    return(
        <main className="h-svh w-svw ">
            {hdfcOrderId}
        </main>
    )
}
