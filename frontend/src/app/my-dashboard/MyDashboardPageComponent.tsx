"use client";

import { useAuth } from "@/context/AuthContext";

export default function MyDashboardPageComponent() {
  const { user } = useAuth();

  // Show loading until auth context has user info
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading your dashboard...
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Welcome, {user.firstName}</h1>
      <p className="text-gray-600">Here are your reservations and updates.</p>

      {/* Add Customer-only panels here */}
    </div>
  );
}
