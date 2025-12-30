import { addProductFormSchema } from "@/Screens/Seller/addProductFormSchema";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import AddProductFormVariants from "./AddProductFormVariants";
import { useBlocker, useNavigate } from "react-router";
import { useDebounce } from "@/hooks";

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

type ProductFormType = z.infer<typeof addProductFormSchema>;

export default function AddProductForm({
  multiVariant = false,
  categories,
  product,
  productId,
}: AddProductFormProps) {
  const [subCatList, setSubCatList] = useState<SubCategory[]>([]);
  const [currentAttri, setCurrentAttri] = useState({ key: "", val: "" });
  const seller = useSellerStore((state) => state.seller);
  const [currCategory, setCurrCategory] = useState({ name: "", val: "" });
  const [currSubcategory, setCurrSubcategory] = useState({ name: "", val: "" });
  const [isMultiVariant, setIsMultiVariant] = useState(multiVariant);

  const qc = useQueryClient();
  const navigate = useNavigate();

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

  const form = useForm<ProductFormType>({
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
    remove: removeVariant,
  } = useFieldArray({
    name: "variants",
    control: form.control,
  });

  function addVariant() {
    append({
      originalPrice: "",
      stocks: "",
      size: null,
      colorOption: null,
      discountPrice: "",
      bulkOrders: [],
    });
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

  useEffect(() => {
    const subCatId = currSubcategory.val;
    const subCatSelected = subCatList.find((el) => el._id === subCatId);
    form.setValue("tags", [
      ...form.getValues("tags"),
      ...(subCatSelected?.tags || []),
    ]);
  }, [form.watch("subCategory")]);

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
    form.setValue("tags", [
      ...form.getValues("tags"),
      ...(subCatSelected?.tags || []),
    ]);
    setCurrCategory({ name: "", val: "" });
    setCurrSubcategory({ name: "", val: "" });
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

  const [shortVideo, setShortVideo] = useState<File | null>(null);
  function removeVideo() {
    setShortVideo(null);
  }

  const [showManuDropdown, setShowManuDropdown] = useState(false);
  const [manufacQuery, setManufacQuery] = useState("");
  const debouncedManuQuery = useDebounce(manufacQuery, 400);
  const [manufacturerList, setManufacturerList] = useState([]);

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
      setShortVideo(null);
      qc.invalidateQueries({ queryKey: ["seller-products"] });
    },
    onError: () => {
      toast.error("Something went wrong!!");
    },
  });

  const { mutate: putProduct, status: putProductStatus } = useMutation({
    mutationFn: (v: { formData: any; productId: string }) =>
      editProduct(v.formData, v.productId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["product", productId] });
      toast.success("Product updated");
    },
    onError: () => {
      toast.error("Something went wrong!");
    },
  });

  function onSubmit(values: z.infer<typeof addProductFormSchema>) {
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
        values.variants.map((el) => ({
          size: el.size,
          colorOption: el.colorOption,
          originalPrice: el.originalPrice,
          discountPrice: el.discountPrice,
          stock: el.stocks,
          bulkOrders: el.bulkOrders ?? [],
        })),
      ),
    );

    newForm.append("shopId", seller?._id || "");
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
    if (values.specialityPackage) {
      newForm.append("specialityPackage", values.specialityPackage);
    }
    if (values.specialityPackageType) {
      newForm.append("specialityPackageType", values.specialityPackageType);
    }
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
    newForm.append("dispatchLocation", values.dispatchLocation);
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
    cats.splice(i, 1);
    subCats.splice(i, 1);
    form.setValue("category", cats);
    form.setValue("subCategory", subCats);
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
      },
    ]);
    setThumbnail([]);
  }

  /**
   * Small style wrappers (DRY):
   * - MainAccordionTrigger: heading style (no underline on hover + distinct color)
   * - SubFormLabel: muted, smaller sublabel style
   *
   * These accept all normal props so they can replace AccordionTrigger/FormLabel directly.
   */
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

  /* SubFormLabel: typed to match FormLabel's props */
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
        onSubmit={form.handleSubmit(onSubmit, (e) => {
          console.log(e);
          const missingThumbnail = thumbnail.some(
            (t) => t === null || t === undefined,
          );
          if (missingThumbnail) {
            form.setError("thumbnail" as any, {
              type: "manual",
              message: "Please upload thumbnail image",
            });
          }
        })}
        className="w-full max-w-full sm:max-w-4xl mx-auto py-6 sm:py-10 bg-white px-4 sm:px-6 rounded-lg shadow"
      >
        <Accordion type="multiple" defaultValue={["1"]}>
          <AccordionItem value="1">
            <MainAccordionTrigger>
              Product Identification & Classification
            </MainAccordionTrigger>
            <AccordionContent className="px-2 sm:px-4 pt-2 pb-6 space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <SubFormLabel>Product Name</SubFormLabel>
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
                      <SubFormLabel>Primary category</SubFormLabel>
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
                      <SubFormLabel>Subcategory</SubFormLabel>
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
                    <SubFormLabel>Brand</SubFormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        {...field}
                        className="w-full"
                        placeholder="Brand name (optional)"
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
                    <SubFormLabel>Product Tags</SubFormLabel>
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
                      <SubFormLabel>Product Type</SubFormLabel>
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
                      <SubFormLabel>Product SKU</SubFormLabel>
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
                      <SubFormLabel>GSTIN</SubFormLabel>
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
                      <SubFormLabel>HSN Code</SubFormLabel>
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
                      <SubFormLabel>
                        UNSPSC (United Nations Standard Products and Services
                        Code)
                      </SubFormLabel>
                      <FormControl>
                        <Input type="text" {...field} className="w-full" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormItem>
                <SubFormLabel>Upsell Product URLs</SubFormLabel>
                <div className="space-y-2">
                  {upsellFields.map((_field, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        {...form.register(`upsells.${index}`)}
                        placeholder="Enter product URL"
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
                <SubFormLabel>Cross-sell Product URLs</SubFormLabel>
                <div className="space-y-2">
                  {crossFields.map((_field, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        {...form.register(`crosssells.${index}`)}
                        placeholder="Enter product URL"
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
                    <SubFormLabel>Speciality Package</SubFormLabel>
                    <FormControl>
                      <SpecialityDropdown
                        viewMode={product ? true : false}
                        value={form.watch("specialityPackage") || ""}
                        setValue={(v) => {
                          form.setValue("specialityPackage", v);
                        }}
                        packageTypeValue={
                          form.watch("specialityPackageType") || ""
                        }
                        setPackageValue={(v) => {
                          form.setValue("specialityPackageType", v);
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
                    <SubFormLabel>Manufacturer Name</SubFormLabel>
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
                    <SubFormLabel>Manufacturer email</SubFormLabel>
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
                    <SubFormLabel>Manufacturer Phone</SubFormLabel>
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
                    <SubFormLabel>Product Origin</SubFormLabel>
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
                    <SubFormLabel>Short Description</SubFormLabel>
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
                    <SubFormLabel>Detailed Specification</SubFormLabel>
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
                      <SubFormLabel>Custom Attributes</SubFormLabel>
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
                      <SubFormLabel>Product Weight</SubFormLabel>
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
                      <SubFormLabel>Dimension Unit</SubFormLabel>
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
                      <SubFormLabel>Sterile Product</SubFormLabel>
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
                      <SubFormLabel>Single Use Product</SubFormLabel>
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

              {!product && (
                <>
                  <FormField
                    control={form.control}
                    name="productCompilance"
                    render={({ field }) => (
                      <FormItem>
                        <SubFormLabel>
                          Product Compilance Documents
                        </SubFormLabel>
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

          <AccordionItem value="3">
            <MainAccordionTrigger>Commercials</MainAccordionTrigger>
            <AccordionContent className="px-2 sm:px-4 pt-2 pb-6 space-y-4">
              <section className="grid grid-cols-1 gap-3">
                <FormField
                  control={form.control}
                  name="minmaxrule.minQty"
                  render={({ field }) => (
                    <FormItem>
                      <SubFormLabel>Minimum Order Quantity</SubFormLabel>
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
                      <SubFormLabel>Tax Status</SubFormLabel>
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
                          <SelectItem value="none">None</SelectItem>
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
                    <SubFormLabel>Unit of Measure</SubFormLabel>
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
                      <SubFormLabel>Stock Status</SubFormLabel>
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
                      <SubFormLabel>
                        Delivery Leading Time (in days)
                      </SubFormLabel>
                      <FormControl>
                        <Input {...field} className="w-full" />
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
                      <SubFormLabel>Warranty (in year)</SubFormLabel>
                      <FormControl>
                        <Input {...field} className="w-full" />
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
                    <SubFormLabel>
                      RMA (Return merchandise authorization) Policy
                    </SubFormLabel>
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
              <FormField
                control={form.control}
                name="dispatchLocation"
                render={({ field }) => (
                  <FormItem>
                    <SubFormLabel>Dispatch Location</SubFormLabel>
                    <FormControl>
                      <Input {...field} className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dispatchPinCode"
                render={({ field }) => (
                  <FormItem>
                    <SubFormLabel>Pincode of Dispatch</SubFormLabel>
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
                    <SubFormLabel>No. of units per master carton</SubFormLabel>
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
                    <SubFormLabel>Shipping Weight (in kgs)</SubFormLabel>
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
                    <SubFormLabel>Packaging Type</SubFormLabel>
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
                    <SubFormLabel>Delivery Instructions</SubFormLabel>
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
              </AccordionContent>
            </AccordionItem>
          )}

          <AccordionItem value="6">
            <MainAccordionTrigger>
              {product ? "Media and Variants" : "Pricing and Media"}
            </MainAccordionTrigger>
            {product ? (
              <AccordionContent className="px-2 sm:px-4 pt-2 pb-6 space-y-4">
                <VariantsDisplay />
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
                          removeVariant={removeVariant}
                          isMultiVariant={isMultiVariant}
                          thumbnailError={
                            (form.formState.errors as any).thumbnail
                          }
                          removeThumbnail={removeThumbnail}
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
                          alert("Video size should not exceed 5MB.");
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
  if (!res.ok) throw new Error();
  const data = (await res.json()) as CategoryDetailApiRes;
  return data;
}

async function postProduct(formData: FormData) {
  const res = await fetch(API_URL + "product/create-product-v2", {
    method: "post",
    body: formData,
  });

  if (!res.ok) throw new Error();
}

async function editProduct(formData: FormData, productId: string) {
  const res = await fetch(API_URL + "product/update-product/" + productId, {
    method: "PUT",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) throw new Error();
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
