import { Order } from "@/Types/types";
import { getDisplayOrderStatus, getOrderStatusBucket, isRevenueRecognizedOrder } from "./orderStatus";

export type OrderStatusFilter =
  | "All"
  | "Pending"
  | "Processing"
  | "Delivered"
  | "Cancelled"
  | "Return";

export type StatusMetric = {
  count: number;
  amount: number;
};

export type TopProductMetric = {
  productId: string;
  productName: string;
  unitsSold: number;
  orderCount: number;
  revenue: number;
  grossAmount: number;
  returnCount: number;
  cancelCount: number;
};

export type OrderAnalyticsSummary = {
  counts: Record<OrderStatusFilter, number>;
  statusMetrics: Record<OrderStatusFilter, StatusMetric>;
  activeRequestCount: number;
  deliveredRevenue: number;
  deliveredGrossAmount: number;
  averageOrderValue: number;
  cancellationRate: number;
  returnRate: number;
  fulfillmentRate: number;
  topProducts: TopProductMetric[];
};

function getOrderAmount(order: Order) {
  const explicitTotal = Number(order.totalPrice ?? 0);
  if (Number.isFinite(explicitTotal) && explicitTotal > 0) return explicitTotal;

  const unitAmount = Number(order.discounted_amount ?? order.unitPrice ?? 0);
  const qty = Number(order.qty ?? 0);
  return unitAmount * qty;
}

function getOrderProductInfo(order: Order) {
  if (typeof order.variant === "string" || !order.variant?.productId) {
    return { productId: "unknown", productName: "Unknown Product" };
  }

  const product = order.variant.productId;
  if (typeof product === "string") {
    return { productId: product, productName: "Unknown Product" };
  }

  return {
    productId: product._id || "unknown",
    productName: product.name || "Unknown Product",
  };
}

export function getOrderAnalytics(orders: Order[]): OrderAnalyticsSummary {
  const counts: Record<OrderStatusFilter, number> = {
    All: 0,
    Pending: 0,
    Processing: 0,
    Delivered: 0,
    Cancelled: 0,
    Return: 0,
  };

  const statusMetrics: Record<OrderStatusFilter, StatusMetric> = {
    All: { count: 0, amount: 0 },
    Pending: { count: 0, amount: 0 },
    Processing: { count: 0, amount: 0 },
    Delivered: { count: 0, amount: 0 },
    Cancelled: { count: 0, amount: 0 },
    Return: { count: 0, amount: 0 },
  };

  let activeRequestCount = 0;
  let deliveredRevenue = 0;
  let deliveredGrossAmount = 0;
  let cancelledCount = 0;
  let returnedCount = 0;
  let fulfilledCount = 0;

  const productMetrics = new Map<string, TopProductMetric>();

  for (const order of orders) {
    const bucket = getOrderStatusBucket(order) as OrderStatusFilter;
    const amount = getOrderAmount(order);
    const isDeliveredRevenue = isRevenueRecognizedOrder(order);

    counts.All += 1;
    statusMetrics.All.count += 1;
    statusMetrics.All.amount += amount;

    if (bucket in counts) {
      counts[bucket] += 1;
      statusMetrics[bucket].count += 1;
      statusMetrics[bucket].amount += amount;
    }

    if (order.requestSummary?.hasActiveRequest) {
      activeRequestCount += 1;
    }

    if (bucket === "Cancelled") cancelledCount += 1;
    if (bucket === "Return") returnedCount += 1;
    if (bucket === "Delivered") fulfilledCount += 1;

    if (isDeliveredRevenue) {
      deliveredRevenue += amount;
      deliveredGrossAmount += amount;
    }

    const { productId, productName } = getOrderProductInfo(order);
    const current = productMetrics.get(productId) ?? {
      productId,
      productName,
      unitsSold: 0,
      orderCount: 0,
      revenue: 0,
      grossAmount: 0,
      returnCount: 0,
      cancelCount: 0,
    };

    current.orderCount += 1;
    current.grossAmount += amount;

    if (isDeliveredRevenue) {
      current.unitsSold += Number(order.qty ?? 0);
      current.revenue += amount;
    }

    if (bucket === "Return") current.returnCount += 1;
    if (bucket === "Cancelled") current.cancelCount += 1;

    productMetrics.set(productId, current);
  }

  const totalOrders = counts.All || 1;
  const topProducts = [...productMetrics.values()]
    .sort((a, b) => {
      if (b.revenue !== a.revenue) return b.revenue - a.revenue;
      if (b.unitsSold !== a.unitsSold) return b.unitsSold - a.unitsSold;
      return b.orderCount - a.orderCount;
    })
    .slice(0, 5);

  return {
    counts,
    statusMetrics,
    activeRequestCount,
    deliveredRevenue,
    deliveredGrossAmount,
    averageOrderValue: statusMetrics.All.amount / totalOrders,
    cancellationRate: (cancelledCount / totalOrders) * 100,
    returnRate: (returnedCount / totalOrders) * 100,
    fulfillmentRate: (fulfilledCount / totalOrders) * 100,
    topProducts,
  };
}

export function getStatusFilteredOrders(orders: Order[], selectedStatus: OrderStatusFilter) {
  if (selectedStatus === "All") return orders;
  return orders.filter((order) => getOrderStatusBucket(order) === selectedStatus);
}

export function getOrderStatusDescription(order: Order) {
  return getDisplayOrderStatus(order);
}
