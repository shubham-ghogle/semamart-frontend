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



  const customAttributes = useFieldArray({
    control,
    name: "customAttributes",
  });

  /* ---------------- WATCH ---------------- */


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



  /* ---------------- SUBMIT ---------------- */

  const onSubmit = (data: FormValues) => {
    // Validate images
    const hasImages = data.images.some(img => img !== null);
    if (!hasImages) {
      form.setError("images", {
        type: "manual",
        message: "At least one image is required"
      });
      return;
    }
    
    console.log("FORM DATA", data);
  };

  /* ---------------- UI ---------------- */

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg"
      >
        {/* PRODUCT SPEC NAME */}
        <FormItem>
          <Subformlabel>Product Spec Name</Subformlabel>
          <FormControl>
            <Input
              {...register("productName", { required: "Product Spec Name is required" })}
              placeholder="Enter Product Spec Name"
            />
          </FormControl>
          {errors.productName && (
            <p className="text-red-600 text-sm mt-1">{errors.productName.message}</p>
          )}
        </FormItem>

        {/* SHORT DESCRIPTION */}
        <FormItem>
          <Subformlabel>Short Description</Subformlabel>
          <FormControl>
            <textarea
              {...register("shortDescription")}
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
          <Subformlabel>Detailed Specification</Subformlabel>
          <FormControl>
            <textarea
              {...register("detailedSpecification")}
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
             <Subformlabel>Product Weight</Subformlabel>
             <FormControl>
               <Input
                 type="text"
                 {...register("productWeight")}
                 placeholder="Weight"
               />
             </FormControl>
             {errors.productWeight && (
               <p className="text-red-600 text-sm mt-1">{errors.productWeight.message}</p>
             )}
           </FormItem>
           <FormItem className="flex-1">
             <Subformlabel>Weight Unit</Subformlabel>
             <Controller
               name="productWeightUnit"
               control={control}
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
            <Subformlabel>Dimension Unit</Subformlabel>
            <Controller
              name="dimensionUnit"
              control={control}
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

         {/* THUMBNAIL IMAGE */}
        {/* THUMBNAIL IMAGE - same style as product images */}
<div className="mt-6">
  <Subformlabel>Thumbnail *</Subformlabel>
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
      {...register("thumbnail", { required: "Thumbnail is required" })}
      onChange={(e) => e.target.files && setValue("thumbnail", e.target.files[0])}
    />
  </div>
  {errors.thumbnail && (
    <p className="text-red-600 text-sm mt-1">{errors.thumbnail.message}</p>
  )}
</div>

         {/* MULTIPLE IMAGES */}
        <div>
          <label className="font-semibold mb-2 block">Image *</label>
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
                    {...register(`images.${i}`)}
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
          {errors.images && (
            <p className="text-red-600 text-sm mt-1">At least one image is required</p>
          )}
        </div>

        {/* SUBMIT */}
        <Button type="submit" className="w-full mt-8">
          Submit Product
        </Button>
      </form>
    </FormProvider>
  );
};

export default AddProductForm;