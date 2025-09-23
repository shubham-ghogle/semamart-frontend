export interface Review {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: string | User;
  rating: number;
  comment: string;
  product: string | Product;
  createdAt: Date;
  updatedAt: Date;
  _id: string
}

// interface Shop {
//   _id: string;
//   name: string;
//   email: string;
//   password: string;
//   address: string;
//   phoneNumber: number;
//   role: string;
//   avatar: string;
//   zipCode: number;
//   availableBalance: number;
//   createdAt: Date;
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   transections: any[];
// }

export interface Variant {
  size?: string | null
  colorOption?: string | null
  thumbnail?: string | null
  originalPrice: number
  discountPrice?: number
  stock: number
  _id: string
  productId:string
  bulkOrders:{qty:number,price:number,_id:string}[]
}

export interface Product {
  _id: string
  name: string
  category: string[]   // fixed
  subCategory: string[]   // fixed
  tags: string[]
  productType: string
  intendedUse: string   // fixed (required)
  sku: string
  gtin: string
  hsn: string
  unspsc?: string
  upsells?: string
  crosssells?: string
  specialityPackage: string   // fixed (required)
  specialityPackageType: string   // fixed (required)
  manufacturerName?: string   // fixed
  email?: string
  phone?: string
  origin?: string
  shortdescription: string
  description: string
  attributes?: Record<string, string>[]
  weight: string
  dimension: string
  variants: Variant[]
  sterile: boolean   // fixed
  singleUse: boolean // fixed
  expiry: Date
  productCompilance: string
  msds_ifu_leaflet: string
  minmaxrule: Record<string, any>
  taxStatus: string
  taxClass: number
  unitOfMeasure: string
  stockStatus: string // fixed
  deliveryLeadTime: string
  warranty: string
  enableStockManagement: boolean
  amc_cms: string
  rma: string
  dispatchLocation: string
  dispatchPinCode: number
  unitsPerCarton: number
  shippingWeight: number
  packagingType: string
  // deliveryPartner: string
  deliveryInstruction: string
  shelfing_storage_req: string
  // allowSingleQuantity?: boolean
  discountOptions?: string
  productStatus?: string
  visibility: "public" | "hidden"
  purchaseNote?: string
  images: string[]
  shortVideo?: string
  certificate?: string[]
  oemLetter?: string
  productComparisionSheet?: string
  allowProductReviews: boolean
  reviews?: string[] | Review[] // fixed
  ratings?: number
  shopId: string | Seller
  sold_out: number
  createdAt: Date
  updatedAt: Date
}

export type Address = {
  state: string;
  district: string;
  instituteAddress1: string;
  instituteAddress2: string;
  pincode: string;
  landmark: string;
  _id: string;
};

// USER TYPES /////
export type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  instituteName: string;
  password: string;
  addresses: Address[];
  role: string;
  createdAt: string;
  avatar?: string;
};

type Transaction = {
  amount: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
};

// SELLER TYPES////
export type Seller = {
  _id: string;
  firstName: string;
  lastName: string;
  businessName?: string;
  businessType: string;
  gstNumber: string;
  email: string;
  phoneNumber: string;
  role: string;
  profilePic: string;
  banner: string;
  avatar?: string;
  address?: string;
  zipCode?: number;
  availableBalance: number;
  createdAt: string;
  verified: boolean;
  transections: Transaction[];
  __v: number;
};

type PaymentInfo = {
  id?: string;
  status?: string;
  type?: string;
  paidAt?: string;
};

export type Order = {
  _id: string
  cart: { productId: string | Product;variantId:string | Variant; qty: number; shopId: string;   isReviewed?: boolean; // ✅ add this
 }[];
  shippingAddress: Address;
  user: User;
  totalPrice: number;
  status?:
  "Processing"
  | "Transferred to delivery partner"
  | "Shipping"
  | "Received"
  | "On the way"
  | "Delivered"
  | "Processing refund"
  | "Refund Success";
  paymentInfo?: PaymentInfo;
  paidAt?: Date;
  deliveredAt?: Date;
  createdAt?: Date;
  shop?: string;
};

export type CategoryApiRes = {
  _id: string;
  name: string;
  subcategories: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SubCategory {
  _id: string;
  name: string;
  category: string;
  tags: string[];
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  __v: number;
}

export type CategoryDetailApiRes = {
  _id: string;
  name: string;
  subcategories: SubCategory[];
  createdAt: Date;
  updatedAt: Date;
}

