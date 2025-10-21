"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Breadcrumb from "../components/Breadcrumb";
import {
  getPhotosByCategory,
  uploadPhoto,
  togglePhotoVisibility,
  deletePhoto,
  hardDeletePhoto,
  updatePhotoTags,
} from "@lib/api";

export default function ManageWebComponent() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("hero");
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [photoTagInputs, setPhotoTagInputs] = useState<Record<string, string>>(
    {}
  );

  const path = ["Dashboard", "Manage Web", "Hero Photos"];
  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

  /** Load all categories from backend */
  const loadCategories = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/photos/categories`);
      const data = res.data;
      setCategories(data);
      if (data.length > 0 && !selectedCategory) {
        setSelectedCategory(data[0].name);
      }
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  /** Load photos for the selected category */
  const loadPhotos = async (categoryName?: string) => {
    try {
      const category = categoryName || selectedCategory;
      if (!category) return;
      const data = await getPhotosByCategory(category);
      setPhotos(data);

      // Initialize tag inputs for all photos
      const initialTags: Record<string, string> = {};
      data.forEach((photo: any) => {
        initialTags[photo.id] =
          photo.tags?.map((t: { name: string }) => t.name).join(", ") || "";
      });
      setPhotoTagInputs(initialTags);
    } catch (err) {
      console.error("Error loading photos:", err);
    }
  };

  /** Initial load of categories */
  useEffect(() => {
    loadCategories();
  }, []);

  /** Load photos whenever category changes */
  useEffect(() => {
    if (selectedCategory) {
      loadPhotos(selectedCategory);
    }
  }, [selectedCategory]);

  /** Upload new photo */
  const handleUpload = async () => {
    if (!selectedFile || !selectedCategory) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("title", title);
      formData.append("categories", selectedCategory);
      formData.append("tags", tags);

      await uploadPhoto(formData);
      setSelectedFile(null);
      setTitle("");
      setTags("hero");
      await loadPhotos(selectedCategory);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleToggleVisibility = async (id: string, current: boolean) => {
    await togglePhotoVisibility(id, !current);
    await loadPhotos(selectedCategory);
  };

  const handleSoftDelete = async (id: string) => {
    await deletePhoto(id);
    await loadPhotos(selectedCategory);
  };

  const handleHardDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to permanently delete this photo? This action cannot be undone."
      )
    )
      return;

    await hardDeletePhoto(id);
    await loadPhotos(selectedCategory);
  };

  const handleUpdateTags = async (photoId: string) => {
    const tagsArray = photoTagInputs[photoId]
      .split(/[,\s]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      await updatePhotoTags(photoId, tagsArray);
      await loadPhotos(selectedCategory);
    } catch (err) {
      console.error("Failed to update tags:", err);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb path={path} />

      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-4">Photo Management</h2>

        {/* Category Dropdown */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Select Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="dark:bg-gray-700 border rounded px-3 py-2 w-full md:w-1/3"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.display_name || cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Upload Form */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            value={selectedCategory}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags (comma or space separated)"
            className="border rounded px-3 py-2"
          />
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {photos.map((photo) => {
            const imageUrl = `${BACKEND_URL}${
              photo.url.startsWith("/") ? "" : "/"
            }${photo.url}`;

            return (
              <div
                key={photo.id}
                className="border rounded-lg overflow-hidden shadow-sm"
              >
                <img
                  src={imageUrl}
                  alt={photo.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-2">
                  <h3 className="text-sm font-medium truncate">
                    {photo.title}
                  </h3>

                  {/* Tag Input */}
                  <div className="mb-2">
                    <input
                      type="text"
                      value={photoTagInputs[photo.id] || ""}
                      onChange={(e) =>
                        setPhotoTagInputs((prev) => ({
                          ...prev,
                          [photo.id]: e.target.value,
                        }))
                      }
                      placeholder="Edit tags (comma or space separated)"
                      className="border rounded px-2 py-1 text-sm w-full"
                    />
                    <button
                      onClick={() => handleUpdateTags(photo.id)}
                      className="mt-1 text-sm bg-blue-600 text-white px-2 py-1 rounded"
                    >
                      Update Tags
                    </button>
                  </div>

                  <div className="flex justify-between mt-2 gap-2">
                    <button
                      onClick={() =>
                        handleToggleVisibility(photo.id, photo.isVisible)
                      }
                      className={`text-sm px-2 py-1 rounded ${
                        photo.isVisible ? "bg-green-500" : "bg-gray-400"
                      } text-white`}
                    >
                      {photo.isVisible ? "Visible" : "Hidden"}
                    </button>
                    <button
                      onClick={() => handleSoftDelete(photo.id)}
                      className="text-sm bg-yellow-500 text-white px-2 py-1 rounded"
                    >
                      Soft Delete
                    </button>
                    <button
                      onClick={() => handleHardDelete(photo.id)}
                      className="text-sm bg-red-600 text-white px-2 py-1 rounded"
                    >
                      Permanently Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {photos.length === 0 && selectedCategory && (
          <p className="text-gray-500 text-center mt-6">
            No photos uploaded for the "{selectedCategory}" category yet.
          </p>
        )}
      </div>
    </div>
  );
}
