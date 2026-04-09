// @ts-nocheck
import { addProductFormSchema } from "@/Screens/Seller/addProductFormSchema";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Autocomplete } from "../ui/autocomplete";
import {
  CategoryApiRes,
  CategoryDetailApiRes,
  SubCategory,
} from "@/Types/types";
import { ChangeEvent, useEffect, useState } from "react";
import { API_URL } from "@/data";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TagsInput } from "../ui/tags-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { IoRemoveCircle } from "react-icons/io5";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/utils";
import { format } from "date-fns";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { useSellerStore } from "@/store/sellerStore";
import { toast } from "react-toastify";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../ui/accordion";
import {
  addProductFormDefaultValues,
  FormProduct,
} from "@/Screens/Seller/seller.hooksUtils";
import SpecialityDropdown from "./SpecialityDropdown";
import { Checkbox } from "../ui/checkbox";
import DocumentsDisplay from "./DocumentsDisplay";
import MediaDisplay from "./MediaDisplay";
import VariantsDisplay from "./VariantsDisplay";
import AddProductFormVariants from "./AddProductFormVariants.tsx";
import { useBlocker, useNavigate } from "react-router";
import { useDebounce } from "@/hooks";
import { InfoTooltip } from "../ui/InfoTooltip";
import Subformlabel from "../ui/Subformlabel";
import indiaStates, { getDistricts } from "india-state-district";
import { useSellerSession } from "@/Screens/Seller/sellerSession";
import { getApiErrorMessage } from "@/lib/apiError";


type AddProductFormProps =
  | {
      categories: CategoryApiRes[];
      product?: undefined;
      images?: undefined;
      multiVariant?: undefined;
      productId?: undefined;
    }
  | {
      categories: CategoryApiRes[];
      product: FormProduct;
      multiVariant: boolean;
      productId: string;
    };

function getSelectValue(entry: any) {
  if (!entry) return "";
  if (typeof entry === "string") return entry;
  return entry.val || entry.value || entry._id || "";
}

