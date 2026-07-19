import API from "../api";

function resolveMediaUrl(rawUrl) {
  if (!rawUrl) return "";
  if (/^https?:\/\//i.test(rawUrl) || rawUrl.startsWith("blob:") || rawUrl.startsWith("data:")) {
    return rawUrl;
  }

  const baseUrl = String(API.defaults.baseURL || "");
  const apiRoot = baseUrl.replace(/\/api\/?$/, "");
  if (rawUrl.startsWith("/")) {
    return `${apiRoot}${rawUrl}`;
  }
  return rawUrl;
}

function normalizeString(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

function normalizeCurrency(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function normalizeOrderStatus(value) {
  const status = String(value || "").toUpperCase();
  if (status === "DELIVERED") return { label: "Delivered", tone: "green" };
  if (status === "SHIPPED" || status === "OUT_FOR_DELIVERY") return { label: "In Transit", tone: "yellow" };
  if (status === "PAID" || status === "PROCESSING") return { label: "Processing", tone: "blue" };
  if (status === "CANCELLED" || status === "FAILED") return { label: "Cancelled", tone: "red" };
  return { label: "Pending", tone: "blue" };
}

function normalizeReminderStatus(value) {
  const status = String(value || "").toUpperCase();
  if (status === "OVERDUE") return "Overdue";
  if (status === "UPCOMING") return "Soon";
  return "On Track";
}

export async function getUserDashboardSummary() {
  const response = await API.get("/user/dashboard/summary");
  const data = response.data || {};

  const activeOrderCount =
    typeof data.activeOrderCount === "number"
      ? data.activeOrderCount
      : Array.isArray(data.orders)
        ? data.orders.filter((item) => {
            const status = String(item?.status || "").toUpperCase();
            return status !== "CANCELLED" && status !== "FAILED";
          }).length
        : 0;

  return {
    ownerFullName: typeof data.ownerFullName === "string" ? data.ownerFullName : "",
    petCount: Number.isFinite(Number(data.petCount)) ? Number(data.petCount) : 0,
    activeOrderCount,
    appointments: Array.isArray(data.appointments)
      ? data.appointments.map((item, index) => ({
          id: item?.id ?? `appointment-${index}`,
          petName: normalizeString(item?.petName, "Pet"),
          appointmentDate: item?.appointmentDate || "",
          startTime: item?.startTime || "",
          endTime: item?.endTime || "",
          veterinarianName: normalizeString(item?.veterinarianName, "Veterinarian"),
          appointmentType: normalizeString(item?.appointmentType, "Appointment"),
        }))
      : [],
    orders: Array.isArray(data.orders)
      ? data.orders.map((item, index) => {
          const status = normalizeOrderStatus(item?.status);
          return {
            id: item?.orderId ?? `order-${index}`,
            summary: normalizeString(item?.summary, "Order"),
            image: resolveMediaUrl(item?.image),
            createdAt: item?.createdAt || "",
            totalAmount: normalizeCurrency(item?.totalAmount),
            status: status.label,
            statusTone: status.tone,
          };
        })
      : [],
    products: Array.isArray(data.products)
        ? data.products.map((item, index) => ({
          id: item?.productId ?? `product-${index}`,
          productName: normalizeString(item?.productName, "Product"),
          image: resolveMediaUrl(item?.image),
          price: normalizeCurrency(item?.price),
          brand: normalizeString(item?.brand, ""),
        }))
      : [],
    vaccineReminders: Array.isArray(data.vaccineReminders)
      ? data.vaccineReminders.map((item, index) => ({
          id: item?.id ?? `reminder-${index}`,
          petName: normalizeString(item?.petName, "Pet"),
          vaccineName: normalizeString(item?.vaccineName, "Vaccine"),
          nextDueDate: item?.nextDueDate || "",
          status: normalizeReminderStatus(item?.status),
        }))
      : [],
  };
}
