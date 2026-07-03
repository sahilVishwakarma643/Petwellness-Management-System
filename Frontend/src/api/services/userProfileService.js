import API from "../api";

export const getUserProfile = async () => {
  return API.get("/profile/me");
};

export const updateUserProfile = async (formData) => {
  return API.patch("/profile/Edit", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
