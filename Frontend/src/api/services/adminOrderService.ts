import API from "../api";

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "FAILED";

export type AdminOrderItem = {
  id: number;
  productId: number;
  productName: string;
  priceAtPurchase: number;
  quantity: number;
  lineTotal: number;
};

export type AdminOrder = {
  id: number;
  status: OrderStatus;
  totalAmount: number;
  cancelReason: string | null;
  shippingAddress: string;
  shippingPincode: string;
  createdAt: string;
  items: AdminOrderItem[];
};

type AdminOrderParams = {
  status?: OrderStatus;
  offset?: number;
  limit?: number;
};

type PageResponse<T> = {
  content?: T[];
  totalPages?: number;
  totalElements?: number;
  number?: number;
  size?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
};

export type OrderPage = {
  content: AdminOrder[];
  totalPages: number;
  totalElements: number;
  page: number;
  size: number;
  first: boolean;
  last: boolean;
};

function normalizeItem(item: any): AdminOrderItem {
  return {
    id: Number(item?.id || 0),
    productId: Number(item?.productId || 0),
    productName: item?.productName || "",
    priceAtPurchase: Number(item?.priceAtPurchase || 0),
    quantity: Number(item?.quantity || 0),
    lineTotal: Number(item?.lineTotal || 0),
  };
}

function normalizeOrder(order: any): AdminOrder {
  return {
    id: Number(order?.id || 0),
    status: order?.status || "FAILED",
    totalAmount: Number(order?.totalAmount || 0),
    cancelReason: order?.cancelReason || null,
    shippingAddress: order?.shippingAddress || "",
    shippingPincode: order?.shippingPincode || "",
    createdAt: order?.createdAt || "",
    items: Array.isArray(order?.items) ? order.items.map(normalizeItem) : [],
  };
}

function normalizePage(data: PageResponse<any> | undefined): OrderPage {
  const content = Array.isArray(data?.content) ? data!.content.map(normalizeOrder) : [];

  return {
    content,
    totalPages: Number(data?.totalPages || 0),
    totalElements: Number(data?.totalElements || content.length),
    page: Number(data?.number || 0),
    size: Number(data?.size || 10),
    first: Boolean(data?.first),
    last: Boolean(data?.last),
  };
}

export async function getAdminOrders(params: AdminOrderParams = {}): Promise<OrderPage> {
  const response = await API.get("/admin/orders", { params });
  return normalizePage(response.data);
}

export async function getAdminOrderById(id: number | string): Promise<AdminOrder> {
  const response = await API.get(`/admin/orders/${id}`);
  return normalizeOrder(response.data);
}

export async function updateOrderStatus(id: number | string, status: OrderStatus): Promise<AdminOrder> {
  const response = await API.patch(`/admin/orders/${id}/status`, { status });
  return normalizeOrder(response.data);
}

export async function cancelOrderAdmin(id: number | string, reason: string): Promise<AdminOrder> {
  const response = await API.post(`/admin/orders/${id}/cancel`, { reason });
  return normalizeOrder(response.data);
}
