import React, { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray, FormProvider } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { X } from "lucide-react";
import { FormItem, FormControl, FormMessage } from "@/components/ui/form";
import Subformlabel from "@/components/ui/Subformlabel";
import { InfoTooltip } from "@/components/ui/InfoTooltip";

type CategoryPair = { category: string; subcategory: string };
type SpecialityPair = { speciality: string; subspeciality: string };
type SimpleField = { value: string };

type FormValues = {
  productName: string;
  categoryPairs: CategoryPair[];
  specialities: SpecialityPair[];
  scopes: SimpleField[];
  departments: SimpleField[];
  amc_cms: File | null;
  certificate: File[];
  oemLetter: File | null;
  productCompliance: File[];
  thumbnail: File | null;
  images: (File | null)[];
};

const MAX_IMAGES = 4;
const CATEGORIES = ["Consumables", "Instruments", "Medical Equipment", "Advanced & Robotic Systems"];
const SUBCATEGORIES: Record<string, string[]> = {
  Consumables: ["Gloves", "Masks", "Syringes"],
  Instruments: ["Surgical Instruments", "ENT Instruments"],
  "Medical Equipment": ["Patient Monitoring", "ICU Equipment"],
  "Advanced & Robotic Systems": ["Robotic Surgery Systems", "AI Platforms"]
};
const SPECIALITIES = ["Cardiology", "Neurology", "Orthopedics"];
const SUBSPECIALITIES: Record<string, string[]> = {
  Cardiology: ["Interventional", "Non-invasive"],
  Neurology: ["Stroke", "Epilepsy"],
  Orthopedics: ["Spine", "Joint Replacement"]
};
const SCOPES = ["ICU", "OPD", "HDU", "PICU"];
const DEPARTMENTS = ["Emergency", "Cardiology", "Orthopedics", "Neurology"];