export default function AddProductForm({
  multiVariant = false,
  categories,
  product,
  productId,
}: AddProductFormProps) {
  const [subCatList, setSubCatList] = useState<SubCategory[]>([]);
  const [currentAttri, setCurrentAttri] = useState({ key: "", val: "" });
  const seller = useSellerStore((state) => state.seller);
  const { shopId, canAccess } = useSellerSession();
  const [currCategory, setCurrCategory] = useState({ name: "", val: "" });
  const [currSubcategory, setCurrSubcategory] = useState<{ name: string; val: string; tags: string[] }>({
    name: "",
    val: "",
    tags: [],
  });
  const [isMultiVariant, setIsMultiVariant] = useState(multiVariant);
  const [variantImages, setVariantImages] = useState<File[][]>([]);
  const [subcategoryTagsMap, setSubcategoryTagsMap] = useState<Record<string, string[]>>({});

  const qc = useQueryClient();
  const navigate = useNavigate();

  if (!canAccess("AddProduct")) {
    return <div className="rounded-xl border bg-white p-4 text-gray-600">You do not have access to add products.</div>;
  }

  // --- NORMALIZE incoming product so form always has attributes & brand ---
  // --- NORMALIZE incoming product so form always has attributes & brand ---
  const normalizedProduct = product
    ? (() => {
        // ensure attributes is an array
        const attrs = Array.isArray(product.attributes)
          ? product.attributes
          : [];

        // normalize brand robustly (string | populated object | ObjectId)
        const rawBrand = (product as any).brand;
        let brandVal = "";

        if (rawBrand) {
          if (typeof rawBrand === "string") {
            brandVal = rawBrand;
          } else if (typeof rawBrand === "object") {
            // populated object (e.g. { _id, name }) OR maybe mongoose ObjectId (which is object but has no name)
            brandVal =
              rawBrand && (rawBrand.name || rawBrand.brand || rawBrand._id)
                ? rawBrand.name || rawBrand.brand || String(rawBrand._id)
                : "";
          } else {
            brandVal = String(rawBrand);
          }
        }

        // create normalized product copy
        return {
          ...product,
          attributes: attrs,
          brand: brandVal,
        };
      })()
    : undefined;

  const categoryDropDownList = categories.map((c) => ({
    label: c.name,
    value: c._id,
  }));

  const form = useForm<any>({
    resolver: zodResolver(addProductFormSchema),
    defaultValues: normalizedProduct
      ? normalizedProduct
      : addProductFormDefaultValues,
  });

  const isDirty = form.formState.isDirty;
  useBeforeUnload(isDirty);
  // useNavigationBlocker(isDirty);
  useNavigationBlocker(false);

  const {
    fields: variantFields,
    append,
    remove,
  } = useFieldArray({
    name: "variants",
    control: form.control,
  });

  function removeVariant(index: number) {
    remove(index);
    setThumbnail((prev) => prev.filter((_, i) => i !== index));
    setVariantImages((prev) => prev.filter((_, i) => i !== index));
  }

  function addVariant() {
    append({
      originalPrice: "",
      stocks: "",
      size: null,
      colorOption: null,
      discountPrice: "",
      bulkOrders: [],
      images: [],
    });
    setVariantImages((prev) => [...prev, []]);
  }

  function removeVariantAt(index: number) {
    removeVariant(index);
    setVariantImages((prev) => prev.filter((_, i) => i !== index));
    setThumbnail((prev) => prev.filter((_, i) => i !== index));
  }

  const crossFields = form.watch("crosssells") || [];
  function crossAppend(val: string) {
    const newCross = [...crossFields, val];
    form.setValue("crosssells", newCross);
  }
  function crossRemove(idx: number) {
    const newCross = [...crossFields];
    newCross.splice(idx, 1);
    form.setValue("crosssells", newCross);
  }

  const upsellFields = form.watch("upsells") || [];
  function addUpsell(val: string) {
    const newUpsell = [...upsellFields, val];
    form.setValue("upsells", newUpsell);
  }
  function removeUpsell(idx: number) {
    const newUpsells = [...upsellFields];
    newUpsells.splice(idx, 1);
    form.setValue("upsells", newUpsells);
  }

  const { mutate } = useMutation({
    mutationFn: (categoryId: string) => fetchSubcategories(categoryId),
    onSuccess: (data) => {
      setSubCatList(data?.subcategories || []);
    },
  });
  useEffect(() => {
    if (currCategory.name.length === 0) return;
    mutate(currCategory.val);
  }, [currCategory]);

  const subCatDropDownList = subCatList.map((el) => ({
    label: el.name,
    value: el._id,
  }));

  function mergeTags(existing: string[], incoming: string[]) {
    return Array.from(new Set([...existing, ...incoming].filter(Boolean)));
  }

  function addAddtri(attri: Record<string, string>) {
    const currentAttri = form.getValues("attributes") || [];
    const newAttris = [...currentAttri, attri];
    form.setValue("attributes", newAttris);
    setCurrentAttri({ key: "", val: "" });
  }

  function removeAttri(idx: number) {
    const attributes = [...(form.getValues("attributes") || [])];
    attributes.splice(idx, 1);
    form.setValue("attributes", attributes);
  }

  function addCaategory() {
    if (currCategory.val === "" || currSubcategory.val === "") return;
    const categories = form.getValues("category");
    const subCaategories = form.getValues("subCategory");
    form.setValue("category", [...categories, currCategory]);
    form.setValue("subCategory", [...subCaategories, currSubcategory]);
    const subCatId = currSubcategory.val;
    const subCatSelected = subCatList.find((el) => el._id === subCatId);
    setSubcategoryTagsMap((prev) => ({
      ...prev,
      [subCatId]: subCatSelected?.tags || [],
    }));
    form.setValue(
      "tags",
      mergeTags(form.getValues("tags") || [], subCatSelected?.tags || []),
    );
    setCurrCategory({ name: "", val: "" });
    setCurrSubcategory({ name: "", val: "", tags: [] });
  }

  //media
  const [thumbnail, setThumbnail] = useState<(File | null)[]>([]);
  const handleThumbnailChange = (
    e: ChangeEvent<HTMLInputElement>,
    i: number,
  ) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (file)
      setThumbnail((p) => {
        const img = [...p];
        if (img[i]) {
          img.splice(i + 1, 0, file);
        } else {
          img[i] = file;
        }
        return img;
      });
  };

  function removeThumbnail(i: number) {
    const thumbs = [...thumbnail];
    thumbs[i] = null;
    setThumbnail(thumbs);
  }

  const [images, setImages] = useState<File[]>([]);
  const handleImageChange = (
    e: ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    e.preventDefault();
    if (!e.target.files) return;
    const file = e.target.files[0];
    if (file) {
      const updatedImages = [...images];
      updatedImages[index] = file;
      setImages(updatedImages);
    }
  };
  function removeImage(i: number) {
    const imgs = [...images];
    imgs.splice(i, 1);
    setImages(imgs);
  }

  function handleVariantImagesChange(
    e: ChangeEvent<HTMLInputElement>,
    index: number,
  ) {
    const files = Array.from(e.target.files || []).slice(0, 5);
    setVariantImages((prev) => {
      const next = [...prev];
      next[index] = files;
      return next;
    });
    form.setValue(`variants.${index}.images`, files, { shouldDirty: true });
  }

  function removeVariantImage(index: number, imageIndex: number) {
    setVariantImages((prev) => {
      const next = [...prev];
      const current = [...(next[index] || [])];
      current.splice(imageIndex, 1);
      next[index] = current;
      form.setValue(`variants.${index}.images`, current, { shouldDirty: true });
      return next;
    });
  }

  const [shortVideo, setShortVideo] = useState<File | null>(null);
  function removeVideo() {
    setShortVideo(null);
  }
  const stateCodeMap: { [key: string]: string } = {
    AN: "Andaman and Nicobar",
    AP: "Andhra Pradesh",
    AR: "Arunachal Pradesh",
    AS: "Assam",
    BR: "Bihar",
    CG: "Chhattisgarh",
    CH: "Chandigarh",
    DD: "Daman and Diu",
    DL: "Delhi",
    GA: "Goa",
    GJ: "Gujarat",
    HR: "Haryana",
    HP: "Himachal Pradesh",
    JH: "Jharkhand",
    JK: "Jammu and Kashmir",
    KA: "Karnataka",
    KL: "Kerala",
    LA: "Ladakh",
    LD: "Lakshadweep",
    MH: "Maharashtra",
    ML: "Meghalaya",
    MN: "Manipur",
    MP: "Madhya Pradesh",
    MZ: "Mizoram",
    NL: "Nagaland",
    OR: "Odisha",
    PB: "Punjab",
    PY: "Puducherry",
    RJ: "Rajasthan",
    SK: "Sikkim",
    TG: "Telangana",
    TN: "Tamil Nadu",
    TR: "Tripura",
    UP: "Uttar Pradesh",
    UK: "Uttarakhand",
    WB: "West Bengal",
  };

  // Reverse mapping: state name to state code
  const stateNameToCode: { [key: string]: string } = Object.entries(stateCodeMap).reduce(
    (acc, [code, name]) => {
      acc[name] = code;
      return acc;
    },
    {} as { [key: string]: string }
  );
  const [showManuDropdown, setShowManuDropdown] = useState(false);
  const [manufacQuery, setManufacQuery] = useState("");
  const debouncedManuQuery = useDebounce(manufacQuery, 400);
  const [manufacturerList, setManufacturerList] = useState([]);
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [openAccordions, setOpenAccordions] = useState<string[]>(["1"]); 


  
  const { watch, setValue } = form;
  const watchedState = watch("dispatchState");
  const watchedDistrict = watch("dispatchDistrict");

  // ------------------ Load state names from indiaStates.rawData ------------------
  useEffect(() => {
    const stateNames = Object.keys((indiaStates as any).rawData).map(
      (code) => stateCodeMap[code] || code
    );
    
    setStates(stateNames);
  }, []);

  // ------------------ Load districts when state changes ------------------
  useEffect(() => {
  if (!watchedState) {
    setDistricts([]);
    setValue("dispatchDistrict", ""); // Only reset when state is empty
    return;
  }

  const stateCode = stateNameToCode[watchedState];
  const districtsOfState = getDistricts(stateCode) || [];

  setDistricts(districtsOfState);

  // Reset only if previous district is not in new list
  if (!districtsOfState.includes(watchedDistrict)) {
    setValue("dispatchDistrict", "");
  }
}, [watchedState, setValue]);
  // ------------------ Log selected state & district ------------------



  const { mutate: mutateManufacturer } = useMutation({
    mutationFn: searchManufacturers,
    onSuccess: (data) => {
      setManufacturerList(data);
    },
  });

  useEffect(() => {
    if (debouncedManuQuery && debouncedManuQuery.length >= 2) {
      mutateManufacturer(debouncedManuQuery);
    }
  }, [debouncedManuQuery, mutateManufacturer]);

  // const navigate = useNavigate()
  const { mutate: mutateProduct, status: postProductStatus } = useMutation({
    mutationFn: (formData: any) => postProduct(formData),
    onSuccess: () => {
      toast.success("Product added successfully");
      form.reset();
      setImages([]);
      setThumbnail([]);
      setVariantImages([]);
      setShortVideo(null);
      qc.invalidateQueries({ queryKey: ["seller-products"] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Unable to add product. Please check the form and try again."));
    },
  });

  const { mutate: putProduct, status: putProductStatus } = useMutation({
    mutationFn: (v: { formData: any; productId: string }) =>
      editProduct(v.formData, v.productId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["product", productId] });
      toast.success("Product updated");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Unable to update product. Please try again."));
    },
  });

  function onSubmit(values: any) {
    if (!product) {
      if (thumbnail.length === 0) {
        form.setError("thumbnail" as any, {
          type: "manual",
          message: "Please upload thumbnail image",
        });
        return;
      }
    }

    if (putProductStatus === "pending" || postProductStatus === "pending") {
      return;
    }

    const newForm = new FormData();
    newForm.append(
      "variants",
      JSON.stringify(
        values.variants.map((el, index) => ({
          size: el.size,
          colorOption: el.colorOption,
          originalPrice: el.originalPrice,
          discountPrice: el.discountPrice,
          stock: el.stocks,
          bulkOrders: el.bulkOrders ?? [],
          imagesCount: variantImages[index]?.length || 0,
        })),
      ),
    );

    newForm.append("shopId", shopId || seller?._id || "");
    newForm.append("name", values.name);
    // append brand if present
    if (values.brand) {
      newForm.append("brand", values.brand);
    }

    values.category.forEach((el) => {
      newForm.append("category", el.val);
    });
    values.subCategory.forEach((el) => {
      newForm.append("subCategory", el.val);
    });
    values.tags.forEach((v) => {
      newForm.append("tags", v);
    });
    newForm.append("productType", values.productType);
    if (values.intendedUse) {
      newForm.append("intendedUse", values.intendedUse);
    }
    newForm.append("sku", values.sku);
    if (values.gtin) {
      newForm.append("gtin", values.gtin);
    }
    newForm.append("hsn", values.hsn);
    if (values.unspsc) {
      newForm.append("unspsc", values.unspsc);
    }
    if (values.crosssells) {
      values.crosssells.forEach((v) => {
        newForm.append("crosssells", v);
      });
    }
    if (values.upsells) {
      values.upsells.forEach((c) => {
        newForm.append("upsells", c);
      });
    }
    values.specialityPackage.forEach((value) => {
      newForm.append("specialityPackage", value);
    });
    values.specialityPackageType.forEach((value) => {
      newForm.append("specialityPackageType", value);
    });
    newForm.append("manufacturerName", values.manufacturerName);
    newForm.append("email", values.email);
    newForm.append("phone", values.phone);
    newForm.append("origin", values.origin);
    newForm.append("shortdescription", values.shortdescription);
    newForm.append("description", values.description);
    // safe attributes serialization
    if (values.attributes) {
      values.attributes.forEach((v) => {
        newForm.append("attributes", JSON.stringify(v));
      });
    }
    newForm.append("weight", values.productWgt + " " + values.productWgtUnit);
    newForm.append(
      "dimension",
      `${values.dimension_l}x${values.dimension_h}x${values.dimension_w} ${values.dimensionUnit}`,
    );
    if (values.sterileString) {
      newForm.append("sterile", values.sterileString);
    }
    newForm.append("singleUse", values.singleUseString);
    newForm.append("manufacturingDate", values.expiry.toISOString());
    newForm.append(
      "minmaxrule",
      JSON.stringify({
        minQty: values.minmaxrule.minQty,
        maxQty: values.minmaxrule.maxQty || "",
      }),
    );
    newForm.append("taxStatus", values.taxStatus);
    if (values.taxClass) {
      newForm.append("taxClass", values.taxClass.toString());
    }
    if (values.unitOfMeasure) {
      newForm.append("unitOfMeasure", values.unitOfMeasure);
    }
    newForm.append("stockStatus", values.stockStatus);
    newForm.append("deliveryLeadTime", values.deliveryLeadTime.toString());
    if (values.warranty) {
      newForm.append("warranty", values.warranty);
    }
    newForm.append("rma", values.rma);
    newForm.append("dispatchState", values.dispatchState);
    newForm.append("dispatchDistrict", values.dispatchDistrict);
    newForm.append("dispatchPinCode", values.dispatchPinCode.toString());
    newForm.append("unitsPerCarton", values.unitsPerCarton.toString());
    newForm.append("shippingWeight", values.shippingWeight.toString());
    newForm.append("packagingType", values.packagingType);
    if (values.deliveryInstruction) {
      newForm.append("deliveryInstruction", values.deliveryInstruction);
    }
    if (values.shelfing_storage_req) {
      newForm.append("shelfing_storage_req", values.shelfing_storage_req);
    }
    if (values.purchaseNote) {
      newForm.append("purchaseNote", values.purchaseNote);
    }
    // files
    if (values.amc_cms) {
      newForm.append("amc_cms", values.amc_cms);
    }
    values.productCompilance?.forEach((c) => {
      if (c) {
        newForm.append("productCompilance", c);
      }
    });
    values.msds_ifu_leaflet?.forEach((c) => {
      if (c) {
        newForm.append("msds_ifu_leaflet", c);
      }
    });
    values.certificate.forEach((c) => {
      newForm.append("certificate", c);
    });
    if (values.oemLetter) {
      newForm.append("oemLetter", values.oemLetter);
    }
    if (values.productComparisionSheet) {
      newForm.append("productComparisionSheet", values.productComparisionSheet);
    }
    if (thumbnail) {
      thumbnail.forEach((el) => {
        if (el) {
          newForm.append("thumbnail", el);
        }
      });
    }
    variantImages.forEach((files) => {
      files.forEach((file) => {
        newForm.append("variantImages", file);
      });
    });
    images.forEach((i) => {
      newForm.append("images", i);
    });
    if (shortVideo) {
      newForm.append("shortVideo", shortVideo);
    }

    if (product) {
      newForm.delete("variants");
      putProduct({ formData: newForm, productId: productId });
      return;
    }

    mutateProduct(newForm);
  }

  function deleteCategory(i: number) {
    const cats = [...form.getValues("category")];
    const subCats = [...form.getValues("subCategory")];
    const removedSubCategory = subCats[i];
    const removedTags = removedSubCategory
      ? (removedSubCategory as any).tags || subcategoryTagsMap[removedSubCategory.val] || []
      : [];
    cats.splice(i, 1);
    subCats.splice(i, 1);
    form.setValue("category", cats);
    form.setValue("subCategory", subCats);
    if (removedTags.length > 0) {
      const currentTags = form.getValues("tags") || [];
      form.setValue(
        "tags",
        currentTags.filter((tag) => !removedTags.includes(tag)),
      );
    }
    if (removedSubCategory) {
      setSubcategoryTagsMap((prev) => {
        const next = { ...prev };
        delete next[removedSubCategory.val];
        return next;
      });
    }
  }

