"use client";

import AdminGuard from "@/components/auth/AdminGuard";
import PhotosPageComponent from "./PhotosPageComponent";

export default function PhotosPage() {
  return (
    <AdminGuard>
    <PhotosPageComponent />
    </AdminGuard>
    );
}