const AddProductForm = () => {
  const form = useForm<FormValues>({
    defaultValues: {
      productName: "",
      categoryPairs: [{ category: "", subcategory: "" }],
      specialities: [{ speciality: "", subspeciality: "" }],
      scopes: [{ value: "" }],
      departments: [{ value: "" }],
      amc_cms: null,
      certificate: [],
      oemLetter: null,
      productCompliance: [],
      thumbnail: null,
      images: Array(MAX_IMAGES).fill(null),
    },
  });

  const { control, watch, setValue, handleSubmit } = form;

  const categoryPairs = useFieldArray({ control, name: "categoryPairs" });
  const specialities = useFieldArray({ control, name: "specialities" });
  const scopes = useFieldArray({ control, name: "scopes" });
  const departments = useFieldArray({ control, name: "departments" });

  const watchCategoryPairs = watch("categoryPairs");
  const watchSpecialities = watch("specialities");
  const watchImages = watch("images");
  const watchThumbnail = watch("thumbnail");

  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>(Array(MAX_IMAGES).fill(null));
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  useEffect(() => {
    const newPreviews = watchImages.map(f => (f ? URL.createObjectURL(f) : null));
    setImagePreviews(newPreviews);
    return () => newPreviews.forEach(url => url && URL.revokeObjectURL(url));
  }, [watchImages]);

  useEffect(() => {
    if (watchThumbnail) {
      const url = URL.createObjectURL(watchThumbnail);
      setThumbnailPreview(url);
      return () => URL.revokeObjectURL(url);
    } else setThumbnailPreview(null);
  }, [watchThumbnail]);

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

  const FileField = ({ name, label, multiple = false }: { name: keyof FormValues; label: string; multiple?: boolean; tooltip?: string }) => (
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
                field.onChange(multiple ? Array.from(e.target.files) : e.target.files[0]);
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const onSubmit = (data: FormValues) => {
    if (
      data.categoryPairs.length === 0 ||
      data.specialities.length === 0 ||
      data.scopes.length === 0 ||
      data.departments.length === 0
    ) {
      alert("Please fill at least one Category, Speciality+Subspeciality, Scope, and Department");
      return;
    }
    console.log("Form Data:", data);
    alert("Form submitted! Check console.");
    form.reset();
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg">

        {/* Product Name */}
        <FormItem>
          <Subformlabel>Product Name</Subformlabel>
          <FormControl>
            <Input {...form.register("productName", { required: true })} placeholder="Enter Product Name" />
          </FormControl>
        </FormItem>

        {/* Categories */}
<div className="space-y-2">
  <label className="font-semibold">Categories</label>
  {categoryPairs.fields.map((field, index) => {
    const selectedCat = watchCategoryPairs[index]?.category;
    const selectedSubcat = watchCategoryPairs[index]?.subcategory;
    const subcats = selectedCat ? SUBCATEGORIES[selectedCat] : [];
    return (
      <div key={field.id} className="flex gap-2 items-center">
        <Controller
          name={`categoryPairs.${index}.category`}
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={val => {
                field.onChange(val);
                setValue(`categoryPairs.${index}.subcategory`, "");
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        />
        <Controller
          name={`categoryPairs.${index}.subcategory`}
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange} disabled={!selectedCat}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Subcategory" />
              </SelectTrigger>
              <SelectContent>
                {subcats.map(sub => <SelectItem key={sub} value={sub}>{sub}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        />
        <div className="flex gap-1">
          {categoryPairs.fields.length > 1 && (
            <Button type="button" variant="destructive" onClick={() => categoryPairs.remove(index)}>
              <X />
            </Button>
          )}
          {index === categoryPairs.fields.length - 1 && (
            <Button type="button" onClick={() => categoryPairs.append({ category: "", subcategory: "" })}>
              <AiOutlinePlusCircle /> Add
            </Button>
          )}
        </div>
      </div>
    );
  })}
</div>

{/* Specialities */}
<div className="space-y-2">
  <label className="font-semibold">Specialities</label>
  {specialities.fields.map((field, index) => {
    const selectedSpec = watchSpecialities[index]?.speciality;
    const selectedSubspec = watchSpecialities[index]?.subspeciality;
    const subspecOptions = selectedSpec ? SUBSPECIALITIES[selectedSpec] : [];
    return (
      <div key={field.id} className="flex gap-2 items-center">
        <Controller
          name={`specialities.${index}.speciality`}
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={val => {
                field.onChange(val);
                setValue(`specialities.${index}.subspeciality`, "");
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Speciality" />
              </SelectTrigger>
              <SelectContent>
                {SPECIALITIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        />
        <Controller
          name={`specialities.${index}.subspeciality`}
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange} disabled={!selectedSpec}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Subspeciality" />
              </SelectTrigger>
              <SelectContent>
                {subspecOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        />
        <div className="flex gap-1">
          {specialities.fields.length > 1 && (
            <Button type="button" variant="destructive" onClick={() => specialities.remove(index)}>
              <X />
            </Button>
          )}
          {index === specialities.fields.length - 1 && (
            <Button type="button" onClick={() => specialities.append({ speciality: "", subspeciality: "" })}>
              <AiOutlinePlusCircle /> Add
            </Button>
          )}
        </div>
      </div>
    );
  })}
</div>

{/* Scopes */}
<div className="space-y-2">
  <label className="font-semibold">Scopes</label>
  {scopes.fields.map((field, index) => (
    <div key={field.id} className="flex gap-2 items-center">
      <Controller
        name={`scopes.${index}.value`}
        control={control}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Scope" />
            </SelectTrigger>
            <SelectContent>
              {SCOPES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      />
      <div className="flex gap-1">
        {scopes.fields.length > 1 && (
          <Button type="button" variant="destructive" onClick={() => scopes.remove(index)}>
            <X />
          </Button>
        )}
        {index === scopes.fields.length - 1 && (
          <Button type="button" onClick={() => scopes.append({ value: "" })}>
            <AiOutlinePlusCircle /> Add
          </Button>
        )}
      </div>
    </div>
  ))}
</div>
{/* Departments */}
<div className="space-y-2">
  <label className="font-semibold">Departments</label>
  {departments.fields.map((field, index) => (
    <div key={field.id} className="flex gap-2 items-center">
      <Controller
        name={`departments.${index}.value`}
        control={control}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Department" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      />
      <div className="flex gap-1">
        {departments.fields.length > 1 && (
          <Button type="button" variant="destructive" onClick={() => departments.remove(index)}>
            <X />
          </Button>
        )}
        {index === departments.fields.length - 1 && (
          <Button type="button" onClick={() => departments.append({ value: "" })}>
            <AiOutlinePlusCircle /> Add
          </Button>
        )}
      </div>
    </div>
  ))}
</div>

        {/* File Uploads */}
        <FileField name="amc_cms" label="AMC / CMS Available" />
        <FileField name="certificate" label="Certifications / Test Reports" multiple  />
        <FileField name="oemLetter" label="OEM Authorization Letter" />
        <FileField name="productCompliance" label="Product Compliance Documents" multiple  />

        {/* Thumbnail */}
 <div>
  <Subformlabel>Thumbnail</Subformlabel>
  <div className="flex gap-3 mt-2">
    <div className="relative border h-32 w-32 flex items-center justify-center rounded-md overflow-hidden hover:shadow-lg transition">
      <label
        htmlFor="thumbnail"
        className="w-full h-full flex items-center justify-center cursor-pointer"
      >
        {thumbnailPreview ? (
          <>
            <img
              src={thumbnailPreview}
              alt="Thumbnail"
              className="h-full w-full object-cover"
            />
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="absolute top-1 right-1"
              onClick={() => setValue("thumbnail", null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <AiOutlinePlusCircle
            size={28}
            className="text-gray-400 hover:text-gray-600"
          />
        )}
      </label>
      <input
        type="file"
        id="thumbnail"
        className="hidden"
        onChange={e =>
          e.target.files && setValue("thumbnail", e.target.files[0])
        }
      />
    </div>
  </div>
</div>

        {/* Product Images */}
        <div>
          <Subformlabel>Product Images</Subformlabel>
          <div className="flex gap-3 mt-2">
            {Array.from({ length: MAX_IMAGES }).map((_, index) => (
              <div key={index} className="relative border h-24 w-24 flex items-center justify-center rounded-md overflow-hidden hover:shadow-lg transition">
                <label htmlFor={`image-${index}`} className="w-full h-full flex items-center justify-center cursor-pointer">
                  {imagePreviews[index] ? (
                    <>
                      <img src={imagePreviews[index]!} alt={`img-${index}`} className="h-full w-full object-cover" />
                      <Button type="button" size="icon" variant="destructive" className="absolute top-1 right-1" onClick={() => removeImage(index)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : <AiOutlinePlusCircle size={28} className="text-gray-400 hover:text-gray-600" />}
                </label>
                <input type="file" id={`image-${index}`} className="hidden" onChange={e => e.target.files && handleImageChange(index, e.target.files[0])} />
              </div>
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full py-3 text-lg font-semibold">Submit Product</Button>
      </form>
    </FormProvider>
  );
};

export default AddProductForm;