"use client";

import { useState, useEffect, useCallback } from "react";
import Breadcrumb from "../components/Breadcrumb";
import {
  getPhotosByCategory,
  uploadPhoto,
  togglePhotoVisibility,
  deletePhoto,
  hardDeletePhoto,
  updatePhotoTags,
  updatePhotoTitle,
  togglePhotoFeatured,
} from "@lib/api";
import apiClient from "@/lib/apiClient";

export default function ManageWebComponent() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("hero");
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [photoTagInputs, setPhotoTagInputs] = useState<Record<string, string>>(
    {},
  );
  const [photoTitleInputs, setPhotoTitleInputs] = useState<
    Record<string, string>
  >(() =>
    photos.reduce(
      (acc, photo) => {
        acc[photo.id] = photo.title || "";
        return acc;
      },
      {} as Record<string, string>,
    ),
  );
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Management
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [allTags, setAllTags] = useState<any[]>([]);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);

  // New Category/Tag inputs
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryFriendly, setNewCategoryFriendly] = useState("");
  const [newCategoryPublic, setNewCategoryPublic] = useState(false);

  const [newTagName, setNewTagName] = useState("");
  const [newTagFriendly, setNewTagFriendly] = useState("");
  const [newTagPublic, setNewTagPublic] = useState(false);

  const path = ["Dashboard", "Manage Web", "Hero Photos"];

  /** Load all categories for dropdown */
  const loadCategories = async () => {
    try {
      const res = await apiClient.get("/photos/categories");
      const data = res.data;
      setCategories(data);
      if (data.length > 0 && !selectedCategory)
        setSelectedCategory(data[0].name);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  /** Load all categories/tags for management */
  const loadAllCategoriesAndTags = async () => {
    try {
      const [catRes, tagRes] = await Promise.all([
        apiClient.get("/photos/categories"),
        apiClient.get("/photos/tags"),
      ]);
      setAllCategories(catRes.data);
      setAllTags(tagRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  /** --- Load photos with pagination --- */
  const loadPhotos = async (
    categoryName?: string,
    pageNum = 1,
    append = false,
  ) => {
    try {
      const category = categoryName || selectedCategory;
      if (!category) return;

      const res = await getPhotosByCategory(category, pageNum, 30, true);
      const data = res.photos || res;
      if (append) setPhotos((prev) => [...prev, ...data]);
      else setPhotos(data);

      const initialTags: Record<string, string> = {};
      (append ? [...photos, ...data] : data).forEach((photo: any) => {
        initialTags[photo.id] =
          photo.tags?.map((t: { name: string }) => t.name).join(", ") || "";
      });
      setPhotoTagInputs(initialTags);
      setHasMore(res.hasMore ?? false);
    } catch (err) {
      console.error(err);
    }
  };

  /** Initial load */
  useEffect(() => {
    loadCategories();
    loadAllCategoriesAndTags();
  }, []);

  /** Reset page & photos when category changes */
  useEffect(() => {
    if (!selectedCategory) return;
    setPage(1);
    setPhotos([]);
    loadPhotos(selectedCategory, 1, false);
  }, [selectedCategory]);

  /** Infinite scroll */
  const handleScroll = useCallback(() => {
    if (!hasMore) return;
    const scrollY = window.scrollY;
    const innerHeight = window.innerHeight;
    const offsetHeight = document.body.offsetHeight;

    if (scrollY + innerHeight + 300 >= offsetHeight)
      setPage((prev) => prev + 1);
  }, [hasMore]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (page === 1) return;
    loadPhotos(selectedCategory, page, true);
  }, [page, selectedCategory]);

  /** Update photo title */
  useEffect(() => {
    const titles: Record<string, string> = {};
    photos.forEach((photo) => {
      titles[photo.id] = photo.title || "";
    });
    setPhotoTitleInputs(titles);
  }, [photos]);

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
      setTags("");

      setPage(1);
      setPhotos([]);
      loadPhotos(selectedCategory, 1, false);
      loadAllCategoriesAndTags();
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleToggleVisibility = async (id: string, current: boolean) => {
    await togglePhotoVisibility(id, !current);
    setPhotos((prev) =>
      prev.map((photo) =>
        photo.id === id ? { ...photo, isVisible: !current } : photo,
      ),
    );
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    await togglePhotoFeatured(id, !current);
    setPhotos((prev) =>
      prev.map((photo) =>
        photo.id === id ? { ...photo, isFeatured: !current } : photo,
      ),
    );
  };

  const handleSoftDelete = async (id: string) => {
    await deletePhoto(id);
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleHardDelete = async (id: string) => {
    if (!confirm("Permanently delete this photo?")) return;
    await hardDeletePhoto(id);
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdateTags = async (photoId: string) => {
    const tagsArray = photoTagInputs[photoId]
      .split(/[,\s]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      await updatePhotoTags(photoId, tagsArray);

      // Update only the affected photo in place
      setPhotos((prev) =>
        prev.map((photo) =>
          photo.id === photoId
            ? { ...photo, tags: tagsArray.map((name) => ({ name })) }
            : photo,
        ),
      );

      // Refresh categories/tags
      loadAllCategoriesAndTags();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTitle = async (photoId: string) => {
    const newTitle = photoTitleInputs[photoId];
    try {
      await updatePhotoTitle(photoId, newTitle);

      // Update only the affected photo in place
      setPhotos((prev) =>
        prev.map((photo) =>
          photo.id === photoId ? { ...photo, title: newTitle } : photo,
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const toggleCategoryManager = () => setShowCategoryManager((prev) => !prev);
  const toggleTagManager = () => setShowTagManager((prev) => !prev);

  /** --- Add New Category --- */
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await apiClient.post("/photos/categories", {
        name: newCategoryName.trim(),
        friendlyName: newCategoryFriendly.trim(),
        isPublic: newCategoryPublic,
      });
      setNewCategoryName("");
      setNewCategoryFriendly("");
      setNewCategoryPublic(false);
      loadAllCategoriesAndTags();
      loadCategories();
    } catch (err) {
      console.error(err);
    }
  };

  /** --- Add New Tag --- */
  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    try {
      await apiClient.post("/photos/tags", {
        name: newTagName.trim(),
        friendlyName: newTagFriendly.trim(),
        isPublic: newTagPublic,
      });
      setNewTagName("");
      setNewTagFriendly("");
      setNewTagPublic(false);
      loadAllCategoriesAndTags();
    } catch (err) {
      console.error(err);
    }
  };

  /** --- Update all categories/tags (Save Changes button) --- */
  const handleSaveChanges = async () => {
    try {
      await Promise.all(
        allCategories.map((cat) =>
          apiClient.put(
            `/photos/categories/${cat.id}`,
            {
              name: cat.name,
              friendlyName: cat.friendlyName,
              isPublic: cat.isPublic,
            },
            { withCredentials: true },
          ),
        ),
      );
      await Promise.all(
        allTags.map((tag) =>
          apiClient.put(
            `/photos/tags/${tag.id}`,
            {
              name: tag.name,
              friendlyName: tag.friendlyName,
              isPublic: tag.isPublic,
            },
            { withCredentials: true },
          ),
        ),
      );
      alert("Categories and tags updated successfully!");
      loadAllCategoriesAndTags();
      loadCategories();
    } catch (err) {
      console.error(err);
      alert("Failed to save changes.");
    }
  };

  /** --- Soft & Hard delete functions for categories/tags --- */
  const softDeleteCategory = async (id: string) => {
    if (!confirm("Soft delete this category?")) return;
    try {
      await apiClient.delete(`/photos/categories/${id}`, {
        withCredentials: true,
      });
      loadAllCategoriesAndTags();
      loadCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const hardDeleteCategory = async (cat: any) => {
    if (
      !confirm("Permanently delete this category and all its photo mappings?")
    )
      return;
    try {
      await apiClient.delete(`/photos/categories/hard/${cat.id}`, {
        withCredentials: true,
      });
      loadAllCategoriesAndTags();
      loadCategories();
      if (cat.name === selectedCategory) setSelectedCategory("");
    } catch (err) {
      console.error(err);
    }
  };

  const softDeleteTag = async (id: string) => {
    if (!confirm("Soft delete this tag?")) return;
    try {
      await apiClient.delete(`/photos/tags/${id}`, {
        withCredentials: true,
      });
      loadAllCategoriesAndTags();
    } catch (err) {
      console.error(err);
    }
  };

  const hardDeleteTag = async (id: string) => {
    if (!confirm("Permanently delete this tag and all its photo mappings?"))
      return;
    try {
      await apiClient.delete(`/photos/tags/hard/${id}`, {
        withCredentials: true,
      });
      loadAllCategoriesAndTags();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb path={path} />

      {/* --- CATEGORY / TAG MANAGEMENT --- */}
      <div className="bg-gray-100 dark:bg-gray-600 p-4 rounded-2xl shadow space-y-4">
        <h2 className="text-xl p-2 gap-2 py-2">Category and Tag Management</h2>
        {/* Category Manager */}
        <div>
          <button
            onClick={toggleCategoryManager}
            className="w-full text-left font-semibold py-2 px-3 bg-gray-200 dark:bg-gray-700 rounded"
          >
            Categories {showCategoryManager ? "▲" : "▼"}
          </button>
          {showCategoryManager && (
            <div className="overflow-x-auto mt-2 space-y-2">
              {/* Add New Category */}
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newCategoryName}
                  placeholder="New category name"
                  className=" bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300 px-2 py-1"
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <input
                  type="text"
                  value={newCategoryFriendly}
                  placeholder="Friendly name (optional)"
                  className="bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300 px-2 py-1"
                  onChange={(e) => setNewCategoryFriendly(e.target.value)}
                />
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={newCategoryPublic}
                    onChange={(e) => setNewCategoryPublic(e.target.checked)}
                  />
                  Public
                </label>
                <button
                  className="bg-green-600 text-white px-2 py-1 rounded"
                  onClick={handleAddCategory}
                >
                  Add
                </button>
              </div>

              {/* Editable Categories Table */}
              <table className="text-left w-full text-sm bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="px-2 py-1">Name</th>
                    <th className="px-2 py-1">Friendly Name</th>
                    <th className="px-2 py-1">Public</th>
                    <th className="px-2 py-1">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allCategories.map((cat, idx) => (
                    <tr key={cat.id} className="border-t">
                      <td className="px-2 py-1">
                        <input
                          type="text"
                          value={cat.name}
                          className="bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300 px-1 py-0.5 w-full"
                          onChange={(e) =>
                            setAllCategories((prev) => {
                              const updated = [...prev];
                              updated[idx].name = e.target.value;
                              return updated;
                            })
                          }
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          type="text"
                          value={cat.friendlyName || ""}
                          className="bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300 px-1 py-0.5 w-full"
                          onChange={(e) =>
                            setAllCategories((prev) => {
                              const updated = [...prev];
                              updated[idx].friendlyName = e.target.value;
                              return updated;
                            })
                          }
                        />
                      </td>
                      <td className="px-2 py-1 text-left">
                        <input
                          type="checkbox"
                          checked={cat.isPublic || false}
                          onChange={(e) =>
                            setAllCategories((prev) => {
                              const updated = [...prev];
                              updated[idx].isPublic = e.target.checked;
                              return updated;
                            })
                          }
                        />
                      </td>
                      <td className="px-2 py-1 flex gap-2">
                        <button
                          className="text-sm bg-yellow-500 text-white px-2 py-1 rounded"
                          onClick={() => softDeleteCategory(cat.id)}
                        >
                          Soft Delete
                        </button>
                        <button
                          className="text-sm bg-red-600 text-white px-2 py-1 rounded"
                          onClick={() => hardDeleteCategory(cat)}
                        >
                          Hard Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Tag Manager */}
        <div>
          <button
            onClick={toggleTagManager}
            className="w-full text-left font-semibold py-2 px-3 bg-gray-200 dark:bg-gray-700 rounded"
          >
            Tags {showTagManager ? "▲" : "▼"}
          </button>
          {showTagManager && (
            <div className="overflow-x-auto mt-2 space-y-2">
              {/* Add New Tag */}
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTagName}
                  placeholder="New tag name"
                  className="bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300 px-2 py-1"
                  onChange={(e) => setNewTagName(e.target.value)}
                />
                <input
                  type="text"
                  value={newTagFriendly}
                  placeholder="Friendly name (optional)"
                  className="bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300 px-2 py-1"
                  onChange={(e) => setNewTagFriendly(e.target.value)}
                />
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={newTagPublic}
                    onChange={(e) => setNewTagPublic(e.target.checked)}
                  />
                  Public
                </label>
                <button
                  className="bg-green-600 text-white px-2 py-1 rounded"
                  onClick={handleAddTag}
                >
                  Add
                </button>
              </div>

              {/* Editable Tags Table */}
              <table className="text-left w-full text-sm bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="px-2 py-1">Name</th>
                    <th className="px-2 py-1">Friendly Name</th>
                    <th className="px-2 py-1">Public</th>
                    <th className="px-2 py-1">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allTags.map((tag, idx) => (
                    <tr key={tag.id} className="border-t">
                      <td className="px-2 py-1">
                        <input
                          type="text"
                          value={tag.name}
                          className="bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300 px-1 py-0.5 w-full"
                          onChange={(e) =>
                            setAllTags((prev) => {
                              const updated = [...prev];
                              updated[idx].name = e.target.value;
                              return updated;
                            })
                          }
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          type="text"
                          value={tag.friendlyName || ""}
                          className="bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300 px-1 py-0.5 w-full"
                          onChange={(e) =>
                            setAllTags((prev) => {
                              const updated = [...prev];
                              updated[idx].friendlyName = e.target.value;
                              return updated;
                            })
                          }
                        />
                      </td>
                      <td className="px-2 py-1 text-left">
                        <input
                          type="checkbox"
                          checked={tag.isPublic || false}
                          onChange={(e) =>
                            setAllTags((prev) => {
                              const updated = [...prev];
                              updated[idx].isPublic = e.target.checked;
                              return updated;
                            })
                          }
                        />
                      </td>
                      <td className="px-2 py-1 flex gap-2">
                        <button
                          className="text-sm bg-yellow-500 text-white px-2 py-1 rounded"
                          onClick={() => softDeleteTag(tag.id)}
                        >
                          Soft Delete
                        </button>
                        <button
                          className="text-sm bg-red-600 text-white px-2 py-1 rounded"
                          onClick={() => hardDeleteTag(tag.id)}
                        >
                          Hard Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Save Changes Button */}
        <div className="flex justify-end mt-4">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={handleSaveChanges}
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* --- PHOTO MANAGEMENT --- */}
      <div className="bg-gray-100 dark:bg-gray-600 p-4 rounded-2xl shadow space-y-4">
        <h2 className="text-xl p-2 gap-2 py-2">Photo Management</h2>
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
                {cat.friendlyName || cat.name}
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
            const imageUrl = `${process.env.NEXT_PUBLIC_API_URL}${
              photo.mediumUrl.startsWith("/") ? "" : "/"
            }${photo.mediumUrl}`;

            return (
              <div
                key={photo.id}
                className=" bg-gray-700/50 rounded-lg overflow-hidden shadow-sm"
              >
                <img
                  src={imageUrl}
                  alt={photo.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-2">
                  {/* Title Input */}
                  <div className="mb-2 flex items-center gap-2">
                    <input
                      type="text"
                      value={photoTitleInputs[photo.id] || ""}
                      onChange={(e) =>
                        setPhotoTitleInputs((prev) => ({
                          ...prev,
                          [photo.id]: e.target.value,
                        }))
                      }
                      placeholder="Edit title"
                      className="border rounded px-2 py-1 text-sm flex-grow"
                    />
                    <button
                      onClick={() => handleUpdateTitle(photo.id)}
                      className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition"
                    >
                      Update title
                    </button>
                  </div>

                  {/* Tag Input */}
                  <div className="mb-2 flex items-center gap-2">
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
                      className="border rounded px-2 py-1 text-sm flex-grow"
                    />
                    <button
                      onClick={() => handleUpdateTags(photo.id)}
                      className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition"
                    >
                      Update tags
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
                      onClick={() =>
                        handleToggleFeatured(photo.id, photo.isFeatured)
                      }
                      className={`text-sm px-2 py-1 rounded ${
                        photo.isFeatured ? "bg-green-500" : "bg-gray-400"
                      } text-white`}
                    >
                      {photo.isFeatured ? "Featured" : "Not featured"}
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

        {!hasMore && photos.length > 0 && (
          <p className="text-gray-500 text-center mt-6">All photos loaded.</p>
        )}

        {photos.length === 0 && selectedCategory && (
          <p className="text-gray-500 text-center mt-6">
            No photos uploaded for the "{selectedCategory}" category yet.
          </p>
        )}
      </div>
    </div>
  );
}
