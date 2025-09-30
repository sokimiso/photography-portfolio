"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@context/AuthContext";
import DashboardPageComponent from "./DashboardPageComponent";

export default function DashboardPage() {
  const router = useRouter();
  const { role } = useAuth();

  // Redirect if not logged in
  if (!role) {
    router.push("/login");
    return null;
  }

  return <DashboardPageComponent />;
}
