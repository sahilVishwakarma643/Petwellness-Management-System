import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

  return (
  <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
    {/* Success Message */}
    {successMessage && (
      <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
        {successMessage}
      </div>
    )}

    {/* Error Message */}
    {error && (
      <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {error}
      </div>
    )}

    <h1 className="text-3xl font-bold  text-slate-900 mb-6">My Profile</h1>

    {profile ? (
      <>
        {!editMode ? (
          // ========== VIEW MODE ==========
          <div className="space-y-4">
            <div className="mb-6 flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
              {profileImageSrc && !profileImageFailed ? (
                <img
                  src={profileImageSrc}
                  alt={`${profile.fullName || "User"} profile`}
                  className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-md"
                  onError={() => setProfileImageFailed(true)}
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-emerald-100 text-3xl font-bold text-emerald-700 shadow-md">
                  {(profile.fullName || profile.firstName || "P").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-center sm:text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">My Profile</p>
                <h1 className="mt-1 text-3xl font-bold text-slate-900">{profile.fullName || "My Profile"}</h1>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-600 font-semibold">Email:</label>
                <p className="text-gray-800">{profile.email}</p>
              </div>
              <div>
                <label className="text-gray-600 font-semibold">Full Name:</label>
                <p className="text-gray-800">{profile.fullName}</p>
              </div>
              <div>
                <label className="text-gray-600 font-semibold">Phone:</label>
                <p className="text-gray-800">{profile.phoneNumber}</p>
              </div>
              <div>
                <label className="text-gray-600 font-semibold">Gender:</label>
                <p className="text-gray-800">{profile.gender}</p>
              </div>
              <div>
                <label className="text-gray-600 font-semibold">Date of Birth:</label>
                <p className="text-gray-800">{profile.dateOfBirth?.split("T")[0]}</p>
              </div>
              <div>
                <label className="text-gray-600 font-semibold">Pincode:</label>
                <p className="text-gray-800">{profile.pincode}</p>
              </div>
              <div className="col-span-2">
                <label className="text-gray-600 font-semibold">Address:</label>
                <p className="text-gray-800">
                  {profile.street}, {profile.city}, {profile.state}
                </p>
              </div>
            </div>

            {/* Edit Button */}
            <div className="mt-6">
              <button
                onClick={handleEditToggle}
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Edit Profile
              </button>
            </div>
          </div>
        ) : (
          // ========== EDIT MODE ==========
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Full Name:</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-gray-800"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Phone:</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-gray-800"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Gender:</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-gray-800"
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Date of Birth:</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-gray-800"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Street:</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-gray-800"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">City:</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-gray-800"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">State:</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-gray-800"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Pincode:</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-gray-800"
                />
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Profile Picture:</label>
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
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
              {previewUrl && (
                <div className="mt-4 flex justify-center">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
                  />
                </div>
              )}
              {selectedFile && (
                <p className="text-sm text-gray-600 mt-2">Selected: {selectedFile.name}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saveLoading}
                className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition disabled:bg-gray-400"
              >
                {saveLoading ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={saveLoading}
                className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition disabled:bg-gray-400"
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
  );
}
