"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@context/AuthContext";

interface AdminGuardProps {
  children: ReactNode;
}

/**
 * Protects admin-only pages.
 * - Redirects not-logged-in users to /login
 * - Redirects non-admins (CUSTOMER) to /my-dashboard
 * - Shows a loading indicator while auth status is being checked
 */
export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const { loggedIn, role, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!loggedIn) {
        router.push("/login");
      } else if (role !== "ADMIN") {
        router.push("/my-dashboard");
      }
    }
  }, [loading, loggedIn, role, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading page...
      </div>
    );
  }

  // Render nothing if not admin
  if (!loggedIn || role !== "ADMIN") return null;

  return <>{children}</>;
}
