import { useQuery } from "@tanstack/react-query";
import SellerMainWrapper from "../../components/Seller/SellerMainWrapper";
// import ProductDetailsForm from "../../components/Seller/ProductDetailsForm";
import AddProductForm from "@/components/Seller/AddProductForm";
import { API_URL } from "@/data";
import { CategoryApiRes } from "@/Types/types";
import { LoaderIcon } from "lucide-react";

// const categoriesData = [{ title: "edible" }];

export default function AddProductScreen2() {

  const { data, status } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchProductCategories()
  })

  if (status === "pending") {
    return (
      <div className="h-screen grid place-items-center">
        <LoaderIcon className="animate-spin" />
      </div>
    )
  }

  return (
    <SellerMainWrapper heading="Add Product" status="success">
      <AddProductForm categories={data ?? []} />
    </SellerMainWrapper >
  );
}


async function fetchProductCategories() {
  const url = API_URL + "category"
  const res = await fetch(url)
  if (!res.ok) throw new Error()
  const data = await res.json() as CategoryApiRes[]
  return data
}
