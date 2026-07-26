import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/admin/Sidebar";
import ToastStack from "../../components/admin/ToastStack";
import TopNavbar from "../../components/admin/TopNavbar";
import {
  deleteContactMessage,
  getAdminContactMessages,
  getUnreadContactMessageCount,
  markContactMessageAsRead,
  markContactMessageAsInvalid,
  replyToContactMessage,
  type AdminContactMessage,
} from "../../api/services/adminContactMessageService";
import { logoutUser } from "../../utils/logout";
import type { DashboardMenuKey, ToastItem, ToastType } from "../../types/adminDashboard";

type FilterKey = "ALL" | "UNREAD" | "READ" | "REPLIED" | "INVALID";

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  });
}

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const maybeResponse = error as { response?: { data?: { message?: string } | string } };
    const data = maybeResponse.response?.data;
    if (typeof data === "string" && data.trim()) return data;
    if (data && typeof data === "object" && "message" in data && typeof data.message === "string") {
      return data.message;
    }
  }
  if (error instanceof Error) return error.message;
  return "Request failed";
}

function statusTone(status: AdminContactMessage["status"]) {
  if (status === "REPLIED") return "bg-emerald-100 text-emerald-700";
  if (status === "READ") return "bg-sky-100 text-sky-700";
  if (status === "INVALID") return "bg-slate-200 text-slate-700";
  return "bg-rose-100 text-rose-700";
}

