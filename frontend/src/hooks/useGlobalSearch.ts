import { useState } from "react";

export interface UserResult {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  deliveryAddress: any;
  role: "CUSTOMER" | "ADMIN";
  emailConfirmed: boolean;
  orders?: OrderResult[];
}

export interface PackageResult {
  id: string;
  displayName: string;
  basePrice: number;
  internalName: string;
}

export interface OrderResult {
  id: string;
  readableOrderNumber: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  basePrice: number;
  finalPrice: number;
  transportPrice: number;
  amountPaid?: number;
  shootDate?: string;
  shootPlace?: string;
  createdAt?: string;
  deletedAt?: string | null;
  notes?: string;
  discount?: number;
  user: UserResult;
  package: PackageResult;
}

export const useGlobalSearch = (apiUrl: string) => {
  const [results, setResults] = useState<{ users: UserResult[]; orders: OrderResult[] }>({
    users: [],
    orders: [],
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const globalSearch = async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${apiUrl}/api/search?query=${encodeURIComponent(query)}`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Chyba pri hľadaní");

      const data = await res.json();

      // Orders first (for flat search by order number)
      const orders: OrderResult[] = data.orders.map((o: any) => ({
        ...o,
        basePrice: Number(o.basePrice),
        discount: Number(o.discount),
        finalPrice: Number(o.finalPrice),
        transportPrice: Number(o.transportPrice),
        amountPaid: Number(o.amountPaid || 0),
        user: { ...o.user, deliveryAddress: o.user.deliveryAddress ?? null },
        package: { ...o.package, basePrice: Number(o.package.basePrice) },
      }));

      // Users with orders attached
      const users: UserResult[] = data.users.map((u: any) => ({
        ...u,
        deliveryAddress: u.deliveryAddress ?? null,
        orders: u.orders?.map((o: any) => ({
          ...o,
          basePrice: Number(o.basePrice),
          discount: Number(o.discount),
          finalPrice: Number(o.finalPrice),
          transportPrice: Number(o.transportPrice),
          amountPaid: Number(o.amountPaid || 0),
          shootDate: o.shootDate,
          createdAt: o.createdAt,
          notes: o.notes || "",
          shootPlace: o.shootPlace || "",
          package: { ...o.package, basePrice: Number(o.package.basePrice) },
        })),
      }));

      setResults({ users, orders });
    } catch (err: any) {
      console.error("Global search error:", err);
      setMessage("Chyba pri hľadaní");
    } finally {
      setLoading(false);
    }
  };

  return { results, setResults, loading, message, globalSearch };
};
