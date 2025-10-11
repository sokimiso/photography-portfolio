"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@context/AuthContext";

interface CustomerGuardProps {
  children: ReactNode;
}

/**
 * Protects customer-only pages.
 * - Redirects not-logged-in users to /login
 * - Redirects non-customer (ADMIN) to /dashboard
 * - Shows a loading indicator while auth status is being checked
 */
export default function CustomerGuard({ children }: CustomerGuardProps) {
  const router = useRouter();
  const { loggedIn, role, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!loggedIn) {
        router.push("/login");
      } else if (role !== "CUSTOMER") {
        router.push("/dashboard");
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

  if (!loggedIn || role !== "CUSTOMER") return null;

  return <>{children}</>;
}
