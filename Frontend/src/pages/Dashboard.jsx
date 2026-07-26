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
import { getLoggedInFirstName } from "../utils/userDisplay";

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
  return parsed.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  });
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
  const [searchTerm, setSearchTerm] = useState("");
  const [summary, setSummary] = useState({
    ownerFullName: "",
    petCount: 0,
    activeOrderCount: 0,
    appointments: [],
    orders: [],
    products: [],
    vaccineReminders: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const resolvedOwnerName = useMemo(() => summary.ownerFullName || getLoggedInFirstName(user.name), [summary.ownerFullName]);
  const owner = useMemo(
    () => ({
      name: resolvedOwnerName,
      avatar: (resolvedOwnerName?.charAt(0) || user.avatar).toUpperCase(),
    }),
    [resolvedOwnerName]
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

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const searchMatches = (parts) => {
    if (!normalizedSearch) return true;
    return parts.some((part) => String(part || "").toLowerCase().includes(normalizedSearch));
  };

  const filteredAppointments = useMemo(
    () =>
      mapAppointments(summary.appointments).filter((appointment) =>
        searchMatches([appointment.pet, appointment.doctor, appointment.title, appointment.time, appointment.month, appointment.day, appointment.year])
      ),
    [summary.appointments, normalizedSearch]
  );

  const filteredOrders = useMemo(
    () =>
      mapOrders(summary.orders).filter((order) =>
        searchMatches([order.name, order.status, order.date, order.price])
      ),
    [summary.orders, normalizedSearch]
  );

  const activeOrderCount = useMemo(
    () => Number(summary.activeOrderCount || 0),
    [summary.activeOrderCount]
  );

  const filteredProducts = useMemo(
    () =>
      mapProducts(summary.products).filter((product) =>
        searchMatches([product.name, product.brand, product.price])
      ),
    [summary.products, normalizedSearch]
  );

  const filteredReminders = useMemo(
    () =>
      mapReminders(summary.vaccineReminders).filter((reminder) =>
        searchMatches([reminder.name, reminder.pet, reminder.dueText, reminder.status])
      ),
    [summary.vaccineReminders, normalizedSearch]
  );

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
        value: String(activeOrderCount),
        label: "Total Orders",
        badge: activeOrderCount ? "Active orders only" : "No active orders",
        badgeTone: activeOrderCount ? "yellow" : "blue",
        iconBg: "bg-app-blue-light",
      },
      {
        icon: "\uD83D\uDC36",
        value: String(summary.petCount),
        label: "Total Pets",
        badge: summary.petCount ? "Registered pets" : "No pets yet",
        badgeTone: summary.petCount ? "green" : "blue",
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
    [summary.appointments.length, activeOrderCount, summary.petCount, summary.vaccineReminders.length]
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
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search dashboard..."
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
              <AppointmentCard appointments={filteredAppointments} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.2 }}>
              <VaccineReminders vaccines={filteredReminders} />
            </motion.div>
          </div>

          <div className="space-y-5">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.2 }}>
              <Marketplace products={filteredProducts} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.2 }}>
              <RecentOrders orders={filteredOrders} />
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
