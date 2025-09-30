"use client";

import Breadcrumb from "../components/Breadcrumb";

export default function ManageWebComponent() {
  const path = ["Dashboard", "Dashboard"];
    return (
      <div className="space-y-6">
        <div><Breadcrumb path={path} /></div>
        <h2 className="text-xl font-bold mb-4">Správa webu</h2>
        <div>Tu zobrazíme správu webu</div>
      </div>
    );
}
