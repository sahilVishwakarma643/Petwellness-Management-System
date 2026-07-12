import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppointmentCard from "../components/dashboard/AppointmentCard";
import Marketplace from "../components/dashboard/Marketplace";
import RecentOrders from "../components/dashboard/RecentOrders";
import Sidebar from "../components/dashboard/Sidebar";
import StatsRow from "../components/dashboard/StatsRow";
import TopBar from "../components/dashboard/TopBar";
import VaccineReminders from "../components/dashboard/VaccineReminders";
import { user } from "../data/dashboardData";
import { getUserDashboardSummary } from "../api/services/userDashboardService";

function decodeJwtPayload(token) {
  if (!token || typeof token !== "string") return {};

  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return {};

    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(normalized));
  } catch {
    return {};
  }
}

function getLoggedInName() {
  const payload = decodeJwtPayload(localStorage.getItem("token"));
  const candidates = [
    localStorage.getItem("firstName"),
    localStorage.getItem("userName"),
    payload?.firstName,
    payload?.first_name,
    payload?.fullName,
    payload?.name,
    payload?.username,
    payload?.sub,
    payload?.email,
  ];

  const chosen = candidates.find((value) => typeof value === "string" && value.trim());
  if (!chosen) return user.name;

  const clean = chosen.trim();
  if (clean.includes("@")) {
    return clean.split("@")[0];
  }

  return clean.split(" ")[0];
}

