import apiClient from "./apiClient";
import axios from "axios";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

/** Fetch photos by category with optional pagination */
export const getPhotosByCategory = async (
  category: string,
  page = 1,
  limit = 30,
  showAll = false
) => {
  const res = await apiClient.get(`/api/photos/category/${category}`, {
    params: { page, limit, showAll },
    withCredentials: true,
  });
  return res.data;
};

export const updatePhotoTags = async (id: string, tags: string[]) => {
  const res = await axios.put(
    `${BACKEND_URL}/api/photos/${id}/tags`,
    { tags },
    { withCredentials: true }
  );
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

export const togglePhotoFeatured = async (id: string, isVisible: boolean) => {
  const res = await apiClient.put(
    `/api/photos/${id}/featured`,
    { isVisible },
    { withCredentials: true }
  );
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

export const updatePhotoTitle = async (id: string, title: string) => {
  const res = await apiClient.put(`/api/photos/${id}/title`, { title });
  return res.data;
};

export async function fetchMenuTexts() {
  const res = await fetch("/api/texts/menu");
  return res.json();
}

export const checkUserExists = async (email: string) => {
  const res = await apiClient.get(`/api/users/exists`, {
    params: { email },
    withCredentials: true,
  });
  return res.data; // { exists: true/false }
};

export interface PhotoshootPackage {
  id: string;
  displayName: string;
  internalName: string;
  shortName: string;
  basePrice: string;
  durationHrs: number;
  maxPhotos: number;
  description?: string;
  image?: string;
  link?: string;
}

/** Fetch all packages from backend */
export const getAllPackages = async (): Promise<PhotoshootPackage[]> => {
  const res = await apiClient.get("/api/packages", { withCredentials: true });

  // Extract packages array
  const packages = res.data?.packages;
  if (!Array.isArray(packages)) {
    console.warn("Expected array of packages but got:", packages);
    return [];
  }

  return packages;
};

/** Fetch only active wedding packages */
export const getActiveWeddingPackages = async (): Promise<
  PhotoshootPackage[]
> => {
  const packages = await getAllPackages();
  return packages.filter((p) => p.internalName.includes("WED"));
};
