"use client";

import { usePathname, useRouter } from "next/navigation";
import { OrderResult } from "@hooks/usePendingOrders";
import { UserResult } from "@hooks/useGlobalSearch";

type Props = {
  path: string[];
  onNavigate?: (tab: string) => void;
  pendingOrders?: OrderResult[];
  users?: UserResult[];
  selectedOrder?: OrderResult | null;
  selectedUser?: UserResult | null;
};

export default function Breadcrumb({
  onNavigate,
  pendingOrders,
  users,
  selectedOrder,
  selectedUser,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  if (!pathname) return null;

  const segments = pathname.split("/").filter(Boolean); // e.g., ["dashboard","orders","abc123"]
  if (segments.length === 0) return null;

  const labels = segments.map((seg, idx) => {
    if (idx === 0) return "Dashboard";

    // Orders tab
    if (segments[1] === "orders") {
      if (idx === 1) return "Objednávky";
      if (idx === 2) {
        const order = selectedOrder ?? pendingOrders?.find(o => o.id === seg);
        return order ? order.readableOrderNumber : seg;
      }
    }

    // Users tab
    if (segments[1] === "users") {
      if (idx === 1) return "Užívatelia";
      if (idx === 2) {
        const user = selectedUser ?? users?.find(u => u.id === seg);
        return user ? `${user.firstName} ${user.lastName} (${user.email})` : seg;
      }
    }

    // Other segments: capitalize
    return seg.charAt(0).toUpperCase() + seg.slice(1);
  });

  // Compute path for each segment (for clickable navigation)
  const paths: string[] = [];
  segments.forEach((_, idx) => {
    const path = "/" + segments.slice(0, idx + 1).join("/");
    paths.push(path);
  });

  return (
    <nav className="text-sm mb-4 flex flex-wrap gap-1 text-gray-600 dark:text-gray-300">
      {labels.map((label, idx) => (
        <span key={idx} className="flex items-center">
          {onNavigate ? (
            <button
              className="hover:underline cursor-pointer"
              onClick={() => {
                onNavigate(label);       // update active tab
                router.push(paths[idx]); // navigate to path
              }}
            >
              {label}
            </button>
          ) : (
            <span>{label}</span>
          )}
          {idx < labels.length - 1 && <span className="mx-1">/</span>}
        </span>
      ))}
    </nav>
  );
}
