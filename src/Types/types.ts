export interface Review {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  rating: number;
  comment: string;
  productId: string;
  createdAt: Date;
}

interface Shop {
  _id: string;
  name: string;
  email: string;
  password: string;
  address: string;
  phoneNumber: number;
  role: string;
  avatar: string;
  zipCode: number;
  availableBalance: number;
  createdAt: Date;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transections: any[];
}

export interface Product {
  _id: string;
  name: string;
  hsn: string;
  productType: string;
  originalPrice: number;
  discountPrice: number;
  category: string;
  tags?: string[];
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
  discountOptions?: string;
  rma?: string;
  minmaxrule?: string;
  productStatus?: string;
  visibility?: string;
  purchaseNote?: string;
  allowproductreviews?: boolean;
  weight?: string;
  dimension?: string;
  manufacturerName?: string;
  email?: string;
  phone?: string;
  origin?: string;
  thumbnail?: string;
  images: string[];
  shortVideo?: string;
  reviews?: Review[];
  ratings?: number;
  shopId: Shop;
  sold_out: number;
  createdAt: Date;
  updatedAt: Date;
}
