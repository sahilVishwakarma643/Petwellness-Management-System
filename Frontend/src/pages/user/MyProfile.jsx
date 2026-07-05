import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API from "../../api/api";
import { getUserProfile, updateUserProfile } from "../../api/services/userProfileService";

function resolveProfileImageSrc(profileImagePath) {
  if (!profileImagePath) return "";

  const normalizedPath = profileImagePath.replace(/\\/g, "/");
  if (normalizedPath.startsWith("http://") || normalizedPath.startsWith("https://")) {
    return normalizedPath;
  }

  try {
    if (normalizedPath.startsWith("/uploads/")) {
      return new URL(normalizedPath, API.defaults.baseURL).toString();
    }
    if (normalizedPath.startsWith("uploads/")) {
      return new URL(`/${normalizedPath}`, API.defaults.baseURL).toString();
    }
    const uploadsIndex = normalizedPath.indexOf("/uploads/");
    if (uploadsIndex >= 0) {
      return new URL(normalizedPath.slice(uploadsIndex), API.defaults.baseURL).toString();
    }
    return new URL(normalizedPath, API.defaults.baseURL).toString();
  } catch {
    return normalizedPath;
  }
}

function addCacheBuster(imageSrc, cacheToken) {
  if (!imageSrc) return "";

  try {
    const url = new URL(imageSrc);
    if (cacheToken) {
      url.searchParams.set("v", cacheToken);
    }
    return url.toString();
  } catch {
    return imageSrc;
  }
}

function normalizeGenderValue(value) {
  if (!value) return "";

  const normalized = String(value).trim().toUpperCase().replace(/\s+/g, "_");
  if (
    normalized === "MALE" ||
    normalized === "FEMALE" ||
    normalized === "OTHER" ||
    normalized === "PREFER_NOT_TO_DISCLOSE"
  ) {
    return normalized;
  }

  return normalized;
}

