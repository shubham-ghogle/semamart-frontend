import { z } from "zod";

export const variantSchema = z.object({
  colorOption: z.string().min(1, "Color is required").optional().nullable(),
  size: z.string().min(1, "Size is required").optional().nullable(),
  stocks: z
    .string({ error: "Stock must be a number" })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Stock must be greater then zero",
    }),
  originalPrice: z
    .string("Required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Original price must be greater then zero",
    }),
  discountPrice: z
    .string("Required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Discount price must be greater then zero",
    }),
  bulkOrders: z
    .array(
      z.object({
        qty: z.number().min(1, "Quantity required"),
        price: z.number().min(1, "Price required"),
      })
    )
    .max(3, "You can define at most 3 bulk order options")
    .optional(),
});

const addProductFormSchema = z
  .object({
    name: z.string().min(1, "Product name is required").max(100),
    category: z
      .array(
        z.object({
          name: z.string().min(1, "Category name required"),
          val: z.string().min(1, "Category value required"),
        })
      )
      .min(1, "At least one subcategory is required"),
    subCategory: z
      .array(
        z.object({
          name: z.string().min(1, "Category name required"),
          val: z.string().min(1, "Category value required"),
        })
      )
      .min(1, "At least one subcategory is required"),
    tags: z.array(z.string()).min(1, {
      error: "Add atleast one",
    }),
    productType: z
      .string("Product type is required")
      .min(1, "Product type is required"),
    intendedUse: z.string().optional(),
    sku: z.string().regex(/^[A-Za-z0-9-]{6,16}$/, {
      message:
        "SKU must be 6–16 characters long and can only contain letters, numbers, or hyphens",
    }),
    gtin: z.string().regex(/^[A-Za-z0-9]{15}$/, "Invalid GSTIN"),
    hsn: z.string().regex(/^[A-Za-z0-9]{2,8}$/, {
      message: "Invalid HSN",
    }),
    unspsc: z.string(),
    upsells: z.array(z.url()).optional(),
    crosssells: z.array(z.url()).optional(),
    specialityPackage: z.string().min(1, "Speciality Package Required"),
    specialityPackageType: z
      .string()
      .min(2, "Speciality Package Type Required"),
    manufacturerName: z.string().min(1, "Required"),
    email: z.email(),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit phone number"),
    origin: z.string().min(1, "Required"),
    shortdescription: z
      .string()
      .min(100, "Must have atleast 100 characters")
      .max(160, "Must have less then 160 characters"),
    description: z
      .string()
      .min(1, "Required")
      .max(2000, "Must have less then 2000 characters"),
    attributes: z.array(z.record(z.string(), z.string())).optional(),
    productWgt: z
      .string("Required")
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Product weight must be a positive number",
      }),
    productWgtUnit: z.string("Required").min(1, "Weight unit required"),
    dimension_l: z
      .string()
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Length must be a positive number",
      }),
    dimension_w: z
      .string()
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Width must be a positive number",
      }),
    dimension_h: z
      .string()
      .min(0)
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Height must be a positive number",
      }),
    dimensionUnit: z
      .string("Product dimension unit is Required")
      .min(1, "Product dimension unit is required"),
    sterileString: z.string().min(1, "Required"),
    singleUseString: z.string().min(1, "Required"),
    expiry: z.date(),
    productCompilance: z.array(z.instanceof(File)).optional().nullable(),
    msds_ifu_leaflet: z.array(z.instanceof(File)).optional().nullable(),
    minmaxrule: z.object({
      minQty: z.string().min(1, "Min qty must be at least 1"),
      maxQty: z.string().optional(),
    }),
    taxStatus: z.string("Required").min(1, "Required"),
    taxClass: z.string().optional(),
    unitOfMeasure: z.string().optional(),
    stockStatus: z.string("Required").min(1, "Required"),
    deliveryLeadTime: z
      .string()
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Delivery lead time must grater then zero",
      }),
    warranty: z
      .string()
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Warranty must be greater then zero",
      }),
    amc_cms: z.instanceof(File).optional().nullable(),
    rma: z.string().min(1, "Required"),
    dispatchLocation: z.string().min(1, "Required"),
    dispatchPinCode: z
      .string()
      .regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
    unitsPerCarton: z
      .string()
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Units per carton must be greater then zero",
      }),
    shippingWeight: z
      .string()
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Shipping weight must be greater then zero",
      }),
    packagingType: z.string().min(1, "Required"),
    deliveryInstruction: z.string().min(1, "Required"),
    shelfing_storage_req: z.string().optional(),
    purchaseNote: z.string().optional(),
    certificate: z.array(z.instanceof(File)),
    oemLetter: z.instanceof(File).nullable(),
    productComparisionSheet: z.instanceof(File).optional().nullable(),
    variants: z.array(variantSchema).min(1),
  })
  .refine(
    (data) => {
      console.log(data.taxClass);
      if (data.taxStatus === "taxable") {
        return data.taxClass && data.taxClass.trim() !== "";
      }
      return true;
    },
    {
      message: "Tax class is required for tax status 'Taxable'",
      path: ["taxClass"],
    }
  )
  .refine(
    (data) => {
      return (
        data.specialityPackageType && data.specialityPackageType.trim() !== ""
      );
    },
    {
      message: "Speciality package type required",
      path: ["specialityPackage"],
    }
  );

export { addProductFormSchema };
