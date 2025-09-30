"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@context/AuthContext";
import { OrderResult, UserResult, useGlobalSearch } from "@hooks/useGlobalSearch";
import apiClient from "@/lib/apiClient";
import { useToast } from "@/components/ui/use-toast";
import Breadcrumb from "../components/Breadcrumb";
import OrderModal from "@/components/layout/OrderModal";
import { CreateOrderDto, UpdateOrderDto } from "@/types/order.dto";

type PhotoshootPackage = {
  id: string;
  internalName?: string;
  displayName: string;
  description?: string;
  basePrice: number;
  durationHrs?: number;
  maxPhotos?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
};

interface OrdersPageProps {
  selectedOrder?: OrderResult | null;
}

interface UserForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: "CUSTOMER" | "ADMIN";
  deliveryAddress?: string;
}

export default function OrdersPageComponent({ selectedOrder: initialSelectedOrder }: OrdersPageProps) {
  const { token } = useAuth();
  const { toast } = useToast();

  const [pendingOrders, setPendingOrders] = useState<OrderResult[]>([]);
  const [confirmedOrders, setConfirmedOrders] = useState<OrderResult[]>([]);
  const [packages, setPackages] = useState<PhotoshootPackage[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderResult | null>(initialSelectedOrder || null);

  // Order form fields
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [shootDate, setShootDate] = useState("");
  const [notes, setNotes] = useState("");
  const [discount, setDiscount] = useState(0);
  const [basePrice, setBasePrice] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);
  const [status, setStatus] = useState<"PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED">("PENDING");
  // User form fields
  const [userForm, setUserForm] = useState<UserForm>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    role: "CUSTOMER",
    deliveryAddress: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  // When clicking a pending/confirmed order
  const handleOpenOrderModal = (o: OrderResult) => {
    setSelectedOrder(o);
    setSelectedPackageId(o.package?.id || "");
    setShootDate(o.shootDate ? new Date(o.shootDate).toISOString().slice(0, 10) : "");
    setNotes(o.notes || "");
    setDiscount(Number(o.discount) || 0);
    setBasePrice(Number(o.basePrice) || 0);
    setFinalPrice(Number(o.finalPrice) || 0);
    setAmountPaid(Number(o.amountPaid) || 0);
    setStatus(o.status || "PENDING");

    setUserForm({
      firstName: o.user.firstName,
      lastName: o.user.lastName,
      email: o.user.email,
      phoneNumber: o.user.phoneNumber,
      role: o.user.role,
      deliveryAddress: o.user.deliveryAddress || "",
    });

    setIsModalOpen(true);
  };


  const path = ["Dashboard", "Objednávky"];
  const [searchQuery, setSearchQuery] = useState("");
  const { results, loading: loadingSearch, message, globalSearch } = useGlobalSearch(
    process.env.NEXT_PUBLIC_API_URL!,
    token || null
  );

  // Central style for boxes
  const glassBoxStyle = "rounded-xl backdrop-blur-md space-y-4 bg-white/10 border border-white/20 shadow-xl";
  const editableInputStyle = "p-2 border border-gray-300 dark:border-gray-600 rounded w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100";
  const readOnlyInputStyle = "p-2 border border-gray-300 dark:border-gray-600 rounded w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100";

  // Fetch orders
  const fetchOrders = async () => {
    if (!token) return;
    try {
      const [pendingRes, confirmedRes] = await Promise.all([
        apiClient.get("/api/orders?status=PENDING"),
        apiClient.get("/api/orders?status=CONFIRMED"),
      ]);
      setPendingOrders(pendingRes.data);
      setConfirmedOrders(confirmedRes.data);
    } catch (err: any) {
      toast({
        title: "Error loading orders",
        description: err?.response?.data?.message || "Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Fetch available packages
  const fetchPackages = async () => {
    if (!token) return;
    try {
      const res = await apiClient.get("/api/orders/packages");
      setPackages(res.data);
    } catch (err: any) {
      toast({
        title: "Error loading packages",
        description: err?.response?.data?.message || "Please try again later.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchPackages();
  }, [token]);

  // Sync form fields whenever selectedOrder changes
  useEffect(() => {
    if (selectedOrder) {
      setUserForm({
        firstName: selectedOrder.user.firstName,
        lastName: selectedOrder.user.lastName,
        email: selectedOrder.user.email,
        phoneNumber: selectedOrder.user.phoneNumber,
        role: selectedOrder.user.role,
        deliveryAddress: selectedOrder.user.deliveryAddress,
      });
      setSelectedPackageId(selectedOrder.package.id);
      setShootDate(
        selectedOrder.shootDate
          ? new Date(selectedOrder.shootDate).toISOString().split("T")[0]
          : ""
      );
      setNotes(selectedOrder.notes || "");
      setDiscount(selectedOrder.discount || 0);
    } else {
      // Reset form
      setUserForm({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        role: "CUSTOMER",
        deliveryAddress: "",
      });
      setSelectedPackageId(packages[0]?.id || "");
      setShootDate("");
      setNotes("");
      setDiscount(0);
    }
  }, [selectedOrder, packages]);

  // Handle order selection (no unsaved changes detection anymore)
  const handleSelectOrder = (o: OrderResult) => {
    setSelectedOrder(o);
  };

  // Save order
  const handleSaveOrder = async () => {
    if (!userForm.email || !selectedPackageId) {
      toast({
        title: "Missing details",
        description: "Please fill in user email and select a package.",
        variant: "destructive",
      });
      return;
    }
    try {
      if (selectedOrder) {
        // UPDATE ORDER
        const updateDto: UpdateOrderDto = {
          basePrice: basePrice ?? undefined,
          discount: discount ?? undefined,
          finalPrice: finalPrice ?? undefined,
          amountPaid: amountPaid ?? undefined,
          notes,
          shootDate: shootDate ? new Date(shootDate).toISOString() : undefined,
          packageId: selectedPackageId,
          userEmail: userForm.email,
          
        };

        await apiClient.put(`/api/orders/${selectedOrder.id}`, updateDto);

        toast({
          title: "Order updated",
          description: "Order updated successfully.",
        });
      } else {
        // CREATE ORDER
        const createDto: CreateOrderDto = {
          packageId: selectedPackageId!,
          shootDate: shootDate ? new Date(shootDate).toISOString() : undefined,
          notes,
          discount: discount ?? 0,
          basePrice: basePrice ?? 0,
          finalPrice: finalPrice ?? 0,
          amountPaid: amountPaid ?? 0,
          status: "PENDING",
          userEmail: userForm.email,
        };

        await apiClient.post(`/api/orders/create`, createDto);

        toast({
          title: "Order created",
          description: "New order has been successfully created.",
        });
        setSelectedOrder(null);
      }

      fetchOrders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    }



  };

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-300/70 dark:bg-yellow-300/70",
    CONFIRMED: "bg-green-300/70 dark:bg-green-300/70",
    COMPLETED: "bg-blue-300/70 dark:bg-blue-300/70",
    CANCELLED: "bg-red-300/70 dark:bg-red-300/70",
  };

  return (
    <div className="space-y-6">
      <Breadcrumb path={path} />

      {/* Pending Orders */}
      <div className={`p-4 ${glassBoxStyle}`}>
        <h2 className="font-bold mb-2">Pending Orders</h2>
        {pendingOrders.length === 0 ? (
          <div>Žiadne rozpracované objednávky</div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {pendingOrders.map((o) => (
              <div
                key={o.id}
                className={`w-fit min-w-[250px] max-w-[300px] p-4 rounded-xl ${statusColors[o.status]} bg-white/10 backdrop-blur-md border border-white/20 shadow-xl transition-transform duration-200 hover:scale-105 hover:shadow-2xl`}
                style={{ maxWidth: "400px" }}
                onClick={() => handleOpenOrderModal(o)}
              >
                <div className="font-bold text-2xl">{o.readableOrderNumber}</div>
                <div className="text-sm">{o.user.firstName} {o.user.lastName}</div>
                <div className="text-sm">{o.package.displayName}</div>
                <div className="text-sm">{o.finalPrice} €</div>
                <div className="text-sm">{o.user.email}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmed Orders */}
      <div className={`p-4 ${glassBoxStyle}`}>
        <h2 className="font-bold mb-2">Confirmed Orders</h2>
        {confirmedOrders.length === 0 ? (
          <div>Žiadne potvrdené objednávky</div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {confirmedOrders.map((o) => (
              <div
                key={o.id}
                className={`w-fit min-w-[250px] max-w-[300px] p-4 rounded-xl ${statusColors[o.status]} bg-white/10 backdrop-blur-md border border-white/20 shadow-xl transition-transform duration-200 hover:scale-105 hover:shadow-2xl`}
                style={{ maxWidth: "400px" }}
                onClick={() => handleOpenOrderModal(o)}
              >
                <div className="font-bold text-2xl">{o.readableOrderNumber}</div>
                <div className="text-sm">{o.user.firstName} {o.user.lastName}</div>
                <div className="text-sm">{o.package.displayName}</div>
                <div className="text-sm">{o.finalPrice} €</div>
                <div className="text-sm">{o.user.email}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search Users */}
      <div className={`p-4 ${glassBoxStyle}`}>
        <h3 className="font-semibold mb-2">Vyhľadať používateľa</h3>
        <input
          type="text"
          placeholder="Hľadať používateľa podľa mena alebo emailu"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            globalSearch(e.target.value);
          }}
          className="p-2 border rounded w-full"
        />
        {searchQuery && results.users.length > 0 && (
          <div className="mt-2 border-none rounded bg-white/20 dark:bg-gray-800 shadow">
            {results.users.slice(0, 5).map((u: UserResult) => (
              <div
                key={u.id}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => {
                  setUserForm({
                    firstName: u.firstName,
                    lastName: u.lastName,
                    email: u.email,
                    phoneNumber: u.phoneNumber,
                    role: u.role,
                    deliveryAddress: u.deliveryAddress,
                  });
                  // Auto-select latest pending/confirmed order
                  const latestOrder = u.orders
                    ?.filter(
                      (o) => o.status === "PENDING" || o.status === "CONFIRMED"
                    )
                    .sort(
                      (a, b) =>
                        new Date(
                          b.createdAt || b.shootDate || 0
                        ).getTime() -
                        new Date(
                          a.createdAt || a.shootDate || 0
                        ).getTime()
                    )[0];
                  if (latestOrder) setSelectedOrder(latestOrder);
                  else setSelectedOrder(null);
                }}
              >
                {u.firstName} {u.lastName} ({u.email})
              </div>
            ))}
          </div>
        )}
      </div>

{/* Objednávka Form */}
<OrderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
  <div className="flex flex-col max-h-[80vh] bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden">
    {/* Scrollable content */}
    <div className="p-4 overflow-y-auto flex-1 space-y-6">
      <h2 className="text-xl font-semibold mb-4">Objednávka: {selectedOrder?.readableOrderNumber}</h2>

      {/* User Info (read-only) */}
      <div>
        <h3 className="font-medium mb-2">Informácie o používateľovi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm text-gray-700 dark:text-gray-300 mb-1">Meno</label>
            <input type="text" value={userForm.firstName} readOnly className="p-2 border rounded w-full bg-gray-100 text-gray-900 dark:text-gray-100 dark:bg-gray-800" />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-700 dark:text-gray-300 mb-1">Priezvisko</label>
            <input type="text" value={userForm.lastName} readOnly className="p-2 border rounded w-full bg-gray-100 text-gray-900 dark:text-gray-100 dark:bg-gray-800" />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input type="email" value={userForm.email} readOnly className="p-2 border rounded w-full bg-gray-100 text-gray-900 dark:text-gray-100 dark:bg-gray-800" />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-700 dark:text-gray-300 mb-1">Telefón</label>
            <input type="text" value={userForm.phoneNumber} readOnly className="p-2 border rounded w-full bg-gray-100 text-gray-900 dark:text-gray-100 dark:bg-gray-800" />
          </div>
        </div>
      </div>

      {/* Order Info (editable) */}
      <div>
        <h3 className="font-medium mb-2">Informácie o objednávke</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Package */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-700 dark:text-gray-300 mb-1">Balíček</label>
            <select
              value={selectedPackageId}
              onChange={(e) => setSelectedPackageId(e.target.value)}
              className="p-2 border rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            >
              {packages.map((p) => (
                <option
                  key={p.id}
                  value={p.id}
                  className={p.id === selectedPackageId ? "bg-blue-100 dark:bg-blue-700" : ""}
                >
                  {p.displayName} ({p.basePrice} €)
                </option>
              ))}
            </select>
          </div>

          {/* Shoot Date */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-700 dark:text-gray-300 mb-1">Dátum fotenia</label>
            <input type="date" value={shootDate} onChange={(e) => setShootDate(e.target.value)} className="p-2 border rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
          </div>

          {/* Discount */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-700 dark:text-gray-300 mb-1">Zľava</label>
            <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="p-2 border rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
          </div>

          {/* Base Price */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-700 dark:text-gray-300 mb-1">Základná cena</label>
            <input type="number" value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value))} className="p-2 border rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
          </div>

          {/* Final Price */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-700 dark:text-gray-300 mb-1">Konečná cena</label>
            <input type="number" value={finalPrice} onChange={(e) => setFinalPrice(Number(e.target.value))} className="p-2 border rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
          </div>

          {/* Amount Paid */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-700 dark:text-gray-300 mb-1">Uhradené</label>
            <input type="number" value={amountPaid} onChange={(e) => setAmountPaid(Number(e.target.value))} className="p-2 border rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
          </div>

          {/* Status */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-700 dark:text-gray-300 mb-1">
              Stav objednávky
            </label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value as "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
                )
              }
              className={`p-2 border rounded w-full text-gray-900 dark:text-gray-100 focus:ring-2 focus:outline-none transition ${statusColors[status]}`}
            >
              {(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const).map(
                (s) => (
                  <option
                    key={s}
                    value={s}
                    style={{
                      backgroundColor:
                        s === "PENDING"
                          ? "rgba(253, 224, 71, 0.7)"
                          : s === "CONFIRMED"
                          ? "rgba(34, 197, 94, 0.7)"
                          : s === "COMPLETED"
                          ? "rgba(59, 130, 246, 0.7)"
                          : "rgba(239, 68, 68, 0.7)", // CANCELLED
                      color: "#000",
                    }}
                  >
                    {s}
                  </option>
                )
              )}
            </select>
          </div>

        </div>

        {/* Notes textarea (full width, last item) */}
        <div className="mt-4 flex flex-col">
          <label className="text-sm text-gray-700 dark:text-gray-300 mb-1">Poznámky</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="p-2 border rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none transition resize-none"
            placeholder="Poznámky k objednávke"
          />
        </div>
      </div>
    </div>

    {/* Fixed footer buttons */}
    <div className="flex gap-2 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      <button onClick={handleSaveOrder} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
        {selectedOrder ? "Editovať" : "Vytvoriť objednávku"}
      </button>
      <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition">
        Zatvoriť
      </button>
    </div>
  </div>
</OrderModal>


      </div>
  );
}
