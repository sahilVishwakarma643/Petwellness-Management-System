export type DashboardMenuKey =
  | "dashboard"
  | "approvals"
  | "createOwner"
  | "appointments"
  | "orders"
  | "marketplace"
  | "messages"
  | "logout";

export type DashboardMenuItem = {
  key: DashboardMenuKey;
  label: string;
};

export type AdminMetric = {
  key: string;
  label: string;
  value: number;
  colorClass: string;
};

export type PendingApproval = {
  id: number;
  name: string;
  email: string;
  role: string;
  registrationDate: string;
  status: "Pending";
};

export type ApprovedUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  registrationDate: string;
  status: "Approved";
};

export type AdminUserProfile = {
  id: number;
  email: string;
  fullName: string;
  firstName: string;
  phoneNumber: string;
  gender: string;
  highestQualification: string;
  occupation: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  profileImagePath: string;
  idProofType: string;
  idProofImagePath: string;
  createdAt: string;
};

export type RegistrationPoint = {
  month: string;
  users: number;
};

export type AppointmentPoint = {
  week: string;
  appointments: number;
};

export type ActivityItem = {
  id: string;
  text: string;
  time: string;
  tone: "info" | "success" | "warning";
};

export type AdminDashboardOverview = {
  totalRegisteredUsers: number;
  pendingApprovalRequests: number;
  appointmentsBooked: number;
  marketplaceListings: number;
  registrationTrend: RegistrationPoint[];
  weeklyAppointments: AppointmentPoint[];
  recentActivities: ActivityItem[];
};

export type ToastType = "success" | "error";

export type ToastItem = {
  id: string;
  message: string;
  type: ToastType;
};