function formatDate(dateText) {
  if (!dateText) return "-";
  const d = new Date(dateText);
  if (Number.isNaN(d.getTime())) return dateText;
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function formatTime(value) {
  if (!value) return "-";
  const parsed = new Date(`1970-01-01T${value}`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function appointmentTypeLabel(type) {
  const normalized = String(type || "").toUpperCase();
  if (normalized === "ONLINE") return "Online";
  if (normalized === "CLINIC") return "Clinic";
  return normalized ? normalized.charAt(0) + normalized.slice(1).toLowerCase() : "Clinic";
}

function appointmentTypeTone(type) {
  return appointmentTypeLabel(type) === "Online" ? "Online" : "Clinic";
}

function orderEmoji(status) {
  if (status === "Delivered") return "\u2705";
  if (status === "In Transit") return "\uD83D\uDE9A";
  if (status === "Processing") return "\u23F3";
  if (status === "Cancelled") return "\u274C";
  return "\uD83D\uDCE6";
}

function productEmoji(product) {
  return product.image ? null : "\uD83D\uDECD\uFE0F";
}

function mapAppointments(appointments) {
  return appointments.map((appt, index) => {
    const date = appt.appointmentDate ? new Date(appt.appointmentDate) : null;
    const year = date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString("en-US", { year: "numeric" }) : "";
    return {
      id: appt.id ?? `appointment-${index}`,
      month: date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString("en-US", { month: "short" }) : "-",
      day: date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString("en-US", { day: "2-digit" }) : "--",
      year,
      title: appointmentTypeLabel(appt.appointmentType),
      pet: appt.petName || "Pet",
      doctor: appt.veterinarianName || "Veterinarian",
      time: `${formatTime(appt.startTime)} - ${formatTime(appt.endTime)}`,
      type: appointmentTypeTone(appt.appointmentType),
    };
  });
}

function mapOrders(orders) {
  return orders.map((order, index) => ({
    id: order.id ?? `order-${index}`,
    emoji: orderEmoji(order.status),
    name: order.summary || "Order",
    date: order.createdAt ? formatDate(order.createdAt) : "-",
    price: order.totalAmount || "-",
    status: order.status || "Pending",
    statusType: order.statusTone || "blue",
  }));
}

function mapProducts(products) {
  return products.map((product, index) => ({
    id: product.id ?? `product-${index}`,
    name: product.productName || "Product",
    price: product.price || "-",
    brand: product.brand || "",
    image: product.image || "",
    emoji: productEmoji(product),
  }));
}

function mapReminders(reminders) {
  return reminders.map((vax, index) => ({
    id: vax.id ?? `reminder-${index}`,
    icon: "\uD83D\uDC89",
    name: vax.vaccineName || "Vaccine",
    pet: vax.petName || "Pet",
    dueText: vax.nextDueDate ? formatDate(vax.nextDueDate) : "Upcoming",
    status: vax.status || "On Track",
  }));
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [summary, setSummary] = useState({
    appointments: [],
    orders: [],
    products: [],
    vaccineReminders: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const ownerName = useMemo(() => getLoggedInName(), []);
  const owner = useMemo(
    () => ({
      name: ownerName,
      avatar: (ownerName?.charAt(0) || user.avatar).toUpperCase(),
    }),
    [ownerName]
  );

  const dateText = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "2-digit",
        year: "numeric",
      }),
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setIsLoading(true);
      try {
        setPageError("");
        const data = await getUserDashboardSummary();
        if (cancelled) return;
        setSummary(data);
      } catch (error) {
        if (cancelled) return;
        setPageError(error?.response?.data?.message || "Failed to load dashboard data.");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  const statItems = useMemo(
    () => [
      {
        icon: "\uD83D\uDCC5",
        value: String(summary.appointments.length),
        label: "Booked Appointments",
        badge: summary.appointments.length ? "Live from backend" : "No bookings yet",
        badgeTone: summary.appointments.length ? "green" : "blue",
        iconBg: "bg-app-teal-light",
      },
      {
        icon: "\uD83D\uDCE6",
        value: String(summary.orders.length),
        label: "Recent Orders",
        badge: summary.orders.length ? "From shop history" : "No orders yet",
        badgeTone: summary.orders.length ? "yellow" : "blue",
        iconBg: "bg-app-blue-light",
      },
      {
        icon: "\uD83D\uDECD\uFE0F",
        value: String(summary.products.length),
        label: "Marketplace Items",
        badge: summary.products.length ? "Ready to browse" : "No products yet",
        badgeTone: summary.products.length ? "green" : "blue",
        iconBg: "bg-app-red-light",
      },
      {
        icon: "\uD83D\uDC89",
        value: String(summary.vaccineReminders.length),
        label: "Vaccine Alerts",
        badge: summary.vaccineReminders.length ? "Needs attention" : "All clear",
        badgeTone: summary.vaccineReminders.length ? "red" : "green",
        iconBg: "bg-app-green-light",
      },
    ],
    [summary.appointments.length, summary.orders.length, summary.products.length, summary.vaccineReminders.length]
  );

  const navItems = useMemo(
    () => [
      { label: "Dashboard", icon: "\uD83C\uDFE0", to: "/user-dashboard", activeRoute: true, section: "MAIN" },
      { label: "My Pets", icon: "\uD83D\uDC36", to: "/pets", section: "MAIN" },
      { label: "Appointments", icon: "\uD83D\uDCC5", to: "/appointments", section: "MAIN" },
      { label: "Marketplace", icon: "\uD83D\uDECD\uFE0F", to: "/marketplace", section: "MORE" },
      { label: "Cart", icon: "\uD83D\uDED2", to: "/cart", section: "MORE" },
      { label: "My Orders", icon: "\uD83D\uDCE6", to: "/my-orders", section: "MORE" },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-app-bg font-sans text-app-navy">
      <Sidebar
        user={owner}
        navItems={navItems}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />

      <main className={`px-4 pb-7 pt-5 ${sidebarCollapsed ? "md:ml-[92px]" : "md:ml-[270px]"} md:p-7`}>
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5">
          <TopBar
            userName={owner.name}
            onOpenSidebar={() => setSidebarOpen(true)}
            onViewProfile={() => navigate("/profile/me")}
          />

          {pageError ? (
            <div className="rounded-2xl border border-app-red bg-app-red-light px-4 py-3 text-sm font-semibold text-app-red">
              {pageError}
            </div>
          ) : null}

          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-[118px] animate-pulse rounded-2xl border border-app-border bg-app-card" />
              ))}
            </div>
          ) : (
            <StatsRow items={statItems} />
          )}

          <div className="grid gap-5 xl:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.2 }}>
              <AppointmentCard appointments={mapAppointments(summary.appointments)} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.2 }}>
              <VaccineReminders vaccines={mapReminders(summary.vaccineReminders)} />
            </motion.div>
          </div>

          <div className="space-y-5">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.2 }}>
              <Marketplace products={mapProducts(summary.products)} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.2 }}>
              <RecentOrders orders={mapOrders(summary.orders)} />
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
