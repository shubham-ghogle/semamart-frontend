export interface Review {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  rating: number;
  comment: string;
  productId: string;
  createdAt: Date;
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
  originalPrice: number;
  discountPrice: number;
  category: string;
  tags: string[];
  shortdescription: string;
  description: string;
  stock: number;
  sku?: string;
  stockStatus?: string;
  enableStockManagement?: boolean;
  allowSingleQuantity?: boolean;
  taxStatus?: string;
  taxClass?: string;
  upsells?: string[];
  crosssells?: string[];
  discountOptions?: { minimumQty: number; percent: number };
  rma?: string;
  minmaxrule?: string;
  productStatus?: string;
  visibility: "offline" | "online";
  purchaseNote?: string;
  allowproductreviews?: boolean;
  weight?: string;
  dimension?: string;
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

type Address = {
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
  cart: { product: Product; qty: number }[];
  shippingAddress: Address;
  user: User;
  totalPrice: number;
  status?:
    | "Processing"
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
  createdAt: Date;
  _id: string;
};
