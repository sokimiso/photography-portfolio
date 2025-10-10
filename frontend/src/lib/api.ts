import apiClient from "./apiClient";

export const getPhotosByCategory = async (category: string) => {
  const res = await apiClient.get(`/api/photos/category/${category}`, {
    withCredentials: true,
  });
  return res.data;
};

export const uploadPhoto = async (formData: FormData) => {
  const res = await apiClient.post(`/api/photos/upload`, formData, {
    withCredentials: true,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const togglePhotoVisibility = async (id: string, isVisible: boolean) => {
  const res = await apiClient.put(
    `/photos/${id}/visibility`,
    { isVisible },
    { withCredentials: true }
  );
  return res.data;
};

export const deletePhoto = async (id: string) => {
  const res = await apiClient.delete(`/photos/${id}`, {
    withCredentials: true,
  });
  return res.data;
};


export async function fetchMenuTexts() {
  const res = await fetch("/api/texts/menu");
  return res.json();
}

export const checkUserExists = async (email: string) => {
  const res = await apiClient.get(`/api/users/exists`, {
    params: { email },
    withCredentials: true, // keep consistent with your setup
  });
  return res.data; // { exists: true/false }
};