export default function MyProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [profileImageFailed, setProfileImageFailed] = useState(false);
  const [profileImageVersion, setProfileImageVersion] = useState(Date.now().toString());
  const [formData,setFormData]=useState({

  fullName:"",
  phoneNumber: "",
  gender: "",
  dateOfBirth: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
  });

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await getUserProfile();
      setProfile(response.data);
      
      setFormData({

      fullName: response.data.fullName || "",
      phoneNumber: response.data.phoneNumber || "",
      gender: normalizeGenderValue(response.data.gender),
      dateOfBirth: response.data.dateOfBirth?.split("T")[0] || "",
      street: response.data.street || "",
      city: response.data.city || "",
      state: response.data.state || "",
      pincode: response.data.pincode || "",
    
      });
    } catch (err) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    setEditMode(location.pathname.endsWith("/edit"));
  }, [location.pathname]);

  useEffect(() => {
    setProfileImageFailed(false);
  }, [profile?.profileImagePath]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: name === "gender" ? normalizeGenderValue(value) : value,
    }));
  };

  const handleEditToggle = () => {
    navigate("/profile/edit");
  };

  const handleCancel = () => {
    setFormData({
      fullName: profile.fullName || "",
      phoneNumber: profile.phoneNumber || "",
      gender: normalizeGenderValue(profile.gender),
      dateOfBirth: profile.dateOfBirth?.split("T")[0] || "",
      street: profile.street || "",
      city: profile.city || "",
      state: profile.state || "",
      pincode: profile.pincode || "",
    });
    setEditMode(false);
    setSuccessMessage("");
    setError("");
    setSelectedFile(null);
    setPreviewUrl(null);
    navigate("/profile/me");
  };

  const handleSaveProfile = async () => {
    try {
      setSaveLoading(true);
      setError("");

      const data = new FormData();
      data.append("fullName", formData.fullName);
      data.append("phoneNumber", formData.phoneNumber);
      data.append("gender", normalizeGenderValue(formData.gender));
      data.append("dateOfBirth", formData.dateOfBirth);
      data.append("street", formData.street);
      data.append("city", formData.city);
      data.append("state", formData.state);
      data.append("pincode", formData.pincode);

      if (selectedFile) {
        data.append("profileImage", selectedFile);
      }
      await updateUserProfile(data);
      setProfileImageFailed(false);
      await loadProfile();
      setProfileImageVersion(Date.now().toString());

      setSuccessMessage("Profile Updated Successfully");
      setEditMode(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setTimeout(() => {
        setSuccessMessage("");
        navigate("/profile/me");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  const profileImageSrc = profile ? addCacheBuster(resolveProfileImageSrc(profile.profileImagePath), profileImageVersion) : "";
  const pageShellClassName = editMode
    ? "fixed inset-0 z-50 overflow-y-auto bg-gradient-to-br from-teal-50 via-cyan-50 to-slate-50"
    : "min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-slate-50 py-6 sm:py-8";

  return (
    <motion.div
      className={pageShellClassName}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <div className={editMode ? "mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8" : "mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8"}>
        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 rounded-2xl border border-teal-200 bg-teal-50/90 p-4 text-teal-800 shadow-sm">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-rose-700 shadow-sm">
            {error}
          </div>
        )}

        <div className="mb-6 flex items-center justify-between gap-4 rounded-3xl border border-white/70 bg-white/70 px-5 py-4 shadow-[0_12px_40px_rgba(20,184,166,0.12)] backdrop-blur">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-teal-700">Account</p>
            <h1 className="mt-1 text-3xl font-extrabold text-slate-900">My Profile</h1>
          </div>
          {editMode ? (
            <div className="hidden rounded-full bg-teal-100 px-4 py-2 text-xs font-semibold text-teal-800 sm:block">
              Edit mode
            </div>
          ) : (
            <Link
              to="/user-dashboard"
              aria-label="Back to dashboard"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-teal-200 bg-white text-2xl font-bold text-teal-700 shadow-sm transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800"
            >
              ×
            </Link>
          )}
        </div>

        {profile ? (
          <>
            {!editMode ? (
              // ========== VIEW MODE ==========
              <div className="space-y-5">
                <div className="flex flex-col items-center gap-5 rounded-[28px] border border-teal-100 bg-white/80 p-6 shadow-[0_18px_50px_rgba(15,118,110,0.12)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                  {profileImageSrc && !profileImageFailed ? (
                    <img
                      src={profileImageSrc}
                      alt={`${profile.fullName || "User"} profile`}
                      className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-lg shadow-teal-100"
                      onError={() => setProfileImageFailed(true)}
                    />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-teal-200 to-cyan-200 text-3xl font-bold text-teal-800 shadow-lg shadow-teal-100">
                      {(profile.fullName || profile.firstName || "P").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="text-center sm:text-left">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600">Pet Wellness member</p>
                    <h2 className="mt-1 text-3xl font-extrabold text-slate-900">{profile.fullName || "My Profile"}</h2>
                    <p className="mt-2 text-sm text-slate-500">{profile.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-teal-100 bg-white/80 p-4 shadow-sm backdrop-blur">
                    <label className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600">Email</label>
                    <p className="mt-1 text-slate-800">{profile.email}</p>
                  </div>
                  <div className="rounded-2xl border border-teal-100 bg-white/80 p-4 shadow-sm backdrop-blur">
                    <label className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600">Full Name</label>
                    <p className="mt-1 text-slate-800">{profile.fullName}</p>
                  </div>
                  <div className="rounded-2xl border border-teal-100 bg-white/80 p-4 shadow-sm backdrop-blur">
                    <label className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600">Phone</label>
                    <p className="mt-1 text-slate-800">{profile.phoneNumber}</p>
                  </div>
                  <div className="rounded-2xl border border-teal-100 bg-white/80 p-4 shadow-sm backdrop-blur">
                    <label className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600">Gender</label>
                    <p className="mt-1 text-slate-800">{profile.gender}</p>
                  </div>
                  <div className="rounded-2xl border border-teal-100 bg-white/80 p-4 shadow-sm backdrop-blur">
                    <label className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600">Date of Birth</label>
                    <p className="mt-1 text-slate-800">{profile.dateOfBirth?.split("T")[0]}</p>
                  </div>
                  <div className="rounded-2xl border border-teal-100 bg-white/80 p-4 shadow-sm backdrop-blur">
                    <label className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600">Pincode</label>
                    <p className="mt-1 text-slate-800">{profile.pincode}</p>
                  </div>
                  <div className="rounded-2xl border border-teal-100 bg-white/80 p-4 shadow-sm backdrop-blur md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600">Address</label>
                    <p className="mt-1 text-slate-800">
                      {profile.street}, {profile.city}, {profile.state}
                    </p>
                  </div>
                </div>

                {/* Edit Button */}
                <div className="mt-2">
                  <button
                    onClick={handleEditToggle}
                    className="rounded-full bg-teal-600 px-6 py-2.5 font-semibold text-white shadow-lg shadow-teal-200 transition hover:bg-teal-700 hover:shadow-teal-300"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            ) : (
              // ========== EDIT MODE ==========
              <form className="flex flex-1 flex-col gap-6">
                <div className="rounded-[28px] border border-teal-100 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,118,110,0.12)] backdrop-blur md:p-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border border-teal-100 bg-white px-3 py-2.5 text-slate-800 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-200"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Phone</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border border-teal-100 bg-white px-3 py-2.5 text-slate-800 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-200"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border border-teal-100 bg-white px-3 py-2.5 text-slate-800 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-200"
                    >
                      <option value="">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border border-teal-100 bg-white px-3 py-2.5 text-slate-800 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-200"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Street</label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border border-teal-100 bg-white px-3 py-2.5 text-slate-800 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-200"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border border-teal-100 bg-white px-3 py-2.5 text-slate-800 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-200"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border border-teal-100 bg-white px-3 py-2.5 text-slate-800 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-200"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border border-teal-100 bg-white px-3 py-2.5 text-slate-800 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-200"
                    />
                  </div>
                </div>
                </div>

                {/* File Upload */}
                <div className="rounded-[28px] border border-teal-100 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,118,110,0.12)] backdrop-blur">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Profile Picture</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setSelectedFile(file);
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => setPreviewUrl(event.target.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full rounded-2xl border border-teal-100 bg-white px-3 py-2.5 text-slate-800 outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-teal-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-teal-800 hover:file:bg-teal-200"
                  />
                  {previewUrl && (
                    <div className="mt-4 flex justify-center">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg shadow-teal-100"
                      />
                    </div>
                  )}
                  {selectedFile && <p className="mt-2 text-sm text-slate-500">Selected: {selectedFile.name}</p>}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 pb-6">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={saveLoading}
                    className="rounded-full bg-teal-600 px-6 py-2.5 font-semibold text-white shadow-lg shadow-teal-200 transition hover:bg-teal-700 hover:shadow-teal-300 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {saveLoading ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saveLoading}
                    className="rounded-full border border-teal-200 bg-white px-6 py-2.5 font-semibold text-teal-700 transition hover:border-teal-300 hover:bg-teal-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          <div>No profile data</div>
        )}
      </div>
    </motion.div>
  );
}
