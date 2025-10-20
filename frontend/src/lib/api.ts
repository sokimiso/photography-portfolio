import apiClient from "./apiClient";
import axios from "axios";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export const getPhotosByCategory = async (category: string) => {
  const res = await apiClient.get(`/api/photos/category/${category}`, {
    withCredentials: true,
  });
  return res.data;
};

export const updatePhotoTags = async (id: string, tags: string[]) => {
  const res = await axios.put(`${BACKEND_URL}/api/photos/${id}/tags`, { tags });
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
    `/api/photos/${id}/visibility`,
    { isVisible },
    { withCredentials: true }
  );
  return res.data;
};

export const deletePhoto = async (id: string) => {
  const res = await apiClient.delete(`/api/photos/${id}`, {
    withCredentials: true,
  });
  return res.data;
};

export const hardDeletePhoto = async (id: string) => {
  const res = await apiClient.delete(`/api/photos/hard/${id}`, {
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
