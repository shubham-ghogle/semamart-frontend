import { useEffect, useState } from "react";
import {
  useForm,
  Controller,
  useFieldArray,
  FormProvider,
} from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { AiOutlinePlusCircle } from "react-icons/ai";
import { X } from "lucide-react";

import {
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import Subformlabel from "@/components/ui/Subformlabel";

/* ---------------- TYPES ---------------- */

type CategoryPair = {
  category: string;
  subcategory: string;
};

type SpecialityPair = {
  speciality: string;
  subspeciality: string;
};

type ScopeDepartment = {
  scope: string;
  department: string;
};

type CustomAttribute = {
  name: string;
  value: string;
};

type FormValues = {
  productName: string;
  shortDescription: string;
  detailedSpecification: string;
  customAttributes: CustomAttribute[];
  productWeight: string;
  productWeightUnit: string;
  length: string;
  height: string;
  width: string;
  dimensionUnit: string;

  categoryPairs: CategoryPair[];
  specialities: SpecialityPair[];
  scopeDepartments: ScopeDepartment[];
  minimumOrderQuantity: number;
  thumbnail: File | null;
  images: (File | null)[];
  amc_cms?: File | null;
  certificate?: File[];
  oemLetter?: File | null;
  productCompliance?: File[];
};

/* ---------------- CONSTANTS ---------------- */

const MAX_IMAGES = 4;

const CATEGORIES = ["Consumables", "Instruments", "Medical Equipment"];

const SUBCATEGORIES: Record<string, string[]> = {
  Consumables: ["Gloves", "Masks", "Syringes"],
  Instruments: ["Surgical Instruments", "ENT Instruments"],
  "Medical Equipment": ["ICU Equipment", "Patient Monitoring"],
};

const SPECIALITIES = ["Cardiology", "Neurology", "Orthopedics"];

const SUBSPECIALITIES: Record<string, string[]> = {
  Cardiology: ["Interventional", "Non-invasive"],
  Neurology: ["Stroke", "Epilepsy"],
  Orthopedics: ["Spine", "Joint Replacement"],
};

const SCOPES = ["ICU", "OPD", "HDU", "PICU"];
const DEPARTMENTS = ["Emergency", "Cardiology", "Orthopedics"];

const WEIGHT_UNITS = ["kg", "g", "lb", "oz"];

const DIMENSION_UNITS = ["cm", "m", "inch", "ft"];

/* ---------------- COMPONENT ---------------- */

const AddProductForm = () => {
  const form = useForm<FormValues>({
    defaultValues: {
      productName: "",
      shortDescription: "",
      detailedSpecification: "",
      customAttributes: [{ name: "", value: "" }],
      productWeight: "",
      productWeightUnit: "",
      length: "",
      height: "",
      width: "",
      dimensionUnit: "",

      categoryPairs: [{ category: "", subcategory: "" }],
      specialities: [{ speciality: "", subspeciality: "" }],
      scopeDepartments: [{ scope: "", department: "" }],
      minimumOrderQuantity: 1,
      thumbnail: null,
      images: Array(MAX_IMAGES).fill(null),
    },
  });

  const { control, watch, setValue, handleSubmit, register, formState: { errors } } = form;

  /* ---------------- FIELD ARRAYS ---------------- */

  const categoryPairs = useFieldArray({
    control,
    name: "categoryPairs",
  });

  const specialities = useFieldArray({
    control,
    name: "specialities",
  });

  const scopeDepartments = useFieldArray({
    control,
    name: "scopeDepartments",
  });

  const customAttributes = useFieldArray({
    control,
    name: "customAttributes",
  });

  /* ---------------- WATCH ---------------- */

  const watchCategoryPairs = watch("categoryPairs");
  const watchSpecialities = watch("specialities");
  const watchImages = watch("images");
  const watchThumbnail = watch("thumbnail");

  /* ---------------- IMAGE PREVIEW ---------------- */

  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>(
    Array(MAX_IMAGES).fill(null)
  );

  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    null
  );

  useEffect(() => {
    const previews = watchImages.map((file) =>
      file ? URL.createObjectURL(file) : null
    );
    setImagePreviews(previews);

    return () =>
      previews.forEach((url) => url && URL.revokeObjectURL(url));
  }, [watchImages]);

  useEffect(() => {
    if (watchThumbnail) {
      const url = URL.createObjectURL(watchThumbnail);
      setThumbnailPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setThumbnailPreview(null);
    }
  }, [watchThumbnail]);

  /* ---------------- IMAGE HANDLER ---------------- */

  const handleImageChange = (index: number, file: File) => {
    const newImages = [...watchImages];
    newImages[index] = file;
    setValue("images", newImages);
  };

  const removeImage = (index: number) => {
    const newImages = [...watchImages];
    newImages[index] = null;
    setValue("images", newImages);
  };

  /* ---------------- FILE FIELD COMPONENT ---------------- */

  const FileField = ({
    name,
    label,
    multiple = false,
  }: {
    name: keyof FormValues;
    label: string;
    multiple?: boolean;
  }) => (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem>
          <div className="flex justify-between items-center mb-1">
            <Subformlabel>{label}</Subformlabel>
          </div>
          <FormControl>
            <Input
              type="file"
              multiple={multiple}
              onChange={(e) => {
                if (!e.target.files) return;
                field.onChange(
                  multiple
                    ? Array.from(e.target.files)
                    : e.target.files[0]
                );
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  /* ---------------- SUBMIT ---------------- */

  const onSubmit = (data: FormValues) => {
    console.log("FORM DATA", data);
  };

  /* ---------------- UI ---------------- */

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg"
      >
        {/* PRODUCT NAME */}
        <FormItem>
          <Subformlabel>Product Name</Subformlabel>
          <FormControl>
            <Input
              {...register("productName", { required: "Product Name is required" })}
              placeholder="Enter Product Name"
            />
          </FormControl>
          {errors.productName && (
            <p className="text-red-600 text-sm mt-1">{errors.productName.message}</p>
          )}
        </FormItem>

        {/* SHORT DESCRIPTION */}
        <FormItem>
          <Subformlabel>Short Description *</Subformlabel>
          <FormControl>
            <textarea
              {...register("shortDescription", { required: "Short Description is required" })}
              className="w-full border rounded-md p-2 min-h-[80px]"
              placeholder="Enter short description"
            />
          </FormControl>
          {errors.shortDescription && (
            <p className="text-red-600 text-sm mt-1">{errors.shortDescription.message}</p>
          )}
        </FormItem>

        {/* DETAILED SPECIFICATION */}
        <FormItem>
          <Subformlabel>Detailed Specification *</Subformlabel>
          <FormControl>
            <textarea
              {...register("detailedSpecification", { required: "Detailed Specification is required" })}
              className="w-full border rounded-md p-2 min-h-[80px]"
              placeholder="Enter detailed specification"
            />
          </FormControl>
          {errors.detailedSpecification && (
            <p className="text-red-600 text-sm mt-1">{errors.detailedSpecification.message}</p>
          )}
        </FormItem>

        {/* CUSTOM ATTRIBUTES */}
        <div className="space-y-2">
          <label className="font-semibold">Custom Attributes</label>
          {customAttributes.fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-center">
              <FormControl>
                <Input
                  placeholder="Attribute name"
                  {...register(`customAttributes.${index}.name` as const)}
                />
              </FormControl>
              <FormControl>
                <Input
                  placeholder="Attribute value"
                  {...register(`customAttributes.${index}.value` as const)}
                />
              </FormControl>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => customAttributes.remove(index)}
                aria-label="Remove attribute"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            onClick={() => customAttributes.append({ name: "", value: "" })}
            
          >
            Add
          </Button>
        </div>

        {/* PRODUCT WEIGHT */}
        <div className="flex gap-4 items-center mt-4">
          <FormItem className="flex-1">
            <Subformlabel>Product Weight *</Subformlabel>
            <FormControl>
              <Input
                type="text"
                {...register("productWeight", { required: "Product Weight is required" })}
                placeholder="Weight"
              />
            </FormControl>
            {errors.productWeight && (
              <p className="text-red-600 text-sm mt-1">{errors.productWeight.message}</p>
            )}
          </FormItem>
          <FormItem className="flex-1">
            <Subformlabel>Weight Unit *</Subformlabel>
            <Controller
              name="productWeightUnit"
              control={control}
              rules={{ required: "Weight Unit is required" }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select weight unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {WEIGHT_UNITS.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.productWeightUnit && (
              <p className="text-red-600 text-sm mt-1">{errors.productWeightUnit.message}</p>
            )}
          </FormItem>
        </div>

        {/* DIMENSIONS */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <FormItem>
            <Subformlabel>Length</Subformlabel>
            <FormControl>
              <Input
                type="text"
                {...register("length")}
                placeholder="Length"
              />
            </FormControl>
          </FormItem>
          <FormItem>
            <Subformlabel>Height</Subformlabel>
            <FormControl>
              <Input
                type="text"
                {...register("height")}
                placeholder="Height"
              />
            </FormControl>
          </FormItem>
          <FormItem>
            <Subformlabel>Width</Subformlabel>
            <FormControl>
              <Input
                type="text"
                {...register("width")}
                placeholder="Width"
              />
            </FormControl>
          </FormItem>
          <FormItem>
            <Subformlabel>Dimension Unit *</Subformlabel>
            <Controller
              name="dimensionUnit"
              control={control}
              rules={{ required: "Dimension Unit is required" }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIMENSION_UNITS.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.dimensionUnit && (
              <p className="text-red-600 text-sm mt-1">{errors.dimensionUnit.message}</p>
            )}
          </FormItem>
        </div>

        {/* CATEGORY */}
        <div className="space-y-2 mt-6">
          <label className="font-semibold">Categories</label>
          {categoryPairs.fields.map((field, index) => {
            const selectedCat = watchCategoryPairs[index]?.category;
            const subcats = selectedCat ? SUBCATEGORIES[selectedCat] : [];
            return (
              <div key={field.id} className="flex gap-2 items-center">
                <Controller
                  name={`categoryPairs.${index}.category`}
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val);
                        setValue(`categoryPairs.${index}.subcategory`, "");
                      }}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <Controller
                  name={`categoryPairs.${index}.subcategory`}
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!selectedCat}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {subcats.map((sub) => (
                          <SelectItem key={sub} value={sub}>
                            {sub}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <Button
                  type="button"
                  onClick={() =>
                    categoryPairs.append({ category: "", subcategory: "" })
                  }
                  title="Add category"
                >
                  <AiOutlinePlusCircle />
                </Button>
                {categoryPairs.fields.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => categoryPairs.remove(index)}
                    title="Remove category"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* SPECIALITIES */}
        <div className="space-y-2 mt-6">
          <label className="font-semibold">Specialities</label>
          {specialities.fields.map((field, index) => {
            const selected = watchSpecialities[index]?.speciality;
            const subs = selected ? SUBSPECIALITIES[selected] : [];
            return (
              <div key={field.id} className="flex gap-2 items-center">
                <Controller
                  name={`specialities.${index}.speciality`}
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val);
                        setValue(`specialities.${index}.subspeciality`, "");
                      }}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Speciality" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPECIALITIES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <Controller
                  name={`specialities.${index}.subspeciality`}
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!selected}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Subspeciality" />
                      </SelectTrigger>
                      <SelectContent>
                        {subs.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <Button
                  type="button"
                  onClick={() =>
                    specialities.append({ speciality: "", subspeciality: "" })
                  }
                  title="Add speciality"
                >
                  <AiOutlinePlusCircle />
                </Button>
                {specialities.fields.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => specialities.remove(index)}
                    title="Remove speciality"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* SCOPE + DEPARTMENT */}
        <div className="space-y-2 mt-6">
          <label className="font-semibold">Scope & Department</label>
          {scopeDepartments.fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-center">
              <Controller
                name={`scopeDepartments.${index}.scope`}
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Scope" />
                    </SelectTrigger>
                    <SelectContent>
                      {SCOPES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <Controller
                name={`scopeDepartments.${index}.department`}
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <Button
                type="button"
                onClick={() =>
                  scopeDepartments.append({ scope: "", department: "" })
                }
                title="Add Scope & Department"
              >
                <AiOutlinePlusCircle />
              </Button>
              {scopeDepartments.fields.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => scopeDepartments.remove(index)}
                  title="Remove Scope & Department"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* MINIMUM ORDER QUANTITY */}
        <FormItem>
          <Subformlabel>Minimum Order Quantity</Subformlabel>
          <FormControl>
            <Input
              type="number"
              {...register("minimumOrderQuantity", {
                valueAsNumber: true,
                min: { value: 1, message: "Minimum order quantity must be at least 1" },
              })}
              placeholder="Enter minimum order quantity"
            />
          </FormControl>
          {errors.minimumOrderQuantity && (
            <p className="text-red-600 text-sm mt-1">{errors.minimumOrderQuantity.message}</p>
          )}
        </FormItem>

        {/* THUMBNAIL IMAGE */}
       {/* THUMBNAIL IMAGE - same style as product images */}
<div className="mt-6">
  <Subformlabel>Thumbnail</Subformlabel>
  <div className="relative w-32 h-32 border rounded-md overflow-hidden mt-2 flex items-center justify-center cursor-pointer hover:shadow-lg transition">
    {thumbnailPreview ? (
      <>
        <img
          src={thumbnailPreview}
          alt="Thumbnail preview"
          className="object-cover w-full h-full"
        />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-1 right-1"
          onClick={() => setValue("thumbnail", null)}
          aria-label="Remove thumbnail"
        >
          <X className="w-4 h-4" />
        </Button>
      </>
    ) : (
      <label
        htmlFor="thumbnail-upload"
        className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-gray-600"
      >
        <AiOutlinePlusCircle size={28} />
        <span className="mt-1 text-sm">Add Thumbnail</span>
      </label>
    )}
    <input
      id="thumbnail-upload"
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(e) => e.target.files && setValue("thumbnail", e.target.files[0])}
    />
  </div>
</div>

        {/* MULTIPLE IMAGES */}
        <div>
          <label className="font-semibold mb-2 block">Product Images</label>
          <div className="flex gap-4">
            {imagePreviews.map((src, i) => (
              <div key={i} className="relative">
                {src ? (
                  <div className="relative w-24 h-24 border rounded-md overflow-hidden">
                    <img
                      src={src}
                      alt={`Image preview ${i + 1}`}
                      className="object-cover w-full h-full"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1"
                      onClick={() => removeImage(i)}
                      aria-label="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (!e.target.files) return;
                      handleImageChange(i, e.target.files[0]);
                    }}
                    className="w-24 h-24 border rounded-md cursor-pointer opacity-80"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* OTHER FILE FIELDS */}
        <FileField name="amc_cms" label="AMC/CMS Document" />
        <FileField name="certificate" label="Certificates" multiple />
        <FileField name="oemLetter" label="OEM Letter" />
        <FileField name="productCompliance" label="Product Compliance" multiple />

        {/* SUBMIT */}
        <Button type="submit" className="w-full mt-8">
          Submit Product
        </Button>
      </form>
    </FormProvider>
  );
};

export default AddProductForm;