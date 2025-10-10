"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@context/AuthContext";
import Breadcrumb from "../components/Breadcrumb";
import {
  getPhotosByCategory,
  uploadPhoto,
  togglePhotoVisibility,
  deletePhoto,
} from "@lib/api";

export default function ManageWebComponent() {
  const { token } = useAuth();
  const [photos, setPhotos] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("hero");
  const [categories, setCategories] = useState("hero");
  const [uploading, setUploading] = useState(false);

  const path = ["Dashboard", "Manage Web", "Hero Photos"];

  const loadPhotos = async () => {
    const data = await getPhotosByCategory("hero");
    setPhotos(data);
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("title", title);
    formData.append("categories", categories);
    formData.append("tags", tags);

    await uploadPhoto(formData);
    setSelectedFile(null);
    setTitle("");
    setUploading(false);
    await loadPhotos();
  };

  const handleToggleVisibility = async (id: string, current: boolean) => {
    await togglePhotoVisibility(id, !current);
    await loadPhotos();
  };

  const handleDelete = async (id: string) => {
    await deletePhoto(id);
    await loadPhotos();
  };

  return (
    <div className="space-y-6">
      <Breadcrumb path={path} />

      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-4">Hero Section Photos</h2>

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
          {photos.map((photo) => (
            <div key={photo.id} className="border rounded-lg overflow-hidden shadow-sm">
              <img src={photo.url} alt={photo.title} className="w-full h-40 object-cover" />
              <div className="p-2">
                <h3 className="text-sm font-medium truncate">{photo.title}</h3>
                <div className="flex justify-between mt-2">
                  <button
                    onClick={() => handleToggleVisibility(photo.id, photo.isVisible)}
                    className={`text-sm px-2 py-1 rounded ${
                      photo.isVisible ? "bg-green-500" : "bg-gray-400"
                    } text-white`}
                  >
                    {photo.isVisible ? "Visible" : "Hidden"}
                  </button>
                  <button
                    onClick={() => handleDelete(photo.id)}
                    className="text-sm bg-red-600 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {photos.length === 0 && (
          <p className="text-gray-500 text-center mt-6">No hero photos uploaded yet.</p>
        )}
      </div>
    </div>
  );
}
