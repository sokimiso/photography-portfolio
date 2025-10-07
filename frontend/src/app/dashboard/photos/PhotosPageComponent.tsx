"use client";

import Breadcrumb from "../components/Breadcrumb";

export default function PhotosPageComponent() {
  const path = ["Dashboard", "Dashboard"];
    return (
      <div className="space-y-6">
        <div><Breadcrumb path={path} /></div>
      <h2 className="text-xl font-bold mb-4">Fotky</h2>
      <div>Tu zobrazíme správu fotografií</div>
    </div>
  );
}
