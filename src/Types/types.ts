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

export interface Product {
  _id: string;
  name: string;
  hsn: string;
  productType: string;
  productTypeName:string;
  originalPrice: number;
  discountPrice: number;
  category: string;
  tags: string[];
  shortdescription: string;
  description: string;
  stock: number;
  sku: string;
  stockStatus: string;
  enableStockManagement: boolean;
  allowSingleQuantity: boolean;
  taxStatus?: string;
  taxClass?: string;
  upSells?: string[];
  crossSells?: string[];
  discountOptions?: { minimumQty: number; percent: number };
  rma?: {
    label: string
    type: string
    refundReason: {
      damagedProduct: boolean
      wrongProduct: boolean
    }
    rmaPolicy: string
  };
  minmaxrule?: {
    minimumQty: number,
    maximumQty: number,
    minimumAmt: number,
    maximumAmt: number
  };
  productStatus: "offline" | "online";
  visibility: "visible" | "hidden";
  purchaseNote?: string;
  allowproductreviews: boolean;
  weight: string;
  dimension: string;
  manufacturerName: string;
  email: string;
  phone: string;
  origin: string;
  images: string[];
  shortVideo?: string;
  reviews?: Review[];
  ratings?: number;
  shopId: string | Seller;
  sold_out: number;
  createdAt: Date;
  updatedAt: Date;
  attributes?: Record<string, string>[];
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
};

export type Order = {
  _id: string
  cart: { product: Product; qty: number; isReviewed: boolean }[];
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
