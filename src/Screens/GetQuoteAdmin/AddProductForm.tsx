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
  departments: { department: string }[];
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
      departments: [{ department: "" }],
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

    // Validate specialities
    const hasValidSpeciality = data.specialities.some(s => s.speciality.trim());
    if (!hasValidSpeciality) {
      form.setError("specialities", {
        type: "manual",
        message: "At least one speciality is required"
      });
      return;
    }

    // Validate departments
    const hasValidDepartment = data.departments.some(d => d.department.trim());
    if (!hasValidDepartment) {
      form.setError("departments", {
        type: "manual",
        message: "At least one department is required"
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
          <Subformlabel>Product Spec Name <span className="text-red-500">*</span></Subformlabel>
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

        {/* SPECIALITIES */}
        <div className="space-y-2 mt-6">
          <label className="font-semibold">Specialities <span className="text-red-500">*</span></label>
          {form.watch("specialities").map((speciality, index) => (
            <div key={index} className="flex gap-2 items-center mb-2">
                <FormControl className="flex-1">
                  <Select 
                    onValueChange={(value) => {
                      const newSpecialities = [...form.watch("specialities")];
                      newSpecialities[index] = { 
                        ...newSpecialities[index], 
                        speciality: value,
                        subspeciality: ""
                      };
                      setValue("specialities", newSpecialities);
                    }}
                    value={speciality.speciality}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Speciality" />
                    </SelectTrigger>
                     <SelectContent className="min-w-[20rem]">
                       <SelectItem value="ICU Setup Packages">ICU Setup Packages</SelectItem>
                       <SelectItem value="Operation Theatre Setup Packages">Operation Theatre Setup Packages</SelectItem>
                       <SelectItem value="OPD & Consultation Room Packages">OPD & Consultation Room Packages</SelectItem>
                       <SelectItem value="Diagnostic Lab Packages">Diagnostic Lab Packages</SelectItem>
                       <SelectItem value="Radiology & Imaging Packages">Radiology & Imaging Packages</SelectItem>
                       <SelectItem value="Labour Room & Maternity Ward Packages">Labour Room & Maternity Ward Packages</SelectItem>
                       <SelectItem value="Dental Clinic Setup Packages">Dental Clinic Setup Packages</SelectItem>
                     </SelectContent>
                  </Select>
                </FormControl>
                 <FormControl className="flex-1">
                   <Select 
                     onValueChange={(value) => {
                       const newSpecialities = [...form.watch("specialities")];
                       newSpecialities[index] = { 
                         ...newSpecialities[index], 
                         subspeciality: value
                       };
                       setValue("specialities", newSpecialities);
                     }}
                     value={speciality.subspeciality}
                     disabled={!speciality.speciality}
                   >
                     <SelectTrigger>
                       <SelectValue placeholder="Subspeciality" />
                     </SelectTrigger>
                    <SelectContent className="min-w-[20rem]">
                     {speciality.speciality === "ICU Setup Packages" && (
                       <>
                         <SelectItem value="5-Bed ICU Starter Kit">5-Bed ICU Starter Kit</SelectItem>
                         <SelectItem value="10-Bed Modular ICU Package">10-Bed Modular ICU Package</SelectItem>
                         <SelectItem value="Pediatric ICU (PICU) Bundle">Pediatric ICU (PICU) Bundle</SelectItem>
                         <SelectItem value="Neonatal ICU (NICU) Package">Neonatal ICU (NICU) Package</SelectItem>
                         <SelectItem value="Isolation ICU Setup (with Negative Pressure)">Isolation ICU Setup (with Negative Pressure)</SelectItem>
                         <SelectItem value="ICU Monitoring Bundle (monitors, syringe pumps, beds)">ICU Monitoring Bundle (monitors, syringe pumps, beds)</SelectItem>
                         <SelectItem value="Ventilator + ABG + Infusion Kit Bundle">Ventilator + ABG + Infusion Kit Bundle</SelectItem>
                         <SelectItem value="ICU Crash Cart with Emergency Drugs">ICU Crash Cart with Emergency Drugs</SelectItem>
                       </>
                     )}
                     {speciality.speciality === "Operation Theatre Setup Packages" && (
                       <>
                         <SelectItem value="Basic OT Package (general surgery)">Basic OT Package (general surgery)</SelectItem>
                         <SelectItem value="Advanced Modular OT Package (orthopedics, neuro)">Advanced Modular OT Package (orthopedics, neuro)</SelectItem>
                         <SelectItem value="Gynae OT Package (for LSCS and D&C)">Gynae OT Package (for LSCS and D&C)</SelectItem>
                         <SelectItem value="OT Instrument Sets (major, minor, laparotomy, delivery)">OT Instrument Sets (major, minor, laparotomy, delivery)</SelectItem>
                         <SelectItem value="OT Lights & Tables Combo">OT Lights & Tables Combo</SelectItem>
                         <SelectItem value="Cautery + Suction + Anesthesia Cart Combo">Cautery + Suction + Anesthesia Cart Combo</SelectItem>
                         <SelectItem value="Disposable OT Consumables Pack">Disposable OT Consumables Pack</SelectItem>
                         <SelectItem value="OT Sterilization Zone Setup (CSSD + Autoclave)">OT Sterilization Zone Setup (CSSD + Autoclave)</SelectItem>
                         <SelectItem value="Laminar Flow OT HVAC Package">Laminar Flow OT HVAC Package</SelectItem>
                       </>
                     )}
                     {speciality.speciality === "OPD & Consultation Room Packages" && (
                       <>
                         <SelectItem value="General Medicine OPD Kit">General Medicine OPD Kit</SelectItem>
                         <SelectItem value="Pediatric OPD Package">Pediatric OPD Package</SelectItem>
                         <SelectItem value="ENT OPD Setup (chair, diagnostic set, light)">ENT OPD Setup (chair, diagnostic set, light)</SelectItem>
                         <SelectItem value="Gynecology OPD Setup (couch, instruments)">Gynecology OPD Setup (couch, instruments)</SelectItem>
                         <SelectItem value="Dental OPD Package (dental chair, light, handpieces)">Dental OPD Package (dental chair, light, handpieces)</SelectItem>
                         <SelectItem value="Dermatology OPD Starter Kit">Dermatology OPD Starter Kit</SelectItem>
                         <SelectItem value="Ophthalmology OPD Basic Setup">Ophthalmology OPD Basic Setup</SelectItem>
                         <SelectItem value="OPD EMR + Queue Token System">OPD EMR + Queue Token System</SelectItem>
                       </>
                     )}
                     {speciality.speciality === "Diagnostic Lab Packages" && (
                       <>
                         <SelectItem value="Basic Path Lab Setup (biochem + hematology)">Basic Path Lab Setup (biochem + hematology)</SelectItem>
                         <SelectItem value="Microbiology Lab Setup">Microbiology Lab Setup</SelectItem>
                         <SelectItem value="Molecular Lab Package (PCR, extraction, biosafety)">Molecular Lab Package (PCR, extraction, biosafety)</SelectItem>
                         <SelectItem value="NABL-Compliant Lab Starter Kit">NABL-Compliant Lab Starter Kit</SelectItem>
                         <SelectItem value="Sample Collection Room Package">Sample Collection Room Package</SelectItem>
                         <SelectItem value="Blood Collection + Vacutainer Bundle">Blood Collection + Vacutainer Bundle</SelectItem>
                         <SelectItem value="Lab Furniture + Storage Cabinets">Lab Furniture + Storage Cabinets</SelectItem>
                         <SelectItem value="LIS Software + Barcode Scanner Pack">LIS Software + Barcode Scanner Pack</SelectItem>
                       </>
                     )}
                     {speciality.speciality === "Radiology & Imaging Packages" && (
                       <>
                         <SelectItem value="Basic X-Ray Room Setup (machine + lead shield + PACS)">Basic X-Ray Room Setup (machine + lead shield + PACS)</SelectItem>
                         <SelectItem value="Ultrasound Room Setup (portable/standard unit + couch)">Ultrasound Room Setup (portable/standard unit + couch)</SelectItem>
                         <SelectItem value="CT Room Setup (with lead protection + consoles)">CT Room Setup (with lead protection + consoles)</SelectItem>
                         <SelectItem value="Mobile Imaging Van Kit">Mobile Imaging Van Kit</SelectItem>
                         <SelectItem value="CR/DR Conversion Package">CR/DR Conversion Package</SelectItem>
                         <SelectItem value="PACS + RIS Software Bundle">PACS + RIS Software Bundle</SelectItem>
                         <SelectItem value="Radiation Safety Compliance Kit (TLDs, aprons)">Radiation Safety Compliance Kit (TLDs, aprons)</SelectItem>
                         <SelectItem value="Patient Privacy & Comfort Accessories">Patient Privacy & Comfort Accessories</SelectItem>
                       </>
                     )}
                     {speciality.speciality === "Labour Room & Maternity Ward Packages" && (
                       <>
                         <SelectItem value="Labour Room Equipment Package">Labour Room Equipment Package</SelectItem>
                         <SelectItem value="Delivery Instrument Set">Delivery Instrument Set</SelectItem>
                         <SelectItem value="CTG + Fetal Doppler Combo">CTG + Fetal Doppler Combo</SelectItem>
                         <SelectItem value="Obstetric OT Kit (for LSCS)">Obstetric OT Kit (for LSCS)</SelectItem>
                         <SelectItem value="Baby Resuscitation Corner Setup">Baby Resuscitation Corner Setup</SelectItem>
                         <SelectItem value="Postnatal Ward Furniture Bundle">Postnatal Ward Furniture Bundle</SelectItem>
                         <SelectItem value="Maternity Care Consumables Kit">Maternity Care Consumables Kit</SelectItem>
                         <SelectItem value="Kangaroo Mother Care Accessories">Kangaroo Mother Care Accessories</SelectItem>
                       </>
                     )}
                     {speciality.speciality === "Dental Clinic Setup Packages" && (
                       <>
                         <SelectItem value="Single Chair Dental Setup">Single Chair Dental Setup</SelectItem>
                         {/* Add more dental clinic subspecialities if available */}
                       </>
                     )}
                   </SelectContent>
                </Select>
              </FormControl>
                {index === form.watch("specialities").length - 1 && (
                  <Button
                    type="button"
                    variant="default"
                    size="icon"
                    onClick={() => {
                      const newSpecialities = [...form.watch("specialities")];
                      newSpecialities.push({ speciality: "", subspeciality: "" });
                      setValue("specialities", newSpecialities);
                    }}
                    aria-label="Add Speciality"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus-circle"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                  </Button>
                )}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => {
                  const newSpecialities = [...form.watch("specialities")];
                  newSpecialities.splice(index, 1);
                  setValue("specialities", newSpecialities);
                }}
                aria-label="Remove speciality"
                disabled={form.watch("specialities").length === 1}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* DEPARTMENTS */}
        <div className="mt-4">
          <label className="font-semibold mb-2 block">Departments <span className="text-red-500">*</span></label>
          {form.watch("departments").map((dept, index) => (
            <div key={index} className="flex gap-2 items-center mb-2">
               <FormControl className="w-full">
                  <Select 
                    onValueChange={(value) => {
                      const newDepartments = [...form.watch("departments")];
                      newDepartments[index] = { 
                        ...newDepartments[index], 
                        department: value
                      };
                      setValue("departments", newDepartments);
                    }}
                    value={dept.department}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent className="min-w-[20rem]">
                      <SelectItem value="EMERGENCY MEDICINE">EMERGENCY MEDICINE</SelectItem>
                      <SelectItem value="ORTHOPEDICS">ORTHOPEDICS</SelectItem>
                      <SelectItem value="NEUROLOGY">NEUROLOGY</SelectItem>
                      <SelectItem value="DENTAL">DENTAL</SelectItem>
                      <SelectItem value="CARDIOLOGY">CARDIOLOGY</SelectItem>
                      <SelectItem value="EAR NOSE AND THROAT">EAR NOSE AND THROAT</SelectItem>
                      <SelectItem value="PATHOLOGY">PATHOLOGY</SelectItem>
                      <SelectItem value="GASTROENTEROLOGY">GASTROENTEROLOGY</SelectItem>
                      <SelectItem value="RESPIRATORY MEDICINE">RESPIRATORY MEDICINE</SelectItem>
                      <SelectItem value="MICROBIOLOGY">MICROBIOLOGY</SelectItem>
                      <SelectItem value="RADIOLOGY">RADIOLOGY</SelectItem>
                      <SelectItem value="OB/GYN">OB/GYN</SelectItem>
                      <SelectItem value="ONCOLOGY">ONCOLOGY</SelectItem>
                      <SelectItem value="NEPHROLOGY">NEPHROLOGY</SelectItem>
                      <SelectItem value="PULMONOLOGY">PULMONOLOGY</SelectItem>
                      <SelectItem value="DERMATOLOGY">DERMATOLOGY</SelectItem>
                      <SelectItem value="ENDOCRINOLOGY">ENDOCRINOLOGY</SelectItem>
                      <SelectItem value="OPHTHALMOLOGY">OPHTHALMOLOGY</SelectItem>
                      <SelectItem value="OTOLARYNGOLOGY">OTOLARYNGOLOGY</SelectItem>
                      <SelectItem value="UROLOGY">UROLOGY</SelectItem>
                      <SelectItem value="PSYCHIATRY">PSYCHIATRY</SelectItem>
                      <SelectItem value="ANESTHESIOLOGY">ANESTHESIOLOGY</SelectItem>
                      <SelectItem value="GENERAL SURGERY">GENERAL SURGERY</SelectItem>
                      <SelectItem value="PLASTIC AND RECONSTRUCTIVE SURGERY">PLASTIC AND RECONSTRUCTIVE SURGERY</SelectItem>
                      <SelectItem value="PHYSICAL MEDICINE AND REHABILITATION">PHYSICAL MEDICINE AND REHABILITATION</SelectItem>
                      <SelectItem value="NEONATOLOGY">NEONATOLOGY</SelectItem>
                    </SelectContent>
                  </Select>
               </FormControl>
               {index === form.watch("departments").length - 1 && (
                 <Button
                   type="button"
                   variant="default"
                   size="icon"
                   onClick={() => {
                     const newDepartments = [...form.watch("departments")];
                     newDepartments.push({ department: "" });
                     setValue("departments", newDepartments);
                   }}
                   aria-label="Add Department"
                 >
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus-circle"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                 </Button>
               )}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => {
                  const newDepartments = [...form.watch("departments")];
                  newDepartments.splice(index, 1);
                  setValue("departments", newDepartments);
                }}
                aria-label="Remove department"
                disabled={form.watch("departments").length === 1}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

         {/* THUMBNAIL IMAGE */}
        {/* THUMBNAIL IMAGE - same style as product images */}
<div className="mt-6">
  <Subformlabel>Thumbnail <span className="text-red-500">*</span></Subformlabel>
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
          <label className="font-semibold mb-2 block">Image <span className="text-red-500">*</span></label>
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