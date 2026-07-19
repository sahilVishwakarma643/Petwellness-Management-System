import API from "../api";
import type { AdminUserProfile } from "../../types/adminDashboard";

export async function getAdminUserProfile(userId: string | number): Promise<AdminUserProfile> {
  const response = await API.get(`/admin/users/${userId}/profile`);
  return response.data;
}
