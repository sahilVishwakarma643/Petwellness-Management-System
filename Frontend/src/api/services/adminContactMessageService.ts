import API from "../api";

export type AdminContactMessage = {
  id: number;
  userId?: number | null;
  senderName: string;
  senderEmail: string;
  phoneNumber: string;
  message: string;
  replyMessage?: string | null;
  status: "UNREAD" | "READ" | "REPLIED" | "INVALID";
  createdAt: string;
  readAt?: string | null;
  repliedAt?: string | null;
};

type ActionResponse = {
  message?: string;
};

export async function getAdminContactMessages(status = "ALL", offset = 0, limit = 20) {
  const response = await API.get<AdminContactMessage[]>("/admin/contact-messages", {
    params: { status, offset, limit },
  });
  return response.data || [];
}

export async function getUnreadContactMessageCount() {
  const response = await API.get<{ unreadCount: number }>("/admin/contact-messages/unread-count");
  return Number(response.data?.unreadCount || 0);
}

export async function markContactMessageAsRead(messageId: number) {
  const response = await API.patch<ActionResponse>(`/admin/contact-messages/${messageId}/read`);
  return response.data?.message || "Message marked as read.";
}

export async function markContactMessageAsInvalid(messageId: number) {
  const response = await API.patch<ActionResponse>(`/admin/contact-messages/${messageId}/invalid`);
  return response.data?.message || "Message marked as invalid.";
}

export async function deleteContactMessage(messageId: number) {
  const response = await API.delete<ActionResponse>(`/admin/contact-messages/${messageId}`);
  return response.data?.message || "Message deleted successfully.";
}

export async function replyToContactMessage(messageId: number, replyMessage: string) {
  const response = await API.post<ActionResponse>(`/admin/contact-messages/${messageId}/reply`, {
    replyMessage,
  });
  return response.data?.message || "Reply sent successfully.";
}

export async function submitContactMessage(payload: {
  name: string;
  email: string;
  phoneNumber: string;
  message: string;
}) {
  const response = await API.post<ActionResponse>("/contact-messages", payload);
  return response.data?.message || "Message sent to admin notification inbox.";
}
