export interface Review {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: string | User;
  rating: number;
  comment: string;
  product: string | Product;
  createdAt: Date;
  updatedAt: Date;
  _id: string;
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
  size?: string | null;
  colorOption?: string | null;
  thumbnail?: string | null;
  originalPrice: number;
  discountPrice?: number;
  stock: number;
  _id: string;
  productId: string | Product;
  bulkOrders: { qty: number; price: number; _id: string }[];
}

export interface Product {
  _id: string;
  name: string;
  category: string[]; // fixed
  subCategory: string[]; // fixed
  tags: string[];
  productType: string;
  intendedUse: string; // fixed (required)
  sku: string;
  gtin?: string;
  hsn: string;
  unspsc?: string;
  upsells?: string[];
  crosssells?: string[];
  specialityPackage: string; // fixed (required)
  specialityPackageType: string; // fixed (required)
  manufacturer:
    | string
    | {
        manufacturerName: string;
        email: string;
        phone: string;
        origin: string;
      };
  // manufacturerName?: string   // fixed
  // email?: string
  // phone?: string
  // origin?: string
  shortdescription: string;
  description: string;
  attributes?: Record<string, string>[];
  weight: string;
  dimension: string;
  variants: Variant[];
  sterile: boolean; // fixed
  singleUse: boolean; // fixed
  manufacturingDate: Date;
  productCompilance?: string[];
  msds_ifu_leaflet?: string[];
  minmaxrule: Record<string, any>;
  taxStatus: string;
  taxClass: number;
  unitOfMeasure: string;
  stockStatus: string; // fixed
  deliveryLeadTime: string;
  warranty: string;
  enableStockManagement: boolean;
  amc_cms: string;
  rma: string;
  dispatchLocation: string;
  dispatchState: string;
  dispatchDistrict: string;
  dispatchPinCode: number;
  unitsPerCarton: number;
  shippingWeight: number;
  packagingType: string;
  // deliveryPartner: string
  deliveryInstruction: string;
  shelfing_storage_req: string;
  // allowSingleQuantity?: boolean
  discountOptions?: string;
  productStatus?: string;
  visibility: "public" | "hidden";
  purchaseNote?: string;
  images: string[];
  shortVideo?: string;
  certificate?: string[];
  oemLetter?: string;
  productComparisionSheet?: string;
  allowProductReviews: boolean;
  reviews?: string[] | Review[]; // fixed
  ratings?: number;
  shopId: string | Seller;
  sold_out: number;
  createdAt: Date;
  updatedAt: Date;
  commission?: number;
  commissionHistory?: { commission: number; updatedAt: string }[];
  visibilityBySeller: boolean;
  visibilityByAdmin: boolean;
  brand?: string;
}

export type Address = {
  _id?: string;
  reciever_name: string;
  phone: string;
  instituteAddress1: string;
  district: string;
  state: string;
  pincode: string;
  instituteAddress2?: string;
  landmark?: string;
  alternatePhone?: string;
  addressType?: string;
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
  password: string;
  transections: Transaction[];
  __v: number;
};

type PaymentInfo = {
  id?: string;
  status?: string;
  method?: string;
  // paidAt?: string;
};

export type Order = {
  _id: string;
  cart?: {
    productId: string | Product;
    variantId: string | Variant;
    qty: number;
    shopId: string;
    isReviewed?: boolean; // ✅ add this
  }[];
  shippingAddress: Address;
  user: string | User;
  totalPrice: number;
  tax?: number;
  unitPrice?: number;
  status:
    | "Created"
    | "Paid"
    | "Processing"
    | "Packed"
    | "Shipped"
    | "Delivered"
    | "Cancelled"
    | "Processing refund"
    | "Refund Success";
  paymentInfo?: PaymentInfo;
  paidAt?: Date;
  deliveredAt?: Date;
  createdAt?: Date;
  shop?: string | Seller;
  variant: string | Variant;
  qty: number;
  statusHistory: {
    _id: string;
    type:
      | "Created"
      | "Paid"
      | "Processing"
      | "Packed"
      | "Shipped"
      | "Delivered"
      | "Cancelled"
      | "Processing refund"
      | "Refund Success";
    updatedAt: string;
  }[];
  trackingDetails?: {
    logisticPartner: string;
    pickupPerson: string;
    pickupPersonPhone: number;
    trackingNumber: string;
    trackingDocument: string;
  };
  paymentFile:null | string
};

export type CategoryApiRes = {
  _id: string;
  name: string;
  subcategories: string[];
  createdAt: Date;
  updatedAt: Date;
};

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
};

// SUPPORT TYPES /////
export interface SupportMessage {
  _id: string;
  from: 'User' | 'Admin' | 'Seller';
  message: string;
  date: string;
  attachments?: string[];
}

export interface SupportTicket {
  _id: string;
  caseId: string;
  userType: 'Seller' | 'Customer' | 'Institute';
  user: string | User;
  topic: string;
  message: string;
  status: 'New' | 'In Progress' | 'Closed';
  conversation: SupportMessage[];
  documents: string[];
  createdAt: string;
  updatedAt: string;
}