export default function AdminContactMessages() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterKey>("ALL");
  const [messages, setMessages] = useState<AdminContactMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = (message: string, type: ToastType) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2500);
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      const [items, count] = await Promise.all([
        getAdminContactMessages(selectedFilter, 0, 100),
        getUnreadContactMessageCount(),
      ]);
      setMessages(items);
      setUnreadCount(count);
      setSelectedMessageId((current) => {
        if (current && items.some((item) => item.id === current)) return current;
        return items[0]?.id ?? null;
      });
    } catch (error) {
      pushToast(getErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMessages();
  }, [selectedFilter]);

  const selectedMessage = useMemo(
    () => messages.find((item) => item.id === selectedMessageId) || null,
    [messages, selectedMessageId]
  );

  useEffect(() => {
    if (!selectedMessage || selectedMessage.status !== "UNREAD") {
      return;
    }

    const selectedMessageId = selectedMessage.id;
    let cancelled = false;

    async function markRead() {
      try {
        await markContactMessageAsRead(selectedMessageId);
        if (cancelled) return;
        setMessages((prev) =>
          prev.map((item) =>
            item.id === selectedMessageId
              ? { ...item, status: "READ", readAt: item.readAt || new Date().toISOString() }
              : item
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        pushToast(getErrorMessage(error), "error");
      } finally {
        // no extra loading indicator needed for a quiet read state
      }
    }

    void markRead();
    return () => {
      cancelled = true;
    };
  }, [selectedMessage?.id]);

  useEffect(() => {
    setReplyText(selectedMessage?.replyMessage || "");
  }, [selectedMessage?.id]);

  const handleSidebarSelect = (key: DashboardMenuKey) => {
    if (key === "logout") {
      logoutUser();
      navigate("/", { replace: true });
      return;
    }

    if (key === "dashboard" || key === "approvals") {
      navigate(`/dashboard?section=${key}`);
      return;
    }

    if (key === "createOwner") {
      navigate("/admin/create-owner");
      return;
    }

    if (key === "appointments") {
      navigate("/admin/appointments");
      return;
    }

    if (key === "orders") {
      navigate("/admin/orders");
      return;
    }

    if (key === "marketplace") {
      navigate("/admin/marketplace");
      return;
    }

    navigate("/admin/contact-messages");
  };

  const handleReply = async () => {
    if (!selectedMessage) return;
    const trimmed = replyText.trim();
    if (!trimmed) {
      pushToast("Reply message is required.", "error");
      return;
    }

    setReplyingId(selectedMessage.id);
    try {
      const message = await replyToContactMessage(selectedMessage.id, trimmed);
      pushToast(message, "success");
      await loadMessages();
    } catch (error) {
      pushToast(getErrorMessage(error), "error");
    } finally {
      setReplyingId(null);
    }
  };

  const handleInvalidate = async () => {
    if (!selectedMessage) return;

    setReplyingId(selectedMessage.id);
    try {
      const message = await markContactMessageAsInvalid(selectedMessage.id);
      pushToast(message, "success");
      await loadMessages();
    } catch (error) {
      pushToast(getErrorMessage(error), "error");
    } finally {
      setReplyingId(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedMessage) return;

    setDeletingId(selectedMessage.id);
    try {
      const message = await deleteContactMessage(selectedMessage.id);
      pushToast(message, "success");
      setMessages((prev) => prev.filter((item) => item.id !== selectedMessage.id));
      setSelectedMessageId((current) => {
        const next = messages.find((item) => item.id !== selectedMessage.id)?.id ?? null;
        return current === selectedMessage.id ? next : current;
      });
      await loadMessages();
    } catch (error) {
      pushToast(getErrorMessage(error), "error");
    } finally {
      setDeletingId(null);
    }
  };

  const visibleMessages = messages.filter((item) => selectedFilter === "ALL" || item.status === selectedFilter);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#d9fdf2_0%,_#eff9ff_48%,_#f9fffe_100%)] text-slate-900">
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        selected="messages"
        onSelect={handleSidebarSelect}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div
        className={`min-h-screen w-full overflow-x-hidden transition-[margin-left,width] duration-300 ${sidebarCollapsed ? "md:ml-[92px] md:w-[calc(100%-92px)]" : "md:ml-[270px] md:w-[calc(100%-270px)]"}`}
      >
        <TopNavbar
          onOpenSidebar={() => setMobileSidebarOpen(true)}
          notificationCount={unreadCount}
          onNotificationsClick={() => navigate("/admin/contact-messages")}
        />

        <motion.main
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-5 px-4 py-5 sm:px-6"
        >
          <section className="rounded-3xl border border-teal-100 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-600">Admin Inbox</p>
                <h1 className="mt-1 text-2xl font-extrabold text-slate-900">Contact Messages</h1>
                <p className="mt-1 text-sm text-slate-500">Unread messages: {unreadCount}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {(["ALL", "UNREAD", "READ", "REPLIED", "INVALID"] as FilterKey[]).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setSelectedFilter(filter)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      selectedFilter === filter
                        ? "bg-teal-600 text-white shadow-md shadow-teal-200"
                        : "border border-teal-100 bg-white text-slate-700 hover:bg-teal-50"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.1fr_1fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
              <div className="mb-3 flex items-center justify-between px-1">
                <p className="text-sm font-semibold text-slate-700">Messages</p>
                <p className="text-xs text-slate-500">{visibleMessages.length} item(s)</p>
              </div>

              <div className="space-y-3">
                {loading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
                  ))
                ) : visibleMessages.length ? (
                  visibleMessages.map((item) => {
                    const active = item.id === selectedMessageId;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setSelectedMessageId(item.id)}
                        className={`w-full rounded-2xl border p-4 text-left transition ${
                          active
                            ? "border-teal-300 bg-teal-50 shadow-sm"
                            : "border-slate-200 bg-white hover:border-teal-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-slate-900">{item.senderName}</p>
                            <p className="text-xs text-slate-500">{item.senderEmail} • {item.phoneNumber}</p>
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusTone(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                        <p className="mt-3 line-clamp-2 text-sm text-slate-600">{item.message}</p>
                        <p className="mt-3 text-xs text-slate-400">{formatDateTime(item.createdAt)}</p>
                      </button>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                    No messages found for this filter.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              {selectedMessage ? (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-600">Selected message</p>
                      <h2 className="mt-1 text-xl font-extrabold text-slate-900">{selectedMessage.senderName}</h2>
                      <p className="text-sm text-slate-500">{selectedMessage.senderEmail} • {selectedMessage.phoneNumber}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusTone(selectedMessage.status)}`}>
                      {selectedMessage.status}
                    </span>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Message</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{selectedMessage.message}</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-xs text-slate-500">Created</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">{formatDateTime(selectedMessage.createdAt)}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-xs text-slate-500">Read at</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">{formatDateTime(selectedMessage.readAt)}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700">Reply</label>
                    <textarea
                      rows={5}
                      value={replyText}
                      onChange={(event) => setReplyText(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-400"
                      placeholder="Write a reply to the user..."
                    />
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => void handleReply()}
                        disabled={replyingId === selectedMessage.id}
                        className="rounded-full bg-teal-600 px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
                      >
                        {replyingId === selectedMessage.id ? "Sending..." : "Send Reply"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete()}
                        disabled={deletingId === selectedMessage.id}
                        className="rounded-full border border-rose-200 bg-rose-50 px-5 py-2.5 text-sm font-bold text-rose-700 disabled:cursor-not-allowed disabled:bg-slate-100"
                      >
                        {deletingId === selectedMessage.id ? "Deleting..." : "Delete Message"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleInvalidate()}
                        disabled={replyingId === selectedMessage.id}
                        className="rounded-full border border-slate-300 bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:bg-slate-100"
                      >
                        {replyingId === selectedMessage.id ? "Updating..." : "Invalidate Email"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                  Select a message to view details, mark it read, reply, or delete it.
                </div>
              )}
            </div>
          </section>
        </motion.main>
      </div>

      <ToastStack toasts={toasts} />
    </div>
  );
}
