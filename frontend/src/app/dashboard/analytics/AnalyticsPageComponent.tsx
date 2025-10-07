"use client";

import Breadcrumb from "../components/Breadcrumb";

export default function AnalyticsPageComponent() {
const path = ["Dashboard", "Dashboard"];

  return (

    <div className="space-y-6">
      <div><Breadcrumb path={path} /></div>
      <h2 className="text-xl font-bold mb-4">Analytics</h2>
      <div>Tu zobrazíme štatistiky a grafy</div>
    </div>
    
  );
}
