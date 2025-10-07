"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@context/AuthContext";
import DashboardPageComponent from "./DashboardPageComponent";

export default function DashboardPage() {
  const router = useRouter();
  const { loggedIn, role } = useAuth();

  // Always watch loggedIn and role
  useEffect(() => {
    if (role !== null && !loggedIn) {
      router.push("/login");
    }
  }, [loggedIn, role, router]);

  // Show loading while AuthContext is initializing
  if (role === null) return <div>Loading...</div>;

  // Only render dashboard if logged in
  if (!loggedIn) return null;

  return <DashboardPageComponent />;
}
