import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminCreateOwner from "./pages/admin/AdminCreateOwner";
import AdminUserProfile from "./pages/admin/AdminUserProfile";
import Dashboard from "./pages/Dashboard";
import MyPets from "./pages/MyPets";
import Register from "./pages/Register";
import SetPassword from "./pages/SetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import ApprovalPending from "./pages/ApprovalPending";
import AdminMarketplace from "./pages/Marketplace.tsx";
import UserMarketplace from "./pages/user/UserMarketplace";
import CartPage from "./pages/user/CartPage";
import CheckoutPage from "./pages/user/CheckoutPage";
import PaymentPage from "./pages/user/PaymentPage";
import OrderSuccessPage from "./pages/user/OrderSuccessPage";
import MyOrdersPage from "./pages/user/MyOrdersPage";
import OrderDetailPage from "./pages/user/OrderDetailPage";
import AppointmentListingPage from "./pages/user/AppointmentListingPage";
import MyAppointmentsPage from "./pages/user/MyAppointmentsPage";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./components/shared/Toast";
import MyProfile from "./pages/user/MyProfile.jsx";
import LegalPage from "./pages/LegalPage";
import Unauthorized from "./pages/Unauthorized";
import RequireRole from "./components/routing/RequireRole";

function UserRouteProviders({ children }) {
  return (
    <ToastProvider>
      <CartProvider>{children}</CartProvider>
    </ToastProvider>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/register" element={<Register />} />
      <Route path="/approval-pending" element={<ApprovalPending />} />
      <Route path="/set-password" element={<SetPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/legal" element={<LegalPage />} />
      <Route
        path="/dashboard"
        element={
          <RequireRole allowedRole="ADMIN">
            <AdminDashboard />
          </RequireRole>
        }
      />
      <Route
        path="/user-dashboard"
        element={
          <UserRouteProviders>
            <Dashboard />
          </UserRouteProviders>
        }
      />
      <Route
        path="/pets"
        element={
          <UserRouteProviders>
            <MyPets />
          </UserRouteProviders>
        }
      />
      
      <Route
        path="/profile/me"
        element={
          <UserRouteProviders>
            <MyProfile />
          </UserRouteProviders>
        }
      />
      <Route
        path="/profile/edit"
        element={
          <UserRouteProviders>
            <MyProfile />
          </UserRouteProviders>
        }
      />
      <Route
        path="/appointments"
        element={
          <UserRouteProviders>
            <AppointmentListingPage />
          </UserRouteProviders>
        }
      />
      <Route
        path="/my-appointments"
        element={
          <UserRouteProviders>
            <MyAppointmentsPage />
          </UserRouteProviders>
        }
      />
      <Route
        path="/marketplace"
        element={
          <UserRouteProviders>
            <UserMarketplace />
          </UserRouteProviders>
        }
      />
      <Route
        path="/cart"
        element={
          <UserRouteProviders>
            <CartPage />
          </UserRouteProviders>
        }
      />
      <Route
        path="/checkout"
        element={
          <UserRouteProviders>
            <CheckoutPage />
          </UserRouteProviders>
        }
      />
      <Route
        path="/payment/:orderId"
        element={
          <UserRouteProviders>
            <PaymentPage />
          </UserRouteProviders>
        }
      />
      <Route
        path="/order-success/:orderId"
        element={
          <UserRouteProviders>
            <OrderSuccessPage />
          </UserRouteProviders>
        }
      />
      <Route
        path="/my-orders"
        element={
          <UserRouteProviders>
            <MyOrdersPage />
          </UserRouteProviders>
        }
      />
      <Route
        path="/orders/:orderId"
        element={
          <UserRouteProviders>
            <OrderDetailPage />
          </UserRouteProviders>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <RequireRole allowedRole="ADMIN">
            <AdminOrders />
          </RequireRole>
        }
      />
      <Route
        path="/admin/orders/:orderId"
        element={
          <RequireRole allowedRole="ADMIN">
            <AdminOrderDetail />
          </RequireRole>
        }
      />
      <Route
        path="/admin/appointments"
        element={
          <RequireRole allowedRole="ADMIN">
            <AdminAppointments />
          </RequireRole>
        }
      />
      <Route
        path="/admin/create-owner"
        element={
          <RequireRole allowedRole="ADMIN">
            <AdminCreateOwner />
          </RequireRole>
        }
      />
      <Route
        path="/admin/marketplace"
        element={
          <RequireRole allowedRole="ADMIN">
            <AdminMarketplace />
          </RequireRole>
        }
      />
      <Route
        path="/admin/users/:userId/profile"
        element={
          <RequireRole allowedRole="ADMIN">
            <AdminUserProfile />
          </RequireRole>
        }
      />
    </Routes>
  );
}

export default App;
