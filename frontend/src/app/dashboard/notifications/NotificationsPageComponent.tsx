"use client";

import Breadcrumb from "../components/Breadcrumb";

export default function NotificationsPageComponent() {
  const path = ["Dashboard", "Dashboard"];
  return (
      <div className="space-y-6">
        <div><Breadcrumb path={path} /></div>
      <h2 className="text-xl font-bold mb-4">Notifikácie</h2>
      <div>Tu zobrazíme notifikácie používateľov</div>
    </div>
  );
}
