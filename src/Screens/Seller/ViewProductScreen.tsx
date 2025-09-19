import { useQuery } from "@tanstack/react-query";
import SellerMainWrapper from "../../components/Seller/SellerMainWrapper";
import { useParams } from "react-router";
import { getProductDetail } from "../ProductDetailScreen/ProductDetails.HooksUtils";
import { FormProduct } from "./seller.hooksUtils";
import { fetchProductCategories } from "./AddProductScreen2";
import AddProductForm from "@/components/Seller/AddProductForm";
import { LoaderIcon } from "lucide-react";
import { API_URL } from "@/data";

export default function ViewProductScreen() {
  const { id } = useParams();

  const { data: product, status, } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductDetail(id),
  });

  const { data, status: catStatus } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchProductCategories()
  })

  const { data: subCats, status: subCatStatus } = useQuery({
    queryKey: ["subCategories"],
    queryFn: () => getSubcats()
  })

  if (status === "pending" || subCatStatus === "pending" || catStatus === "pending") {
    return (
      <div className="h-screen grid place-items-center">
        <LoaderIcon className="animate-spin" />
      </div>
    )
  }

  if (status === "error" || !product || !data || !subCats) {
    return (
      <div className="h-screen grid place-items-center">
        <p>Something went wrong</p>
      </div>
    )
  }

  const category = data.filter(el => product.category.includes(el._id)).map(c => ({ name: c.name, val: c._id }))
  const subCategory = subCats.filter((el: any) => product.subCategory.includes(el._id)).map((el: any) => ({ name: el.name, val: el._id }))

  const minmaxrule = product?.minmaxrule
    ? JSON.parse(product.minmaxrule as unknown as string)
    : { minQty: "0", maxQty: "0" };

  const formProduct: FormProduct = {
    expiry: new Date(product?.expiry || ""),
    tags: JSON.parse(product.tags as unknown as string) || [],
    attributes: JSON.parse(product?.attributes as unknown as string) || [],
    name: product?.name || "",
    category: category,
    subCategory: subCategory || [],
    productType: product?.productType || "",
    intendedUse: product?.intendedUse || "",
    sku: product?.sku || "",
    gtin: product?.gtin || "",
    hsn: product?.hsn || "",
    unspsc: product?.unspsc || "",
    upsells: product?.upsells || "",
    crosssells: product?.crosssells || "",
    manufacturerName: product?.manufacturerName || "",
    email: product?.email || "",
    phone: product?.phone || "",
    origin: product?.origin || "",
    shortdescription: product?.shortdescription || "",
    description: product?.description || "",
    productWgt: product?.weight.split(" ")[0] || "",
    productWgtUnit: product?.weight.split(" ")[1] || "",
    dimensionUnit: product?.dimension.split(" ")[1] || "",
    dimension_l: product?.dimension.split(" ")[0].split("x")[0] || "",
    dimension_h: product?.dimension.split(" ")[0].split("x")[1] || "",
    dimension_w: product?.dimension.split(" ")[0].split("x")[2] || "",
    sterileString: product?.sterile ? "true" : "false",
    singleUseString: product?.singleUse ? "true" : "false",
    productCompilance: null,
    msds_ifu_leaflet: null,
    minmaxrule: minmaxrule,
    taxClass: product?.taxClass.toString() || "",
    taxStatus: product?.taxStatus || "",
    unitOfMeasure: product?.unitOfMeasure || "",
    stockStatus: product?.stockStatus || "",
    deliveryLeadTime: product?.deliveryLeadTime || "",
    warranty: product?.warranty || "",
    amc_cms: null,
    rma: product?.rma || "",
    dispatchLocation: product?.dispatchLocation || "",
    dispatchPinCode: product?.dispatchPinCode.toString() || "",
    unitsPerCarton: product?.unitsPerCarton.toString() || "",
    shippingWeight: product?.shippingWeight.toString() || "",
    packagingType: product?.packagingType || "",
    // deliveryPartner: product?.deliveryPartner || "",
    deliveryInstruction: product?.deliveryInstruction || "",
    shelfing_storage_req: product?.shelfing_storage_req || "",
    purchaseNote: product?.purchaseNote || "",
    certificate: [],
    oemLetter: null,
    productComparisionSheet: null,
    specialityPackage: product?.specialityPackage || "",
    variants: product?.variants.map(el => ({
      size: el?.size || null,
      colorOption: el.colorOption || null,
      originalPrice: el?.originalPrice?.toString() || "",
      discountPrice: el?.discountPrice?.toString() || "",
      // institutePrice: el.institutePrice?.toString() || "",
      stocks: el.stock.toString() || ""
    })) || [],
    specialityPackageType: product?.specialityPackageType || ""
  }

  const thumbnails = product.variants.map(el => el.thumbnail)

  return (
    <SellerMainWrapper status={status} errorMeassage="Something went wrong" heading="Product Detail">
      {status === "success" && catStatus === "success" && data && product && (
        <>
          <AddProductForm
            categories={data}
            product={formProduct}
            multiVariant={product.variants.length > 1}
            thumbnails={thumbnails}
          />
        </>
      )}
    </SellerMainWrapper>
  )
}

async function getSubcats() {
  const url = API_URL + "sub-category"
  const res = await fetch(url)
  if (!res.ok) throw new Error()
  const data = await res.json()
  return data
}
