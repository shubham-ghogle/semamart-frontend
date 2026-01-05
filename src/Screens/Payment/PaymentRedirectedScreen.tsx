import { API_URL } from "@/data";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useParams } from "react-router";

export default function PaymentRedirectedScreen() {
    const { hdfcOrderId } = useParams();

    const { data, status } = useQuery({
        queryKey: ["order-status", hdfcOrderId],
        queryFn: () => getHdfcOrderStatus(hdfcOrderId || ""),
        enabled: !!hdfcOrderId,
    });

    return (
        <main className="h-svh w-svw flex items-center justify-center">
            {status === "pending" && (
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
                    <p className="text-sm text-gray-600">
                        Verifying your payment…
                    </p>
                </div>
            )}

            {status === "success" &&
                (data?.status === "CHARGED" ? (
                    <div className="flex flex-col items-center gap-3">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                        <p className="text-lg font-semibold">
                            Payment Successful
                        </p>
                        <p className="text-sm text-gray-600">
                            Order ID: {data.orderId}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <XCircle className="h-10 w-10 text-red-600" />
                        <p className="text-lg font-semibold">Payment Failed</p>
                        <p className="text-sm text-gray-600">
                            Please try again.
                        </p>
                    </div>
                ))}
        </main>
    );
}

async function getHdfcOrderStatus(orderId: string) {
    const url = API_URL + "order/order-confirmation/" + orderId;

    const res = await fetch(url);
    if (!res.ok) {
        throw new Error("Failed to fetch order status");
    }
    const data = (await res.json()) as {
        success: boolean;
        status: string;
        orderId: string;
        paymentId: string;
    };
    return data;
}