function switchMultiVarianMode() {
  setIsMultiVariant((p) => !p);
  form.setValue("variants", [
    {
      size: null,
      colorOption: null,
      originalPrice: "",
      discountPrice: "",
      stocks: "",
      images: [],
    },
  ]);
  setThumbnail([]);
  setVariantImages([[]]);
}




type MainAccordionTriggerProps = React.ComponentProps<
  typeof AccordionTrigger
> & {
  children?: React.ReactNode;
  className?: string;
};
const MainAccordionTrigger: React.FC<MainAccordionTriggerProps> = ({
  children,
  className = "",
  ...props
}) => (
  <AccordionTrigger
    {...props}
    className={`text-lg no-underline hover:no-underline focus:no-underline text-[#1C647C] font-semibold ${className}`}
  >
    {children}
  </AccordionTrigger>
);

type SubFormLabelProps = React.ComponentProps<typeof FormLabel> & {
  children?: React.ReactNode;
  className?: string;
};
const SubFormLabel: React.FC<SubFormLabelProps> = ({
  children,
  className = "",
  ...props
}) => (
  <FormLabel {...props} className={`text-sm text-gray-600 ${className}`}>
    {children}
  </FormLabel>
);

return (
  <Form {...form}>
    <form
        onSubmit={form.handleSubmit(
          onSubmit,
          (errors: Record<string, any>) => {
            console.log("Validation errors:", errors);
            const missingThumbnail = thumbnail.some((t) => t === null || t === undefined);
            if (missingThumbnail) {
              form.setError("thumbnail" as any, {
                type: "manual",
                message: "Please upload thumbnail image",
              });
            }
            const fieldToAccordionMap: Record<string, string> = {
              // Accordion 2
              manufacturerName: "2",
              email: "2",
              phone: "2",
              origin: "2",
              shortdescription: "2",
              description: "2",
              productWgt: "2",
              productWgtUnit: "2",
              dimension_l: "2",
              dimension_h: "2",
              dimension_w: "2",
              sterileString: "2",
              singleUseString: "2",

              // Accordion 3
              "minmaxrule.minQty": "3",
              taxStatus: "3",
              taxClass: "3",
              stockStatus: "3",
              deliveryLeadTime: "3",
              warranty: "3",
              rma: "3",

              // Accordion 4
              dispatchPinCode: "4",
              dispatchState: "4",
              dispatchDistrict: "4",
              unitsPerCarton: "4",
              shippingWeight: "4",
              packagingType: "4",
              deliveryInstruction: "4",
            };
            function getAllErrorFields(errors: any, parentKey = ""): string[] {
              let result: string[] = [];
              for (const key in errors) {
                const error = errors[key];
                const fullKey = parentKey ? `${parentKey}.${key}` : key;

                if (error?.message || error?.type) {
                  result.push(fullKey);
                } else if (typeof error === "object") {
                  result = result.concat(getAllErrorFields(error, fullKey));
                }
              }
              return result;
            }

            const errorFields = getAllErrorFields(errors);

            const accordionsToOpen = Array.from(
              new Set(errorFields.map((f) => fieldToAccordionMap[f]).filter(Boolean))
            );

            if (errorFields.some((f) => f.startsWith("variants."))) {
              accordionsToOpen.push("6");
            }

            setOpenAccordions((prev) => Array.from(new Set([...prev, ...accordionsToOpen])));
          }
        )}


        className="w-full max-w-full sm:max-w-4xl mx-auto py-6 sm:py-10 bg-white px-4 sm:px-6 rounded-lg shadow overflow-visible"
      >
       <Accordion
              type="multiple"
              value={openAccordions}
              onValueChange={(values) => setOpenAccordions(values)}
            >

          <AccordionItem value="1">
            <MainAccordionTrigger>
              Product Identification & Classification
            </MainAccordionTrigger>
            <AccordionContent className="px-2 sm:px-4 pt-2 pb-6 space-y-4 overflow-visible">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <Subformlabel required>Product Name</Subformlabel>
                    <FormControl>
                      <Input type="text" {...field} className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({}) => (
                    <FormItem>
                      <div className="flex">
                      <Subformlabel required>Product Category</Subformlabel>
                      <InfoTooltip description="Select the main category that best describes your product. This helps organize your products and makes it easier for customers to find them" />
                      </div>
                    
                      <FormControl>
                        <>
                          {form.getValues("category").map((el) => (
                            <Input
                              value={el.name}
                              key={"cat-" + el.val}
                              readOnly
                              className="w-full mb-2"
                            />
                          ))}
                          <Autocomplete
                            listItems={categoryDropDownList}
                            placeholder="Select category..."
                            value={currCategory.val}
                            setValue={(value) => {
                              const catName =
                                categoryDropDownList.find(
                                  (el) => el.value === value,
                                )?.label || "";
                              setCurrCategory({ name: catName, val: value });
                            }}
                          />
                        </>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subCategory"
                  render={({}) => (
                    <FormItem>
                      <div className="flex" >
                         <Subformlabel required>Product SubCategory</Subformlabel>
                         <InfoTooltip description="Choose a more specific category under the primary category to narrow down your product classification"/>
                      </div>
                      
                      <FormControl>
                        <>
                          {form.getValues("subCategory").map((el, i) => (
                            <article
                              className="grid grid-cols-[1fr_50px] items-center gap-3 mb-2"
                              key={"subcat-" + el.val}
                            >
                              <Input
                                value={el.name}
                                readOnly
                                className="w-full"
                              />
                              <Button
                                key={el.val}
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteCategory(i)}
                              >
                                <IoRemoveCircle />
                              </Button>
                            </article>
                          ))}
                          <article className="grid grid-cols-[1fr_50px] items-center gap-3">
                            <Autocomplete
                              listItems={subCatDropDownList}
                              placeholder="Select subcategory..."
                              value={currSubcategory.val}
                              setValue={(value) => {
                                const subCatName =
                                  subCatDropDownList.find(
                                    (el) => el.value === value,
                                  )?.label || "";
                                setCurrSubcategory({
                                  name: subCatName,
                                  val: value,
                                  tags:
                                    subCatList.find((el) => el._id === value)
                                      ?.tags || [],
                                });
                              }}
                            />
                            <Button
                              variant="secondary"
                              size="sm"
                              type="button"
                              onClick={addCaategory}
                            >
                              Add
                            </Button>
                          </article>
                        </>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex" >
                         <Subformlabel required>Brand</Subformlabel>
                         <InfoTooltip description="Enter the brand name of the product. This is useful if your product is part of a recognized brand."/>
                      </div>
                    <FormControl>
                      <Input
                        type="text"
                        {...field}
                        className="w-full"
                        placeholder="Brand name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex" >
                         <Subformlabel required>Product Tag</Subformlabel>
                         <InfoTooltip description="Add keywords that describe your product. Tags help improve searchability and visibility on the platform"/>
                      </div>
                    <FormControl>
                      <TagsInput
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Enter product tags"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-3">
                <FormField
                  control={form.control}
                  name="productType"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex" >
                         <Subformlabel required>Product Type</Subformlabel>
                         <InfoTooltip description="Select the type of product. This is usually a more detailed classification than category and subcategory"/>
                      </div>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select product type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Non-Replaceable">
                            Non-Replaceable
                          </SelectItem>
                          <SelectItem value="Replaceable">
                            Replaceable
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 items-start gap-3 sm:gap-4">
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex" >
                         <Subformlabel required>Product SKU</Subformlabel>
                         <InfoTooltip description="Enter your product’s Stock Keeping Unit (SKU), a unique identifier used for inventory management"/>
                      </div>
                      <FormControl>
                        <Input type="text" {...field} className="w-full" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gtin"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex" >
                         <SubFormLabel>GSTIN</SubFormLabel>
                         <InfoTooltip description="Provide the Goods and Services Tax Identification Number (GSTIN) for the product if applicable. This is used for taxation purposes"/>
                      </div>
                      <FormControl>
                        <Input type="text" {...field} className="w-full" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hsn"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex" >
                         <Subformlabel required >HSN Code</Subformlabel>
                         <InfoTooltip description="Enter the Harmonized System of Nomenclature (HSN) code, which classifies products for taxation"/>
                      </div>
                      <FormControl>
                        <Input type="text" {...field} className="w-full" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unspsc"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex" >
                         <SubFormLabel> UNSPSC Code</SubFormLabel>
                        
                         <InfoTooltip description="Enter the UNSPSC code for your product, a global classification system used for business and procurement"/>
                      </div>
                      <FormControl>
                        <Input type="text" {...field} className="w-full" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormItem>
                <div className="flex" >
                         <SubFormLabel>Upsell Product URLs</SubFormLabel>
                         <InfoTooltip description="Add links to products you want to recommend as an upgrade to this product. Upselling encourages customers to buy a more expensive item"/>
                      </div>
                <div className="space-y-2">
                  {upsellFields.map((_field, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                      {...form.register(`upsells.${index}`, {
                        pattern: {
                          value: /^https:\/\/semamart\.com\/.+/,
                          message: "Only Semamart product URLs are allowed",
                        },
                      })}
                      placeholder="Enter Semamart product URL"
                      className="w-full"
                    />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeUpsell(index)}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addUpsell("")}
                    disabled={upsellFields.length >= 5}
                  >
                    + Add Upsell
                  </Button>
                </div>
                <FormMessage />
              </FormItem>

              <FormItem>
                <div className="flex" >
                         <SubFormLabel>Cross-sell Product URLs</SubFormLabel>
                         <InfoTooltip description="Add links to related products that can be bought together with this product. Cross-selling increases overall sales by suggesting complementary items"/>
                      </div>
                <div className="space-y-2">
                  {crossFields.map((_field, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                          {...form.register(`crosssells.${index}`, {
                            pattern: {
                              value: /^https:\/\/semamart\.com\/.+/,
                              message: "Only Semamart product URLs are allowed",
                            },
                          })}
                          placeholder="Enter Semamart product URL"
                          className="w-full"
                        />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => crossRemove(index)}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => crossAppend("")}
                    disabled={crossFields.length >= 5}
                  >
                    + Add Cross-sell
                  </Button>
                </div>
                <FormMessage />
              </FormItem>

              <FormField
                control={form.control}
                name="specialityPackage"
                render={({}) => (
                  <FormItem>
                      <div className="flex" >
                         <SubFormLabel>Speciality Package</SubFormLabel>
                         <InfoTooltip description="Select a predefined healthcare setup package based on the medical specialty or facility you want to establish. These packages include relevant equipment and configurations tailored to specific healthcare needs"/>
                      </div>
                    <FormControl>
                      <SpecialityDropdown
                        values={Array.from({
                          length: Math.max(
                            (form.watch("specialityPackage")?.length || 0),
                            (form.watch("specialityPackageType")?.length || 0),
                            1,
                          ),
                        }).map((_, index) => ({
                          packageId: getSelectValue(
                            form.watch("specialityPackage")?.[index],
                          ),
                          typeId: getSelectValue(
                            form.watch("specialityPackageType")?.[index],
                          ),
                        }))}
                        onChange={(rows) => {
                          form.setValue(
                            "specialityPackage",
                            rows
                              .filter((row) => row.packageId)
                              .map((row) => ({
                                name: row.packageId,
                                val: row.packageId,
                              })),
                            { shouldDirty: true, shouldTouch: true },
                          );
                          form.setValue(
                            "specialityPackageType",
                            rows
                              .filter((row) => row.typeId)
                              .map((row) => ({
                                name: row.typeId,
                                val: row.typeId,
                              })),
                            { shouldDirty: true, shouldTouch: true },
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="2">
            <MainAccordionTrigger>
              Product Description & Specifications
            </MainAccordionTrigger>
            <AccordionContent className="px-2 sm:px-4 pt-2 pb-6 space-y-4">
              <FormField
                control={form.control}
                name="manufacturerName"
                render={({ field }) => (
                  <FormItem>
                    <Subformlabel required>Manufacturer Name</Subformlabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="text"
                          {...field}
                          className="w-full"
                          onChange={(e) => {
                            setManufacQuery(e.target.value);
                            setShowManuDropdown(true);
                            field.onChange(e.target.value);
                          }}
                        />
                        {showManuDropdown && manufacturerList?.length > 0 && (
                          <ul className="border p-2 max-h-48 overflow-y-auto absolute bg-white shadow inset-x-0 z-[900] sm:max-w-md">
                            {manufacturerList.map((m: any) => (
                              <li
                                key={m._id}
                                className="py-1 border-b last:border-none"
                              >
                                <button
                                  type="button"
                                  className="w-full text-left"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    form.setValue(
                                      "manufacturerName",
                                      m.manufacturerName,
                                    );
                                    form.setValue("origin", m.origin);
                                    form.setValue("phone", m.phone);
                                    form.setValue("email", m.email);
                                    setShowManuDropdown(false);
                                    setManufacturerList([]);
                                  }}
                                >
                                  {m.manufacturerName} ({m.origin})
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Subformlabel required>Manufacturer email</Subformlabel>
                    <FormControl>
                      <Input type="text" {...field} className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <Subformlabel required>Manufacturer Phone</Subformlabel>
                    <FormControl>
                      <Input type="text" {...field} className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="origin"
                render={({ field }) => (
                  <FormItem>
                    
                    <div className="flex" >
                         <Subformlabel required>Product Origin</Subformlabel>
                         <InfoTooltip description="Where the product is made or manufactured (for example: India, China, Germany)."/>
                      </div>
                    <FormControl>
                      <Input type="text" {...field} className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shortdescription"
                render={({ field }) => (
                  <FormItem>
                    
                    <div className="flex" >
                         <Subformlabel required>Short Description</Subformlabel>
                         <InfoTooltip description="A brief summary of the product in 1–2 lines"/>
                      </div>
                    <FormControl>
                      <Textarea className="resize-none w-full" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    
                    <div className="flex" >
                         <Subformlabel required>Detailed Specification</Subformlabel>
                         <InfoTooltip description="Complete technical details of the product such as material, size, capacity, standards, or special features"/>
                      </div>
                    <FormControl>
                      <Textarea className="resize-none w-full" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="attributes"
                render={({ field }) => {
                  const attrs = field.value || [];
                  return (
                    <FormItem>
                      
                      <div className="flex" >
                         <SubFormLabel>Custom Attributes</SubFormLabel>
                         <InfoTooltip description="Use this to add extra product details that are not listed elsewhere"/>
                      </div>
                      <FormControl>
                        <>
                          {attrs.map((e, i) => (
                            <div className="flex gap-3 mb-3" key={i}>
                              <Input
                                value={Object.keys(e)[0]}
                                readOnly
                                className="w-2/5"
                              />
                              <Input
                                value={Object.values(e)[0]}
                                readOnly
                                className="w-3/5"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                onClick={() => {
                                  removeAttri(i);
                                }}
                              >
                                <IoRemoveCircle />
                              </Button>
                            </div>
                          ))}
                          <div className="flex gap-3">
                            <Input
                              placeholder="Attribute name"
                              value={currentAttri.key}
                              onChange={(e) => {
                                setCurrentAttri((p) => ({
                                  ...p,
                                  key: e.target.value,
                                }));
                              }}
                              className="w-1/2"
                            />
                            <Input
                              placeholder="Attribute value"
                              value={currentAttri.val}
                              onChange={(e) => {
                                setCurrentAttri((p) => ({
                                  ...p,
                                  val: e.target.value,
                                }));
                              }}
                              className="w-1/2"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => {
                                if (
                                  !currentAttri.key?.trim() ||
                                  !currentAttri.val?.trim()
                                ) {
                                  toast.warn(
                                    "Attribute name and value are required",
                                  );
                                  return;
                                }
                                addAddtri({
                                  [currentAttri.key.trim()]:
                                    currentAttri.val.trim(),
                                });
                              }}
                            >
                              Add
                            </Button>
                          </div>
                        </>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <section className="grid grid-cols-1 sm:grid-cols-2 items-end gap-3">
                <FormField
                  control={form.control}
                  name="productWgt"
                  render={({ field }) => (
                    <FormItem>
                      <Subformlabel required >Product Weight</Subformlabel>
                      <FormControl>
                        <Input type="number" {...field} className="w-full" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="productWgtUnit"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select weight unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="kg">Kg</SelectItem>
                          <SelectItem value="grams">Grams</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              {/* --------- Product dimensions (LxHxW) - show 4 side-by-side on desktop --------- */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                <FormField
                  control={form.control}
                  name="dimension_l"
                  render={({ field }) => (
                    <FormItem>
                      <SubFormLabel>Length</SubFormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          placeholder="Length"
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dimension_h"
                  render={({ field }) => (
                    <FormItem>
                      <SubFormLabel>Height</SubFormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          placeholder="Height"
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dimension_w"
                  render={({ field }) => (
                    <FormItem>
                      <SubFormLabel>Width</SubFormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          placeholder="Width"
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dimensionUnit"
                  render={({ field }) => (
                    <FormItem>
                      <Subformlabel required>Dimension Unit</Subformlabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cm">cm</SelectItem>
                            <SelectItem value="meter">meter</SelectItem>
                            <SelectItem value="inch">inch</SelectItem>
                            <SelectItem value="feet">feet</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="sterileString"
                  render={({ field }) => (
                    <FormItem>
                      
                      <div className="flex" >
                         <Subformlabel required>Sterile Product</Subformlabel>
                         <InfoTooltip description="Select Yes if the product is sterilized and safe for medical use.Select No if it is non-sterile."/>
                      </div>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="singleUseString"
                  render={({ field }) => (
                    <FormItem>
                      
                      <div className="flex" >
                         <Subformlabel required>Single Use Product</Subformlabel>
                         <InfoTooltip description="Select Yes if the product can be used only once and must be discarded after use.Select No if it can be reused."/>
                      </div>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiry"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <SubFormLabel>Manufacturing Date</SubFormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                             captionLayout="dropdown"     // ✅ enables month + year dropdown
 
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="3">
            <MainAccordionTrigger>Commercials</MainAccordionTrigger>
            <AccordionContent className="px-2 sm:px-4 pt-2 pb-6 space-y-4">
              <section className="grid grid-cols-1 gap-3">
                <FormField
                  control={form.control}
                  name="minmaxrule.minQty"
                  render={({ field }) => (
                    <FormItem>                     
                      <div className="flex" >
                         <Subformlabel required>Minimum Order Quantity</Subformlabel>
                         <InfoTooltip description="The minimum number of units a buyer must purchase in a single order"/>
                      </div>
                      <FormControl>
                       <Input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          {...field}
                          className="w-full"
                        />

                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              <section className="grid grid-cols-1 sm:grid-cols-2 items-start gap-3">
                <FormField
                  control={form.control}
                  name="taxStatus"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex" >
                         <Subformlabel required>Tax Status</Subformlabel>
                         <InfoTooltip description="Select how tax is applied to this product (e.g., taxable, non-taxable, or exempt)"/>
                      </div>
                      <Select
                        onValueChange={(e) => {
                          form.setValue("taxClass", "0");
                          field.onChange(e);
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="taxable">Taxable</SelectItem>
                          <SelectItem value="shipping only">
                            Shipping only
                          </SelectItem>
                         
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {form.watch("taxStatus") === "taxable" && (
                  <FormField
                    control={form.control}
                    name="taxClass"
                    render={({ field }) => (
                      <FormItem>
                        <SubFormLabel>Tax Class</SubFormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0">0%</SelectItem>
                            <SelectItem value="5">5%</SelectItem>
                            <SelectItem value="10">10%</SelectItem>
                            <SelectItem value="12">12%</SelectItem>
                            <SelectItem value="18">18%</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </section>

              <FormField
                control={form.control}
                name="unitOfMeasure"
                render={({ field }) => (
                  <FormItem>
                    
                    <div className="flex" >
                         <SubFormLabel>Unit of Measure</SubFormLabel>
                         <InfoTooltip description="The unit in which the product is sold Examples: Piece, Box, Kg, Liter"/>
                      </div>
                    <FormControl>
                      <Input {...field} className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="stockStatus"
                  render={({ field }) => (
                    <FormItem>
                      <Subformlabel required>Stock Status</Subformlabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="In stock">In Stock</SelectItem>
                          <SelectItem value="Out of stock">
                            Out of stock
                          </SelectItem>
                          <SelectItem value="On backorder">
                            On backorder
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deliveryLeadTime"
                  render={({ field }) => (
                    <FormItem>
                      <Subformlabel required>
                        Delivery Leading Time (in days)
                      </Subformlabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="w-full"
                          placeholder="Example: 6 or 6-8"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="warranty"
                  render={({ field }) => (
                    <FormItem>
                      <Subformlabel required>Warranty (in year)</Subformlabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="w-full"
                          placeholder="0, 1, 2..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              <FormField
                control={form.control}
                name="rma"
                render={({ field }) => (
                  <FormItem>
                    <Subformlabel required>
                      RMA (Return merchandise authorization) Policy
                    </Subformlabel>
                    <FormControl>
                      <Textarea className="resize-none w-full" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="4">
            <MainAccordionTrigger>
              {" "}
              Logistics & Fulfillment
            </MainAccordionTrigger>
            <AccordionContent className="px-2 sm:px-4 pt-2 pb-6 space-y-4">
              <div className="flex gap-4">
      {/* State Dropdown */}
      <FormField
        control={form.control}
        name="dispatchState"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-2">
           <Subformlabel required>Dispatch State</Subformlabel>
            <FormControl>
              <Select
                onValueChange={(val) => setValue("dispatchState", val)}
                value={field.value || ""}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* District Dropdown */}
      <FormField
        control={form.control}
        name="dispatchDistrict"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-2">
            <Subformlabel required>Dispatch District</Subformlabel>
            <FormControl>
              <Select
                onValueChange={(val) => setValue("dispatchDistrict", val)}
                value={field.value || ""}
                disabled={districts.length === 0}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select District" />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>


              <FormField
                control={form.control}
                name="dispatchPinCode"
                render={({ field }) => (
                  <FormItem>
                    <Subformlabel required>Pincode of Dispatch</Subformlabel>
                    <FormControl>
                      <Input {...field} className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unitsPerCarton"
                render={({ field }) => (
                  <FormItem>
                    <Subformlabel required>No. of units per master carton</Subformlabel>
                    <FormControl>
                      <Input {...field} className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shippingWeight"
                render={({ field }) => (
                  <FormItem>
                    <Subformlabel required>Shipping Weight (in kgs)</Subformlabel>
                    <FormControl>
                      <Input {...field} className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="packagingType"
                render={({ field }) => (
                  <FormItem>
                    <Subformlabel required>Packaging Type</Subformlabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Eg. box, polywrap etc."
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deliveryInstruction"
                render={({ field }) => (
                  <FormItem>
                    <Subformlabel required>Delivery Instructions</Subformlabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select special delivery instrucitons." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Fragile">Fragile</SelectItem>
                        <SelectItem value="Non-Fragile">Non-Fragile</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shelfing_storage_req"
                render={({ field }) => (
                  <FormItem>
                    <SubFormLabel>Shelfing / Storage requirements</SubFormLabel>
                    <FormControl>
                      <Textarea className="resize-none w-full" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purchaseNote"
                render={({ field }) => (
                  <FormItem>
                    <SubFormLabel>Purchase Note</SubFormLabel>
                    <FormControl>
                      <Textarea className="resize-none w-full" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>

          {!product && (
            <AccordionItem value="5">
              <MainAccordionTrigger>Documents Uploads</MainAccordionTrigger>
              <AccordionContent className="px-2 sm:px-4 pt-2 pb-6 space-y-4">
                <FormField
                  control={form.control}
                  name="amc_cms"
                  render={({ field }) => (
                    <FormItem>
                      <SubFormLabel>AMC / CMS Available</SubFormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          onChange={(e) => {
                            if (e.target.files) {
                              field.onChange(e.target.files[0]);
                            }
                          }}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="certificate"
                  render={({ field }) => (
                    <FormItem>
                      <SubFormLabel>
                        Certifications / Test Reports{" "}
                      </SubFormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          multiple
                          onChange={(e) => {
                            if (e.target.files) {
                              field.onChange(Array.from(e.target.files));
                            }
                          }}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="oemLetter"
                  render={({ field }) => (
                    <FormItem>
                      <SubFormLabel>OEM Authorization Letter</SubFormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          onChange={(e) => {
                            if (e.target.files) {
                              field.onChange(e.target.files[0]);
                            }
                          }}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {!product && (
                <>
                  <FormField
                    control={form.control}
                    name="productCompilance"
                    render={({ field }) => (
                      <FormItem>
                       
                        <div className="flex" >
                          <SubFormLabel>
                          Product Compilance Documents
                        </SubFormLabel>
                         <InfoTooltip description="Upload official certificates or documents related to product standards or approvals (e.g., ISO, CE, FDA certificates)"/>
                      </div>
                        <FormControl>
                          <Input
                            multiple
                            type="file"
                            onChange={(e) => {
                              if (e.target.files) {
                                field.onChange(Array.from(e.target.files));
                              }
                            }}
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* <FormField
                    control={form.control}
                    name="msds_ifu_leaflet"
                    render={({ field }) => (
                      <FormItem>
                        <SubFormLabel>
                          Upload MSDS / IFU / Leaflet{" "}
                        </SubFormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            multiple
                            onChange={(e) => {
                              if (e.target.files) {
                                field.onChange(Array.from(e.target.files));
                              }
                            }}
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}
                </>
              )}
              </AccordionContent>
            </AccordionItem>
          )}

          <AccordionItem value="6">
            <MainAccordionTrigger>
              {product ? "Media and Variants" : "Pricing and Media"}
            </MainAccordionTrigger>
            {product ? (
              <AccordionContent className="px-2 sm:px-4 pt-2 pb-6 space-y-4">
               <VariantsDisplay minQty={Number(form.getValues("minmaxrule.minQty"))} />
                <MediaDisplay />
              </AccordionContent>
            ) : (
              <AccordionContent className="px-2 sm:px-4 pt-2 pb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-6">
                  <SubFormLabel className="text-[16px] font-normal">
                    Does this product have multiple variants (sizes/colors)?
                  </SubFormLabel>
                  <Checkbox
                    checked={isMultiVariant}
                    onCheckedChange={switchMultiVarianMode}
                    className="bg-light-blue! text-blue-800!"
                  />
                </div>

                <div className="my-6 space-y-4">
                  <div className="space-y-3">
                    {variantFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="bg-gray-50 p-3 rounded-md sm:p-4"
                      >
                        <AddProductFormVariants
                          index={index}
                          field={field}
                          handleThumbnailChange={handleThumbnailChange}
                          thumbnail={thumbnail}
                          form={form}
                          removeVariant={removeVariantAt}
                          isMultiVariant={isMultiVariant}
                          thumbnailError={
                            (form.formState.errors as any).thumbnail
                          }
                          removeThumbnail={removeThumbnail}
                          variantImages={variantImages}
                          setVariantImages={setVariantImages}
                          // minQty={Number(form.getValues("minmaxrule.minQty"))}
                        />
                      </div>
                    ))}
                    {isMultiVariant && (
                      <article className="flex justify-end">
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="bg-green-100 cursor-pointer"
                          onClick={addVariant}
                        >
                          <AiOutlinePlusCircle className="text-green-500" />
                        </Button>
                      </article>
                    )}
                  </div>
                </div>

                <section className="space-y-4 mt-4">
                  <div>
                    <SubFormLabel>Upload other images</SubFormLabel>
                    <div className="flex gap-3 flex-wrap mt-2">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div
                          key={index}
                          className="border relative border-gray-300 h-[90px] w-[90px] sm:h-[120px] sm:w-[120px] flex items-center justify-center rounded-md cursor-pointer overflow-hidden"
                        >
                          <label
                            htmlFor={`uploadImage-${index}`}
                            className="cursor-pointer w-full h-full block"
                          >
                            {images[index] ? (
                              <div className="h-full w-full relative">
                                <img
                                  src={URL.createObjectURL(images[index])}
                                  alt={`Image-${index + 1}`}
                                  className="h-full w-full object-cover"
                                />
                                <Button
                                  size="icon"
                                  variant="destructive"
                                  className="absolute top-1 right-1"
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    removeImage(index);
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <AiOutlinePlusCircle size={30} color="#555" />
                              </div>
                            )}
                          </label>
                          <input
                            type="file"
                            id={`uploadImage-${index}`}
                            className="hidden"
                            onChange={(e) => handleImageChange(e, index)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <SubFormLabel>Upload Product Video</SubFormLabel>
                    <div className="border border-gray-300 h-[90px] w-[90px] sm:h-[120px] sm:w-[120px] flex items-center justify-center rounded-md cursor-pointer mt-2 relative overflow-hidden">
                      <label
                        htmlFor="uploadShortVideo"
                        className="cursor-pointer w-full h-full grid place-items-center"
                      >
                        {shortVideo ? (
                          <div className="h-full w-full relative">
                            <video
                              controls={true}
                              src={URL.createObjectURL(shortVideo)}
                              className="h-full w-full object-cover"
                            />
                            <Button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                removeVideo();
                              }}
                              variant="destructive"
                              className="absolute top-1 right-1 p-1"
                              size="icon"
                              type="button"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <AiOutlinePlusCircle size={30} color="#555" />
                        )}
                      </label>
                    </div>
                    <input
                      type="file"
                      id="uploadShortVideo"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && file.size > 5 * 1024 * 1024) {
                          toast.error("Video size should not exceed 5MB.");
                          return;
                        }
                        if (file) {
                          setShortVideo(file);
                        }
                      }}
                    />
                  </div>
                </section>
              </AccordionContent>
            )}
          </AccordionItem>
        </Accordion>

        {product && <DocumentsDisplay />}

        <div className="flex items-center justify-end gap-2 mt-4">
          {/* Cancel button — navigates back */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mr-2"
          >
            Cancel
          </Button>

          {/* Submit */}
          <Button
            type="submit"
            variant="outline"
            size="sm"
            disabled={
              putProductStatus === "pending" || postProductStatus === "pending"
            }
          >
            {putProductStatus === "pending" || postProductStatus === "pending"
              ? "Wait..."
              : "Submit"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

async function fetchSubcategories(categoryId: string) {
  if (categoryId.trim() === "") return;
  const url = API_URL + "category/" + categoryId;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load subcategories");
  const data = (await res.json()) as CategoryDetailApiRes;
  return data;
}

async function postProduct(formData: FormData) {
  const res = await fetch(API_URL + "product/create-product-v2", {
    method: "post",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(await getApiErrorMessage(res, "Failed to create product"));
  }
}

async function editProduct(formData: FormData, productId: string) {
  const res = await fetch(API_URL + "product/update-product/" + productId, {
    method: "PUT",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(await getApiErrorMessage(res, "Failed to update product"));
  }
}

function useBeforeUnload(when: boolean) {
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (when) {
        event.preventDefault();
        event.returnValue = ""; // for old browsers
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [when]);
}

function useNavigationBlocker(when: boolean) {
  const blocker = useBlocker(when);

  useEffect(() => {
    if (blocker.state === "blocked") {
      const confirm = window.confirm(
        "You have unsaved changes. Are you sure you want to leave this page?",
      );
      if (confirm) blocker.proceed();
      else blocker.reset();
    }
  }, [blocker]);
}

async function searchManufacturers(query: string) {
  const res = await fetch(`${API_URL}manufacturer/search?q=${query}`);
  if (!res.ok) throw new Error("Failed to search manufacturers");
  return res.json();
}
