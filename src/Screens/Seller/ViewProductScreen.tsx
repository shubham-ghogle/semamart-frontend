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

  const { data: product, status } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductDetail(id),
  });

  const { data, status: catStatus } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchProductCategories(),
  });

  const { data: subCats, status: subCatStatus } = useQuery({
    queryKey: ["subCategories"],
    queryFn: () => getSubcats(),
  });

  if (
    status === "pending" ||
    subCatStatus === "pending" ||
    catStatus === "pending"
  ) {
    return (
      <div className="h-screen grid place-items-center">
        <LoaderIcon className="animate-spin" />
      </div>
    );
  }

  if (status === "error" || !product || !data || !subCats) {
    return (
      <div className="h-screen grid place-items-center">
        <p>Something went wrong</p>
      </div>
    );
  }

  // FIXED: Added safe checks for includes and mapping
  const category = data
    .filter((el) => product.category?.includes(el._id))
    .map((c) => ({ name: c.name, val: c._id }));

  const subCategory = subCats
    .filter((el: any) => product.subCategory?.includes(el._id))
    .map((el: any) => ({ name: el.name, val: el._id }));

  const minmaxrule = product?.minmaxrule
    ? typeof product.minmaxrule === "string"
      ? JSON.parse(product.minmaxrule)
      : product.minmaxrule
    : { minQty: "0", maxQty: "0" };

  const formProduct: FormProduct = {
    expiry: product?.manufacturingDate
      ? new Date(product?.manufacturingDate)
      : new Date(),
    tags: product.tags || [],
    attributes: product?.attributes || [],
    name: product?.name || "",
    brand: product?.brand || "",
    category: category,
    subCategory: subCategory || [],
    productType: product?.productType || "",
    intendedUse: product?.intendedUse || "",
    sku: product?.sku || "",
    gtin: product?.gtin || "",
    hsn: product?.hsn || "",
    unspsc: product?.unspsc || "",
    upsells: product?.upsells || [],
    crosssells: product?.crosssells || [],
    manufacturerName:
      typeof product?.manufacturer !== "string"
        ? product?.manufacturer?.manufacturerName
        : "",
    email:
      typeof product?.manufacturer !== "string"
        ? product?.manufacturer?.email
        : "",
    phone:
      typeof product?.manufacturer !== "string"
        ? product?.manufacturer?.phone
        : "",
    origin:
      typeof product?.manufacturer !== "string"
        ? product?.manufacturer?.origin
        : "",
    shortdescription: product?.shortdescription || "",
    description: product?.description || "",
    // FIXED: Safe splitting for weight/dimension
    productWgt: product?.weight?.split(" ")[0] || "",
    productWgtUnit: product?.weight?.split(" ")[1] || "",
    dimensionUnit: product?.dimension?.split(" ")[1] || "",
    dimension_l: product?.dimension?.split(" ")[0]?.split("x")[0] || "",
    dimension_h: product?.dimension?.split(" ")[0]?.split("x")[1] || "",
    dimension_w: product?.dimension?.split(" ")[0]?.split("x")[2] || "",
    sterileString: product?.sterile ? "true" : "false",
    singleUseString: product?.singleUse ? "true" : "false",
    productCompilance: null,
    msds_ifu_leaflet: null,
    minmaxrule: minmaxrule,
    // FIXED: Added .toString() safety
    taxClass: product?.taxClass?.toString() ?? "",
    taxStatus: product?.taxStatus || "",
    unitOfMeasure: product?.unitOfMeasure || "",
    stockStatus: product?.stockStatus || "",
    deliveryLeadTime: product?.deliveryLeadTime || "",
    warranty: product?.warranty?.toString() ?? "",
    amc_cms: null,
    rma: product?.rma || "",
    dispatchLocation: product?.dispatchLocation || "",
    dispatchState: product?.dispatchState || "",
    dispatchDistrict: product?.dispatchDistrict || "",
    dispatchPinCode: product?.dispatchPinCode?.toString() ?? "",
    unitsPerCarton: product?.unitsPerCarton?.toString() ?? "",
    shippingWeight: product?.shippingWeight?.toString() ?? "",
    packagingType: product?.packagingType || "",
    deliveryInstruction: product?.deliveryInstruction || "",
    shelfing_storage_req: product?.shelfing_storage_req || "",
    purchaseNote: product?.purchaseNote || "",
    certificate: [],
    oemLetter: null,
    productComparisionSheet: null,
    specialityPackage: product?.specialityPackage || "",
    // FIXED: Safe mapping for variants and nested stocks
    variants:
      product?.variants?.map((el) => ({
        size: el?.size || null,
        colorOption: el?.colorOption || null,
        originalPrice: el?.originalPrice?.toString() ?? "",
        discountPrice: el?.discountPrice?.toString() ?? "",
        stocks: el?.stock?.toString() ?? "0",
        bulkOrders: el?.bulkOrders || [],
      })) || [],
    specialityPackageType: product?.specialityPackageType || "",
  };

  return (
    <SellerMainWrapper
      status={status}
      errorMessage="Something went wrong"
      heading="Product Detail"
    >
      {status === "success" && catStatus === "success" && data && product && (
        <AddProductForm
          categories={data}
          product={formProduct}
          multiVariant={product.variants.length > 1}
          productId={product._id}
        />
      )}
    </SellerMainWrapper>
  );
}

async function getSubcats() {
  const url = API_URL + "sub-category";
  const res = await fetch(url);
  if (!res.ok) throw new Error();
  const data = await res.json();
  return data;
}
