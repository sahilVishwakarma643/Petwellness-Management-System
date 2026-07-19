import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../../api/api";
import Sidebar from "../../components/admin/Sidebar";
import TopNavbar from "../../components/admin/TopNavbar";
import type { AdminUserProfile, DashboardMenuKey } from "../../types/adminDashboard";
import { getAdminUserProfile } from "../../api/services/adminUserProfileService";

function resolveProfileImageSrc(profileImagePath?: string) {
  if (!profileImagePath) return "";

  const normalizedPath = profileImagePath.replace(/\\/g, "/");
  if (normalizedPath.startsWith("http://") || normalizedPath.startsWith("https://")) {
    return normalizedPath;
  }

  try {
    if (normalizedPath.startsWith("/")) {
      return new URL(normalizedPath, API.defaults.baseURL).toString();
    }
    return new URL(`/${normalizedPath}`, API.defaults.baseURL).toString();
  } catch {
    return normalizedPath;
  }
}

function resolveFileSrc(filePath?: string) {
  if (!filePath) return "";

  const normalizedPath = filePath.replace(/\\/g, "/");
  if (normalizedPath.startsWith("http://") || normalizedPath.startsWith("https://")) {
    return normalizedPath;
  }

  try {
    if (normalizedPath.startsWith("/")) {
      return new URL(normalizedPath, API.defaults.baseURL).toString();
    }
    return new URL(`/${normalizedPath}`, API.defaults.baseURL).toString();
  } catch {
    return normalizedPath;
  }
}

function formatDate(value?: string) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminUserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<DashboardMenuKey>("dashboard");
  const [profile, setProfile] = useState<AdminUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      if (!userId) {
        setError("Missing user id");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const data = await getAdminUserProfile(userId);
        if (active) setProfile(data);
      } catch (err: any) {
        if (active) {
          setError(err?.response?.data?.message || err?.message || "Failed to load user profile");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, [userId]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#d9fdf2_0%,_#eff9ff_48%,_#f9fffe_100%)] text-slate-900">
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        selected={selectedMenu}
        onSelect={setSelectedMenu}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className={`min-h-screen w-full overflow-x-hidden transition-[margin-left,width] duration-300 ${sidebarCollapsed ? "md:ml-[92px] md:w-[calc(100%-92px)]" : "md:ml-[270px] md:w-[calc(100%-270px)]"}`}>
        <TopNavbar onOpenSidebar={() => setMobileSidebarOpen(true)} />

        <motion.main
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-5 px-4 py-5 sm:px-6"
        >
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Link to="/dashboard?section=approvals" className="font-semibold text-teal-700 hover:text-teal-800">
              Admin Dashboard
            </Link>
            <span className="text-slate-400">/</span>
            <span className="font-semibold text-slate-900">User Profile</span>
          </div>

          {loading ? (
            <section className="rounded-2xl border border-teal-100 bg-white p-6 shadow-md shadow-teal-100/60">
              <p className="text-sm text-slate-600">Loading profile...</p>
            </section>
          ) : error ? (
            <section className="rounded-2xl border border-rose-100 bg-white p-6 shadow-md shadow-rose-100/40">
              <p className="text-sm font-semibold text-rose-700">{error}</p>
            </section>
          ) : profile ? (
            <section className="space-y-5">
              <div className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_18px_50px_rgba(15,118,110,0.12)] backdrop-blur">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    {profile.profileImagePath ? (
                      <img
                        src={resolveProfileImageSrc(profile.profileImagePath)}
                        alt={profile.fullName || "User profile"}
                        className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg shadow-teal-100"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-teal-200 to-cyan-200 text-3xl font-bold text-teal-800 shadow-lg shadow-teal-100">
                        {(profile.fullName || profile.firstName || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.24em] text-teal-700">Admin View</p>
                      <h1 className="mt-1 text-3xl font-extrabold text-slate-900">{profile.fullName}</h1>
                      <p className="mt-1 text-sm text-slate-500">{profile.email}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="rounded-full border border-teal-200 bg-white px-5 py-2.5 text-sm font-semibold text-teal-700 hover:bg-teal-50"
                  >
                    Back
                  </button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {[
                    ["User ID", `#${profile.id}`],
                    ["First Name", profile.firstName || "-"],
                    ["Full Name", profile.fullName || "-"],
                    ["Email", profile.email || "-"],
                  ["Phone", profile.phoneNumber || "-"],
                  ["Gender", profile.gender || "-"],
                  ["Qualification", profile.highestQualification || "-"],
                  ["Occupation", profile.occupation || "-"],
                  ["Father Name", profile.fatherName || "-"],
                  ["Mother Name", profile.motherName || "-"],
                  ["Date of Birth", formatDate(profile.dateOfBirth)],
                  ["Created At", formatDate(profile.createdAt)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-teal-100 bg-white/80 p-4 shadow-sm backdrop-blur">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600">{label}</p>
                    <p className="mt-1 text-sm text-slate-800">{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-teal-100 bg-white/80 p-4 shadow-sm backdrop-blur">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600">Street</p>
                  <p className="mt-1 text-sm text-slate-800">{profile.street || "-"}</p>
                </div>
                <div className="rounded-2xl border border-teal-100 bg-white/80 p-4 shadow-sm backdrop-blur">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600">City</p>
                  <p className="mt-1 text-sm text-slate-800">{profile.city || "-"}</p>
                </div>
                <div className="rounded-2xl border border-teal-100 bg-white/80 p-4 shadow-sm backdrop-blur">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600">State</p>
                  <p className="mt-1 text-sm text-slate-800">{profile.state || "-"}</p>
                </div>
                <div className="rounded-2xl border border-teal-100 bg-white/80 p-4 shadow-sm backdrop-blur">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600">Pincode</p>
                  <p className="mt-1 text-sm text-slate-800">{profile.pincode || "-"}</p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-2xl border border-teal-100 bg-white/80 p-4 shadow-sm backdrop-blur">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600">Address Summary</p>
                  <p className="mt-2 text-sm leading-6 text-slate-800">
                    {profile.street || "-"}
                    <br />
                    {profile.city || "-"}
                    <br />
                    {profile.state || "-"}
                    <br />
                    {profile.pincode || "-"}
                  </p>
                </div>

                <div className="rounded-2xl border border-teal-100 bg-white/80 p-4 shadow-sm backdrop-blur">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600">ID Proof</p>
                      <p className="mt-1 text-sm text-slate-800">{profile.idProofType || "-"}</p>
                    </div>
                    {profile.idProofImagePath ? (
                      <a
                        href={resolveFileSrc(profile.idProofImagePath)}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-teal-200 bg-white px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-50"
                      >
                        Open Full Image
                      </a>
                    ) : null}
                  </div>

                  {profile.idProofImagePath ? (
                    <a
                      href={resolveFileSrc(profile.idProofImagePath)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 block overflow-hidden rounded-2xl border border-teal-100 bg-slate-50"
                    >
                      <img
                        src={resolveFileSrc(profile.idProofImagePath)}
                        alt="ID proof"
                        className="max-h-[420px] w-full object-contain"
                      />
                    </a>
                  ) : (
                    <p className="mt-4 text-sm text-slate-500">No ID proof image available.</p>
                  )}
                </div>
              </div>
            </section>
          ) : (
            <section className="rounded-2xl border border-teal-100 bg-white p-6 shadow-md shadow-teal-100/60">
              <p className="text-sm text-slate-600">No profile data found.</p>
            </section>
          )}
        </motion.main>
      </div>
    </div>
  );
}
