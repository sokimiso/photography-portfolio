import { useState, useEffect } from "react";
import { useAuth } from "@context/AuthContext";
import { useGlobalSearch } from "@hooks/useGlobalSearch";
import apiClient from "@/lib/apiClient";
import { useToast } from "@/components/ui/use-toast";
import Breadcrumb from "../components/Breadcrumb";
import OrderEditorModal from "@/components/layout/OrderEditorModal";
import { OrderResult, UserResult, PhotoshootPackage } from "@/types/order.dto";
import { glassBoxStyle, statusColors } from "@/lib/constants/orders";
import { DataTable } from "@/components/ui/DataTable";

export default function OrdersPageComponent() {
  const { token } = useAuth();
  const { toast } = useToast();

  // Select user
  const handleUserSelect = (user: UserResult) => setSelectedUser(user);  

  // Table content
  const [selectedStatus, setSelectedStatus] = useState<"CONFIRMED" | "PENDING" | "CANCELED">("CONFIRMED");

  // Orders
  const [pendingOrders, setPendingOrders] = useState<OrderResult[]>([]);
  const [confirmedOrders, setConfirmedOrders] = useState<OrderResult[]>([]);
  const [pendingPaymentOrders, setPendingPaymentOrders] = useState<OrderResult[]>([]);

  // Packages
  const [packages, setPackages] = useState<PhotoshootPackage[]>([]);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManageMode, setIsManageMode] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderResult | null>(null);

  // Form state
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [shootDate, setShootDate] = useState("");
  const [shootPlace, setShootPlace] = useState("");
  const [notes, setNotes] = useState("");
  const [discount, setDiscount] = useState(0);
  const [basePrice, setBasePrice] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [transportPrice, setTransportPrice] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);
  const [status, setStatus] = useState<OrderResult["status"]>("PENDING");

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const { results, globalSearch, loading: loadingSearch, setResults } = useGlobalSearch(
    process.env.NEXT_PUBLIC_API_URL!
  );
  const searchResultsUsers = results.users;
  const searchResultsOrders = results.orders;

  /** Fetch orders */
  const fetchOrders = async () => {
    try {
      const [pendingRes, confirmedRes, pendingPaymentsRes] = await Promise.all([
        apiClient.get<OrderResult[]>("/api/orders/pending", { withCredentials: true }),
        apiClient.get<OrderResult[]>("/api/orders/confirmed", { withCredentials: true }),
        apiClient.get<OrderResult[]>("/api/orders/pending-payments", { withCredentials: true }),
      ]);

      setPendingOrders(pendingRes.data);
      setConfirmedOrders(confirmedRes.data);
      setPendingPaymentOrders(pendingPaymentsRes.data);
    } catch (err: any) {
      toast({ 
        title: "Error loading orders", 
        description: err?.response?.data?.message || "Try again later.", 
        variant: "destructive" 
      });
    }
  };

  /** Fetch packages */
  const fetchPackages = async () => {
    try {
      const res = await apiClient.get<{ packages: PhotoshootPackage[] }>("/api/packages", {
        withCredentials: true, // include cookies
      });
      // Extract the array from the object
      const packagesData = res.data.packages || [];

      setPackages(packagesData);
    } catch (err: any) {
      console.error("Error fetching packages:", err);
      toast({ 
        title: "Error loading packages", 
        description: err?.response?.data?.message || "Try again later.", 
        variant: "destructive" 
      });
    }
  };


  useEffect(() => {
    fetchOrders();
    fetchPackages();
  }, [token]);

  /** Debounced search */
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery.trim()) globalSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  /** Auto-update prices */
  useEffect(() => {
    const selectedPkg = packages.find((p) => p.id === selectedPackageId);
    if (selectedPkg) setBasePrice(Number(selectedPkg.basePrice));
  }, [selectedPackageId, packages]);

  useEffect(() => {
    setFinalPrice(Number(basePrice) + Number(transportPrice) - Number(discount));
  }, [basePrice, transportPrice, discount]);

  /** Modal handlers */
  const openOrderModal = (order?: OrderResult) => {
    if (order) {
      setSelectedOrder(order);
      setSelectedUser(order.user);
      setSelectedPackageId(order.package?.id?.toString() || packages[0]?.id?.toString() || "");
      setShootDate(order.shootDate?.split("T")[0] || "");
      setNotes(order.notes || "");
      setShootPlace(order.shootPlace || "");
      setDiscount(order.discount ?? 0);
      setBasePrice(order.basePrice ?? 0);
      setFinalPrice(order.finalPrice ?? 0);
      setTransportPrice(order.transportPrice ?? 0);
      setAmountPaid(order.amountPaid ?? 0);
      setStatus(order.status);
    } else {
      setSelectedOrder(null);
      setSelectedUser(null);
      setSelectedPackageId(packages[0]?.id?.toString() || "");
      setShootDate("");
      setShootPlace("");
      setNotes("");
      setDiscount(0);
      setBasePrice(packages[0]?.basePrice ?? 0);
      setFinalPrice(packages[0]?.basePrice ?? 0);
      setTransportPrice(0);
      setAmountPaid(0);
      setStatus("PENDING");
      setSearchQuery("");
      setResults({ users: [], orders: [] });
    }
    setIsModalOpen(true);
  };
  const openManageModal = () => {
    setIsManageMode(true);
    openOrderModal();
  };

  /** Save / Delete */
  const handleSaveOrder = async () => {
    if (!selectedUser?.id || !selectedPackageId) return toast({ title: "Missing details", description: "Fill user and package.", variant: "destructive" });
    
    const payload = {
      packageId: selectedPackageId,
      shootDate: shootDate ? new Date(shootDate).toISOString() : undefined,
      notes, shootPlace, discount, basePrice, finalPrice, transportPrice, amountPaid, status,
      userId: selectedUser.id,
    };
    
    try {
      if (selectedOrder) await apiClient.put(`/api/orders/${selectedOrder.id}`, payload, { withCredentials: true });
      else await apiClient.post("/api/orders/create", payload, { withCredentials: true });
      toast({ title: selectedOrder ? "Order updated" : "Order created" });
      setIsModalOpen(false);
      await fetchOrders();
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.message || "Something went wrong", variant: "destructive" });
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await apiClient.delete(`/api/orders/${orderId}`, { withCredentials: true });
      toast({ title: "Order deleted" });
      await fetchOrders();
    } catch (err: any) {
      toast({ title: "Error deleting order", description: err?.response?.data?.message || "Something went wrong", variant: "destructive" });
    }
  };

  /** Columns for DataTable */
  const confirmedColumns = [
    { key: "readableOrderNumber", header: "Order #", className: "font-semibold" },
    { key: "user", header: "Client", render: (o: OrderResult) => `${o.user.firstName} ${o.user.lastName}` },
    { key: "package", header: "Package", render: (o: OrderResult) => o.package.displayName },
    { key: "shootDate", header: "Shoot Date", render: (o: OrderResult) => o.shootDate ? new Date(o.shootDate).toLocaleDateString("sk-SK") : "-" },
    { key: "finalPrice", header: "Balance (€)", align: "right" as const, render: (o: OrderResult) => (o.finalPrice - (o.amountPaid ?? 0)).toFixed(2) },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb path={["Dashboard", "Orders"]} />

      <div className={`flex gap-4 ${glassBoxStyle} p-4`}>
        <button onClick={() => openOrderModal()} className="px-4 py-2 w-40 rounded main-ui-button">Create New Order</button>
        <button onClick={openManageModal} className="px-4 py-2 w-40 rounded main-ui-button">Manage Order</button>
      </div>

      {pendingOrders.length > 0 && (
        <div className={`p-4 ${glassBoxStyle}`}>
          <h2 className="font-bold mb-2">Pending Orders</h2>
          <div className="flex flex-wrap gap-4">
            {pendingOrders.map((o) => (
              <div key={o.id} className={`w-fit max-w-[200px] p-2 rounded-xl ${statusColors[o.status]} backdrop-blur-md border border-white/20 shadow-xl hover:scale-105 hover:shadow-2xl`} onClick={() => openOrderModal(o)}>
                <div className="font-bold text-2xl">{o.readableOrderNumber}</div>
                <div className="text-sm">{o.user.firstName} {o.user.lastName}</div>
                <div className="text-sm">{o.package.displayName}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingPaymentOrders.length > 0 && (
        <div className={`p-4 ${glassBoxStyle}`}>
          <h2 className="font-bold mb-2">Pending Payments</h2>
          <div className="flex flex-wrap gap-4">
            {pendingPaymentOrders.map((o) => (
              <div key={o.id} className={`w-fit max-w-[200px] p-2 rounded-xl ${statusColors[o.status]} backdrop-blur-md border border-white/20 shadow-xl hover:scale-105 hover:shadow-2xl`} onClick={() => openOrderModal(o)}>
                <div className="font-bold text-2xl">{o.readableOrderNumber}</div>
                <div className="text-sm">{o.user.firstName} {o.user.lastName}</div>
                <div className="text-sm">K úhrade: {o.finalPrice - (o.amountPaid ?? 0)} €</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {confirmedOrders.length > 0 && (
        <div className={`p-4 ${glassBoxStyle}`}>
          <h2 className="font-bold mb-2">Confirmed Orders</h2>
          <DataTable
            data={confirmedOrders}
            columns={confirmedColumns}
            onRowClick={openOrderModal}
            loading={false}
          />
        </div>
      )}

      <OrderEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isManageMode={isManageMode}
        isCreating={!selectedOrder && !isManageMode}
        selectedOrder={selectedOrder}
        packages={packages}
        statusColors={statusColors}
        glassBoxStyle={glassBoxStyle}
        userForm={selectedUser}
        selectedPackageId={selectedPackageId}
        setSelectedPackageId={setSelectedPackageId}
        shootDate={shootDate}
        setShootDate={setShootDate}
        shootPlace={shootPlace}
        setShootPlace={setShootPlace}        
        notes={notes}
        setNotes={setNotes}
        discount={discount}
        setDiscount={setDiscount}
        basePrice={basePrice}
        setBasePrice={setBasePrice}
        finalPrice={finalPrice}
        setFinalPrice={setFinalPrice}
        transportPrice={transportPrice}
        setTransportPrice={setTransportPrice}
        amountPaid={amountPaid}
        setAmountPaid={setAmountPaid}
        status={status}
        setStatus={setStatus}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResultsUsers={searchResultsUsers}
        searchResultsOrders={searchResultsOrders}
        loadingSearch={loadingSearch}
        onUserSelect={handleUserSelect}
        onOrderSelect={openOrderModal}
        onSave={handleSaveOrder}
        onDelete={handleDeleteOrder}
      />
    </div>
  );
}
