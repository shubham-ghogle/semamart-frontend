import { z } from "zod"

export const variantSchema = z.object({
  size: z.string().optional().nullable(),
  colorOption: z.string().optional().nullable(),
  originalPrice: z.string().min(1, "originalPrice required"),
  discountPrice: z.string().min(1),
  stocks: z.string().min(1, "Stock required"),
});

const addProductFormSchema = z.object({
  name: z.string().min(1),
  category: z.array(
    z.object({
      name: z.string().min(1, "Category name required"),
      val: z.string().min(1, "Category value required"),
    })
  ).min(1),
  subCategory: z.array(
    z.object({
      name: z.string().min(1, "Category name required"),
      val: z.string().min(1, "Category value required"),
    })
  ).min(1),
  tags: z.array(z.string()).min(1, {
    error: "Please select at least one item"
  }),
  productType: z.string().min(1),
  intendedUse: z.string().min(1),
  sku: z.string().min(1),
  gtin: z.string().min(1),
  hsn: z.string().min(1),
  unspsc: z.string(),
  upsells: z.string().optional(),
  crosssells: z.string().optional(),
  specialityPackage: z.string().min(1),
  specialityPackageType: z.string().min(1),
  manufacturerName: z.string().min(1),
  email: z.string().min(1),
  phone: z.string().min(1),
  origin: z.string().min(1),
  shortdescription: z.string().min(1),
  description: z.string().min(1),
  attributes: z.array(z.record(z.string(), z.string())).min(3, { error: "Add atleast three" }),
  productWgt: z.string({ error: "add product weight" }).min(0),
  productWgtUnit: z.string().min(1),
  dimension_l: z.string().min(0),
  dimension_w: z.string().min(0),
  dimension_h: z.string().min(0),
  dimensionUnit: z.string().min(1),
  // colorOptions: z.string().optional(),
  sterileString: z.string(),
  singleUseString: z.string(),
  expiry: z.date(),
  productCompilance: z.instanceof(File).optional().nullable(),
  msds_ifu_leaflet: z.instanceof(File).optional().nullable(),
  // originalPrice: z.string().min(0),
  // discountPrice: z.string().min(0),
  // institutePrice: z.string().optional(),
  minmaxrule: z.object({
    minQty: z.string().min(1, "Min qty must be at least 1"),
    maxQty: z.string().min(1, "Max qty must be at least 1"),
  }).refine((data) => parseInt(data.maxQty) >= parseInt(data.minQty), {
    message: "Max qty must be greater than or equal to min qty",
    path: ["maxQty"],
  }),
  taxStatus: z.string().min(1),
  taxClass: z.string().min(0),
  // stocks: z.string().min(0),
  unitOfMeasure: z.string().min(1),
  stockStatus: z.string().min(1),
  deliveryLeadTime: z.string().min(1),
  warranty: z.string().optional(),
  amc_cms: z.instanceof(File).optional().nullable(),
  rma: z.string(),
  dispatchLocation: z.string().min(1),
  dispatchPinCode: z.string().min(1),
  unitsPerCarton: z.string().min(1),
  shippingWeight: z.string().min(1),
  packagingType: z.string().min(1),
  // deliveryPartner: z.string().optional(),
   deliveryInstruction: z.string().optional(),
  shelfing_storage_req: z.string().min(1),
  purchaseNote: z.string().optional(),
  certificate: z.array(z.instanceof(File)),
  oemLetter: z.instanceof(File).nullable(),
  productComparisionSheet: z.instanceof(File).optional().nullable(),
  variants: z.array(variantSchema).min(1)
});

export { addProductFormSchema }
