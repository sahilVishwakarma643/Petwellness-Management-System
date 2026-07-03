import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "../../context/CartContext";
import { logoutUser } from "../../utils/logout";
import { CalendarIcon, CartIcon, ChevronLeftIcon, ChevronRightIcon, DashboardIcon, LogoutIcon, PawIcon, StoreIcon } from "../admin/Icons";

function PetIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 13.5c0-1.4 1.1-2.5 2.5-2.5h3c1.4 0 2.5 1.1 2.5 2.5V15c0 1.7-1.3 3-3 3h-2c-1.7 0-3-1.3-3-3v-1.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.2 10.2c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5Zm7.6 0c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5c-.7 0-1.2-.6-1.2-1.3S11.3 5 12 5s1.2.6 1.2 1.2-.5 1.3-1.2 1.3Z" />
    </svg>
  );
}

function OrderIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 4.5h10l2 2v12.8a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 8h5m-5 3.5h8m-8 3.5h6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.5 9.5 1.2 1.2 2.3-2.3" />
    </svg>
  );
}

function getIcon(label) {
  const className = "h-5 w-5";
  if (label === "Dashboard") return <DashboardIcon className={className} />;
  if (label === "My Pets") return <PetIcon className={className} />;
  if (label === "Appointments") return <CalendarIcon className={className} />;
  if (label === "Marketplace") return <StoreIcon className={className} />;
  if (label === "Cart") return <CartIcon className={className} />;
  if (label === "My Orders") return <OrderIcon className={className} />;
  return <DashboardIcon className={className} />;
}

function NavList({ items, onClose, collapsed }) {
  const { cartItemCount = 0 } = useCart();

  return (
    <nav className="flex-1 space-y-1">
      {items.map((item) => (
        <NavLink
          key={item.label}
          to={item.to}
          onClick={onClose}
          title={collapsed ? item.label : undefined}
          className={({ isActive }) =>
            [
              "group flex w-full items-center rounded-xl px-3 py-2 text-left text-sm transition",
              collapsed ? "justify-center px-2" : "gap-3 px-3",
              isActive
                ? "bg-teal-600 text-white shadow-md shadow-teal-300/60"
                : "text-slate-700 hover:bg-teal-100/70",
            ].join(" ")
          }
        >
          <span className="relative flex h-5 w-5 shrink-0 items-center justify-center text-base">
            {getIcon(item.label)}
            {item.to === "/cart" && cartItemCount > 0 ? (
              <span className="absolute -right-3 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#2DD4A0] px-1 text-[10px] font-bold leading-none text-white">
                {cartItemCount > 99 ? "99+" : cartItemCount}
              </span>
            ) : null}
          </span>
          {!collapsed ? <span className="whitespace-nowrap font-medium">{item.label}</span> : null}
          {!collapsed && item.badge ? (
            <span
              className={[
                "ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
                item.badgeTone === "red" ? "bg-app-red text-white" : "bg-app-teal text-white",
              ].join(" ")}
            >
              {item.badge}
            </span>
          ) : null}
        </NavLink>
      ))}
    </nav>
  );
}

export default function Sidebar({ user, navItems, isOpen, onClose, collapsed = false, onToggleCollapse }) {
  const navigate = useNavigate();
  const { clearCartState } = useCart();

  const handleLogout = () => {
    clearCartState();
    logoutUser();
    onClose?.();
    navigate("/", { replace: true });
  };

  return (
    <>
      <div
        className={[
          "fixed inset-0 z-40 bg-app-navy/30 transition-opacity md:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={onClose}
      />


      <motion.aside
        initial={false}
        animate={{
          width: collapsed ? 92 : 270,
          x: isOpen ? 0 : -300,
        }}
        transition={{ type: "spring", stiffness: 220, damping: 25 }}
        className="fixed left-0 top-0 z-50 h-screen border-r border-teal-200/60 bg-gradient-to-b from-teal-50 via-cyan-50 to-white shadow-xl md:!translate-x-0"
      >
        <div className="flex h-full flex-col px-3 py-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-sky-600 text-white">
                <PawIcon className="h-6 w-6" />
              </div>
              {!collapsed ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">PetCare</p>
                  <p className="text-sm font-bold text-slate-900">Owner Hub</p>
                </div>
              ) : null}
            </div>
            {onToggleCollapse ? (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden rounded-lg border border-teal-200 bg-white p-1 text-slate-600 hover:bg-teal-50 md:block"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
              </button>
            ) : null}
          </div>

          <NavList items={navItems} onClose={onClose} collapsed={collapsed} />

          <div className="mt-5 border-t border-teal-200/60 pt-4">
            <div className="flex items-center gap-3 rounded-xl px-2 py-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-app-teal text-sm font-bold text-white">
                {user.avatar}
              </div>
              {!collapsed ? (
                <div>
                  <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500">Pet Owner</p>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title={collapsed ? "Logout" : undefined}
              className="mt-3 flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-teal-100/70"
            >
              <LogoutIcon className="h-5 w-5" />
              {!collapsed ? <span className="font-medium">Logout</span> : null}
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}




