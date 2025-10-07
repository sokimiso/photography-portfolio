"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@context/AuthContext";
import DashboardPageComponent from "./DashboardPageComponent";

export default function DashboardPage() {
  const router = useRouter();
  const { role } = useAuth();

  // Redirect if not logged in
    useEffect(() => {
      if (!role) {
        router.push("/login");
      }
    }, [role, router]);
    
  return <DashboardPageComponent />;
}
