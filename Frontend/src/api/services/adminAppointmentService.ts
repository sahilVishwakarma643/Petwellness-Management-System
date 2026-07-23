import API from "../api";

export type AppointmentType = "ONLINE" | "CLINIC";
export type AppointmentStatus = "AVAILABLE" | "BOOKED";

export type AdminAppointment = {
  id: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  veterinarianName: string;
  appointmentType: AppointmentType;
  status: AppointmentStatus;
  userId: number | null;
  petId: number | null;
  createdAt: string;
};

export type AppointmentPayload = {
  appointmentDate: string;
  startTime: string;
  endTime: string;
  veterinarianName: string;
  appointmentType: AppointmentType;
  status?: AppointmentStatus;
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

export type AppointmentPage = {
  content: AdminAppointment[];
  totalPages: number;
  totalElements: number;
  page: number;
  size: number;
  first: boolean;
  last: boolean;
};

function normalizeAppointment(item: any): AdminAppointment {
  return {
    id: Number(item?.id || 0),
    appointmentDate: item?.appointmentDate || "",
    startTime: item?.startTime || "",
    endTime: item?.endTime || "",
    veterinarianName: item?.veterinarianName || "",
    appointmentType: item?.appointmentType || "ONLINE",
    status: item?.status || "AVAILABLE",
    userId: item?.userId ?? null,
    petId: item?.petId ?? null,
    createdAt: item?.createdAt || "",
  };
}

function normalizePage(data: PageResponse<any> | undefined): AppointmentPage {
  const content = Array.isArray(data?.content) ? data!.content.map(normalizeAppointment) : [];

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

export async function getAllAppointments(params: { offset?: number; limit?: number } = {}): Promise<AppointmentPage> {
  const response = await API.get("/admin/appointments/all", { params });
  return normalizePage(response.data);
}

export async function getBookedAppointments(params: { offset?: number; limit?: number } = {}): Promise<AppointmentPage> {
  const response = await API.get("/admin/appointments/booked", { params });
  return normalizePage(response.data);
}

export async function createAppointment(data: AppointmentPayload): Promise<AdminAppointment> {
  const response = await API.post("/admin/appointments/create", data);
  return normalizeAppointment(response.data);
}

export async function updateAppointment(id: number | string, data: AppointmentPayload): Promise<AdminAppointment> {
  const response = await API.patch(`/admin/appointments/update/${id}`, data);
  return normalizeAppointment(response.data);
}

export async function deleteAppointment(id: number | string): Promise<string> {
  const response = await API.delete(`/admin/appointments/delete/${id}`);
  return response.data;
}
