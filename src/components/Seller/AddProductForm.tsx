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
import { CalendarIcon  } from "lucide-react";
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

  const categoryDropDownList = categories.map((c) => ({
    label: c.name,
    value: c._id,
  }));

  const form = useForm<z.infer<typeof addProductFormSchema>>({
    resolver: zodResolver(addProductFormSchema),
    defaultValues: product ? product : addProductFormDefaultValues,
  });

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
    });
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
    const currentAttri = form.getValues("attributes");
    const newAttris = [...currentAttri, attri];
    form.setValue("attributes", newAttris);
    setCurrentAttri({ key: "", val: "" });
  }

  function removeAttri(idx: number) {
    const attributes = [...form.getValues("attributes")];
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
  const [thumbnail, setThumbnail] = useState<File[]>([]);
  const handleThumbnailChange = (
    e: ChangeEvent<HTMLInputElement>,
    i: number
  ) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (file)
      setThumbnail((p) => {
        const img = [...p];
        img.splice(i + 1, 0, file);
        return img;
      });
  };

  const [images, setImages] = useState<File[]>([]);
  const handleImageChange = (
    e: ChangeEvent<HTMLInputElement>,
    index: number
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

  const [shortVideo, setShortVideo] = useState<File | null>(null);

  const { mutate: mutateProduct, status: postProductStatus } = useMutation({
    mutationFn: (formData: any) => postProduct(formData),
    onSuccess: () => {
      toast.success("Product added successfully");
      form.reset();
      setImages([]);
      setThumbnail([]);
      setShortVideo(null);
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
        }))
      )
    );

    newForm.append("shopId", seller?._id || "");
    newForm.append("name", values.name);
    values.category.forEach((el) => {
      newForm.append("category", el.val);
    });
    values.subCategory.forEach((el) => {
      newForm.append("subCategory", el.val);
    });
    newForm.append("tags", JSON.stringify(values.tags));
    newForm.append("productType", values.productType);
    newForm.append("intendedUse", values.intendedUse);
    newForm.append("sku", values.sku);
    newForm.append("gtin", values.gtin);
    newForm.append("hsn", values.hsn);
    newForm.append("unspsc", values.unspsc);
    if (values.crosssells) {
      newForm.append("crosssells", values.unspsc);
    }
    if (values.upsells) {
      newForm.append("upsells", values.upsells);
    }
    newForm.append("specialityPackage", values.specialityPackage);
    newForm.append("specialityPackageType", values.specialityPackageType);
    newForm.append("manufacturerName", values.manufacturerName);
    newForm.append("email", values.email);
    newForm.append("phone", values.phone);
    newForm.append("origin", values.origin);
    newForm.append("shortdescription", values.shortdescription);
    newForm.append("description", values.description);
    newForm.append("attributes", JSON.stringify(values.attributes));
    newForm.append("weight", values.productWgt + " " + values.productWgtUnit);
    newForm.append(
      "dimension",
      `${values.dimension_l}x${values.dimension_h}x${values.dimension_w} ${values.dimensionUnit}`
    );
    // if (values.colorOptions) {
    //   newForm.append("colorOptions", values.colorOptions)
    // }
    newForm.append("sterile", values.sterileString);
    newForm.append("singleUse", values.singleUseString);
    newForm.append("expiry", values.expiry.toISOString());
    // newForm.append("originalPrice", values.originalPrice.toString())
    // newForm.append("discountPrice", values.discountPrice.toString())
    // if (values.institutePrice) {
    //   newForm.append("institutePrice", values.institutePrice.toString())
    // }
    newForm.append(
      "minmaxrule",
      JSON.stringify({
        minQty: values.minmaxrule.minQty,
        maxQty: values.minmaxrule.maxQty,
      })
    );
    newForm.append("taxStatus", values.taxStatus);
    newForm.append("taxClass", values.taxClass.toString());
    // newForm.append("stock", values.stocks.toString())
    newForm.append("unitOfMeasure", values.unitOfMeasure);
    newForm.append("stockStatus", values.stockStatus);
    newForm.append("deliveryLeadTime", values.deliveryLeadTime.toString());
    if (values.warranty) {
      newForm.append("warranty", values.stockStatus);
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
    // if (values.deliveryPartner) {
    //   newForm.append("deliveryPartner", values.deliveryPartner)
    // }
    newForm.append("shelfing_storage_req", values.shelfing_storage_req);
    if (values.purchaseNote) {
      newForm.append("purchaseNote", values.purchaseNote);
    }
    // files
    if (values.amc_cms) {
      newForm.append("amc_cms", values.amc_cms);
    }
    if (values.productCompilance) {
      newForm.append("productCompilance", values.productCompilance);
    }
    if (values.msds_ifu_leaflet) {
      newForm.append("msds_ifu_leaflet", values.msds_ifu_leaflet);
    }
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
        newForm.append("thumbnail", el);
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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-4xl mx-auto py-10 bg-white p-4 rounded shadow"
      >
        <Accordion type="multiple" defaultValue={["1"]}>
          <AccordionItem value="1">
            <AccordionTrigger className="text-lg">
              Product Identification & Classification
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-2 pb-6 space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <section className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({}) => (
                    <FormItem>
                      <FormLabel>Primary category</FormLabel>
                      <FormControl>
                        <>
                          {form.getValues("category").map((el) => (
                            <Input
                              value={el.name}
                              key={"cat-" + el.val}
                              readOnly
                            />
                          ))}
                          <Autocomplete
                            listItems={categoryDropDownList}
                            placeholder="Select category..."
                            value={currCategory.val}
                            setValue={(value) => {
                              const catName =
                                categoryDropDownList.find(
                                  (el) => el.value === value
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
                      <FormLabel>Subcategory</FormLabel>
                      <FormControl>
                        <>
                          {form.getValues("subCategory").map((el, i) => (
                            <article
                              className="grid grid-cols-[1fr_50px] items-center gap-4"
                              key={"subcat-" + el.val}
                            >
                              <Input value={el.name} readOnly />
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
                          <article className="grid grid-cols-[1fr_50px] items-center gap-4">
                            <Autocomplete
                              listItems={subCatDropDownList}
                              placeholder="Select subcategory..."
                              value={currSubcategory.val}
                              setValue={(value) => {
                                const subCatName =
                                  subCatDropDownList.find(
                                    (el) => el.value === value
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
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Tags</FormLabel>
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="productType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Type</FormLabel>
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
                          <SelectItem value="New">New</SelectItem>
                          <SelectItem value="Used">Used</SelectItem>
                          <SelectItem value="Refurbished">
                            Refurbished
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="intendedUse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intended Use of Product</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select intended use of product" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Diagnostic">Diagnostic</SelectItem>
                          <SelectItem value="Clinical">Clinical</SelectItem>
                          <SelectItem value="Surgical">Surgical</SelectItem>
                          <SelectItem value="Support">Support</SelectItem>
                          <SelectItem value="Non medical">
                            Non medical
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product SKU</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
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
                      <FormLabel>GSTIN</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
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
                      <FormLabel>HSN Code</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
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
                      <FormLabel>
                        UNSPSC (United Nations Standard Products and Services
                        Code)
                      </FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="upsells"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upsells Products URL</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="crosssells"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cross sells Products URL</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specialityPackage"
                render={({}) => (
                  <FormItem>
                    <FormLabel>Speciality Package</FormLabel>
                    <FormControl>
                      <SpecialityDropdown
                        viewMode={product ? true : false}
                        value={form.watch("specialityPackage")}
                        setValue={(v) => {
                          form.setValue("specialityPackage", v);
                        }}
                        packageTypeValue={form.watch("specialityPackageType")}
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
            <AccordionTrigger className="text-lg">
              {" "}
              Product Description & Specifications{" "}
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-2 pb-6 space-y-4">
              <FormField
                control={form.control}
                name="manufacturerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manufacturer Name</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
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
                    <FormLabel>Manufacturer email</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
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
                    <FormLabel>Manufacturer Phone</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
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
                    <FormLabel>Product Origin</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
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
                    <FormLabel>Short Description</FormLabel>
                    <FormControl>
                      <Textarea className="resize-none" {...field} />
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="attributes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Attributes</FormLabel>
                    <FormControl>
                      <>
                        {field.value.map((e, i) => (
                          <div className="flex gap-8" key={i}>
                            <Input value={Object.keys(e)[0]} readOnly />
                            <Input value={Object.values(e)[0]} readOnly />
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
                        <div className="flex gap-8">
                          <Input
                            placeholder="Attribute name"
                            value={currentAttri.key}
                            onChange={(e) => {
                              setCurrentAttri((p) => ({
                                ...p,
                                key: e.target.value,
                              }));
                            }}
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
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() =>
                              addAddtri({
                                [currentAttri.key]: currentAttri.val,
                              })
                            }
                          >
                            Add
                          </Button>
                        </div>
                      </>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <section className="grid grid-cols-2 items-end gap-4">
                <FormField
                  control={form.control}
                  name="productWgt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Weight</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
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

              <section className="grid grid-cols-4 gap-4 items-end">
                <FormField
                  control={form.control}
                  name="dimension_l"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product dimensions (LxHxW)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
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
                      <FormControl>
                        <Input type="number" {...field} />
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
                      <FormControl>
                        <Input type="number" {...field} />
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select dimension unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cm">cm</SelectItem>
                          <SelectItem value="meter">meter</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              <FormField
                control={form.control}
                name="sterileString"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sterile Product</FormLabel>
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
                    <FormLabel>Single Use Product</FormLabel>
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
                    <FormLabel>Expiry Date/ Shelf life</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
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
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="productCompilance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Compilance Documents</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            field.onChange(e.target.files[0]);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="msds_ifu_leaflet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload MSDS / IFU / Leaflet </FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        multiple
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            field.onChange(e.target.files[0]);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="3">
            <AccordionTrigger className="text-lg">Commercials</AccordionTrigger>
            <AccordionContent className="px-4 pt-2 pb-6 space-y-4">
              <section className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="minmaxrule.minQty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Order Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="minmaxrule.maxQty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Order Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              <section className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="taxStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Status</FormLabel>
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
                          <SelectItem value="taxable">taxable</SelectItem>
                          <SelectItem value="shipping only">
                            shipping only
                          </SelectItem>
                          <SelectItem value="none">none</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="taxClass"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Class</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="5">5%</SelectItem>
                          <SelectItem value="10">10%</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              <FormField
                control={form.control}
                name="unitOfMeasure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit of Measure</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stockStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
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
                    <FormLabel>Delivery Leading Time (in days)</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Warranty (in year)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rma"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      RMA (Return merchandise authorization) Policy
                    </FormLabel>
                    <FormControl>
                      <Textarea className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="4">
            <AccordionTrigger className="text-lg">
              {" "}
              Logistics & Fulfillment
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-2 pb-6 space-y-4">
              <FormField
                control={form.control}
                name="dispatchLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dispatch Location</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Pincode of Dispatch</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>No. of units per master carton</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Shipping Weight (in kgs)</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Packaging Type</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Delivery Instructions</FormLabel>
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
                    <FormLabel>Shelfing / Storage requiremnts</FormLabel>
                    <FormControl>
                      <Textarea className="resize-none" {...field} />
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
                    <FormLabel>Purchase Note</FormLabel>
                    <FormControl>
                      <Textarea className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>

          {!product && (
            <AccordionItem value="5">
              <AccordionTrigger className="text-lg">
                Documents Uploads
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-2 pb-6 space-y-4">
                <FormField
                  control={form.control}
                  name="amc_cms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AMC / CMS Available</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          onChange={(e) => {
                            if (e.target.files) {
                              field.onChange(e.target.files[0]);
                            }
                          }}
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
                      <FormLabel>Certifications / Test Reports </FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          multiple
                          onChange={(e) => {
                            if (e.target.files) {
                              field.onChange(Array.from(e.target.files));
                            }
                          }}
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
                      <FormLabel>OEM Authorization Letter</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          onChange={(e) => {
                            if (e.target.files) {
                              field.onChange(e.target.files[0]);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="productComparisionSheet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Comparison Sheet</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          onChange={(e) => {
                            if (e.target.files) {
                              field.onChange(e.target.files[0]);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* media */}
              </AccordionContent>
            </AccordionItem>
          )}

          <AccordionItem value="6">
            <AccordionTrigger className="text-lg">
              {product ? "Media and Variants" : "Pricing and Media"}
            </AccordionTrigger>
            {product ? (
              <AccordionContent className="px-4 pt-2 pb-6 space-y-4">
                <VariantsDisplay />
                <MediaDisplay />
              </AccordionContent>
            ) : (
              <AccordionContent className="px-4 pt-2 pb-6">
                <div className="flex items-center gap-2 mb-8">
                  <FormLabel className="text-[16px] font-normal">
                    Does this product have multiple variants (sizes/colors)?
                  </FormLabel>
                  <Checkbox
                    checked={isMultiVariant}
                    onCheckedChange={switchMultiVarianMode}
                    className="bg-light-blue! text-blue-800!"
                  />
                </div>

                {/* //variants of products */}
                <div className="my-6 space-y-4">
                  <>
                    {variantFields.map((field, i) => (
                      <AddProductFormVariants
                        i={i}
                        field={field}
                        handleThumbnailChange={handleThumbnailChange}
                        thumbnail={thumbnail}
                        form={form}
                        removeVariant={removeVariant}
                        isMultiVariant={isMultiVariant}
                      />
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
                  </>
                </div>
                <section className="space-y-4 mt-4">
                  <div>
                    <FormLabel>Upload other images</FormLabel>
                    <div className="flex gap-4 flex-wrap mt-2">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div
                          key={index}
                          className="border border-gray-300 h-[120px] w-[120px] flex items-center justify-center rounded-[5px] cursor-pointer"
                        >
                          <label
                            htmlFor={`uploadImage-${index}`}
                            className="cursor-pointer"
                          >
                            {images[index] ? (
                              <img
                                src={URL.createObjectURL(images[index])}
                                alt={`Image-${index + 1}`}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <AiOutlinePlusCircle size={30} color="#555" />
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
                    <FormLabel>Upload Product Video</FormLabel>
                    <div className="border border-gray-300 h-[120px] w-[120px] flex items-center justify-center rounded-[5px] cursor-pointer mt-2">
                      <label
                        htmlFor="uploadThumbnail"
                        className="cursor-pointer w-full h-full grid place-items-center"
                      >
                        {shortVideo ? (
                          <video
                            controls
                            src={URL.createObjectURL(shortVideo)}
                            className="h-full w-full object-cover"
                          />
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
                        if (file && file.size > 2 * 1024 * 1024) {
                          alert("Video size should not exceed 2MB.");
                          return;
                        }
                        if (file) {
                          setShortVideo(file); // Update state for short video
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

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="outline"
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
  });

  if (!res.ok) throw new Error();
}
