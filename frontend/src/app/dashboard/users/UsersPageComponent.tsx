import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@context/AuthContext";
import { useGlobalSearch } from "@hooks/useGlobalSearch";
import { glassBoxStyle } from "@/lib/constants/orders";
import apiClient from "@/lib/apiClient";
import { useToast } from "@/components/ui/use-toast";
import Breadcrumb from "../components/Breadcrumb";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { UserResult } from "@/types/order.dto";
import UserEditorModal from "@/components/layout/UserEditorModal";

const STATUS_TYPES = ["confirmed", "pending", "inactive", "deleted"] as const;

export default function UsersPageComponent() {
  const { token } = useAuth();
  const { toast } = useToast();

  const [selectedStatus, setSelectedStatus] = useState<typeof STATUS_TYPES[number]>("confirmed");
  const [usersByStatus, setUsersByStatus] = useState<Record<string, UserResult[]>>({
    pending: [],
    confirmed: [],
    inactive: [],
    deleted: [],
  });

  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManageMode, setIsManageMode] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const { results, globalSearch, loading: loadingSearch, setResults } = useGlobalSearch(
    process.env.NEXT_PUBLIC_API_URL!
  );

  // Editable fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("0");

  /** Fetch users by status */
  const fetchUsersByStatus = async () => {
    try {
      const promises = STATUS_TYPES.map((status) =>
        apiClient.get<UserResult[]>(`/api/users/status/${status}`, { withCredentials: true })
      );
      const responses = await Promise.all(promises);
      const data = Object.fromEntries(
        STATUS_TYPES.map((status, i) => [status, responses[i].data])
      ) as Record<string, UserResult[]>;
      setUsersByStatus(data);
    } catch (err: any) {
      toast({
        title: "Error loading users",
        description: err?.response?.data?.message || "Try again later.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchUsersByStatus();
  }, [token]);

  /** Debounced search */
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery.trim()) globalSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  /** Modal handlers */
  const openUserModal = (user?: UserResult) => {
    setSelectedUser(user || null);
    if (!user) {
      setSearchQuery("");
      setResults({ users: [], orders: [] });
      setFirstName("");
      setLastName("");
      setPhoneNumber("0");
    } else {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setPhoneNumber(user.phoneNumber || "0");
    }
    setIsModalOpen(true);
  };

  const openManageModal = () => {
    setIsManageMode(true);
    openUserModal();
  };

  const handleSaveUser = async (payload: Partial<UserResult>) => {
    try {
      if (selectedUser) {
        await apiClient.put(`/api/users/${selectedUser.id}`, payload, { withCredentials: true });
        toast({ title: "User updated" });
      } else {
        await apiClient.post("/api/users", payload, { withCredentials: true });
        toast({ title: "User created" });
      }
      setIsModalOpen(false);
      await fetchUsersByStatus();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await apiClient.delete(`/api/users/${userId}`, { withCredentials: true });
      toast({ title: "User deleted" });
      await fetchUsersByStatus();
    } catch (err: any) {
      toast({
        title: "Error deleting user",
        description: err?.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const userColumns = [
    { key: "firstName", header: "First Name", render: (u: UserResult) => u.firstName || "-" },
    { key: "lastName", header: "Last Name", render: (u: UserResult) => u.lastName || "-" },
    { key: "email", header: "Email", render: (u: UserResult) => u.email || "-" },
    { key: "phoneNumber", header: "Phone", render: (u: UserResult) => u.phoneNumber || "-" },
    { key: "role", header: "Role", render: (u: UserResult) => u.role || "-" },
    { key: "emailConfirmed", header: "Email Confirmed", render: (u: UserResult) => (u.emailConfirmed ? "Yes" : "No") },
    { key: "createdAt", header: "Created At", render: (u: UserResult) => u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-" },
    { key: "deletedAt", header: "Deleted At", render: (u: UserResult) => u.deletedAt ? new Date(u.deletedAt).toLocaleDateString() : "-" },
  ];

  const currentUsers = usersByStatus[selectedStatus] ?? [];

  return (
    <div className="space-y-6">
      <Breadcrumb path={["Dashboard", "Users"]} />

      <div className={`flex gap-4 ${glassBoxStyle} p-4`}>
        <button onClick={() => openUserModal()} className="px-4 py-2 w-40 rounded main-ui-button">
          Create New User
        </button>
        <button onClick={openManageModal} className="px-4 py-2 w-40 rounded main-ui-button">
          Manage User
        </button>
      </div>

      <div className={`p-4 ${glassBoxStyle}`}>
        {/* Status buttons with counts */}
        <div className="flex gap-4 mb-4">
          {STATUS_TYPES.map((status) => {
            const isActive = selectedStatus === status;
            const count = usersByStatus[status]?.length ?? 0;
            const label = `${status.charAt(0).toUpperCase() + status.slice(1)} (${count})`;

            return (
              <Button
                key={status}
                variant="link"
                onClick={() => setSelectedStatus(status as typeof selectedStatus)}
                className={`
                  relative px-3 py-1 text-sm font-medium transition-colors duration-200
                  ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 hover:text-blue-500"}
                `}
              >
                {label}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="active-underline"
                      className="absolute left-0 bottom-0 w-full h-[2px] bg-blue-500 dark:bg-blue-400 rounded"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      initial={{ opacity: 0, y: 2 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 2 }}
                    />
                  )}
                </AnimatePresence>
              </Button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedStatus}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <DataTable
              data={currentUsers}
              columns={userColumns}
              onRowClick={openUserModal}
              loading={false}
              emptyMessage={`No ${selectedStatus} users.`}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <UserEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isManageMode={isManageMode}
        isCreating={!selectedUser && !isManageMode}
        selectedUser={selectedUser}
        userForm={selectedUser}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResultsUsers={results.users}
        loadingSearch={loadingSearch}
        onUserSelect={setSelectedUser}
        onSave={handleSaveUser}
        onDelete={handleDeleteUser}
        glassBoxStyle={glassBoxStyle}
        firstName={firstName}
        setFirstName={setFirstName}
        lastName={lastName}
        setLastName={setLastName}
        phoneNumber={phoneNumber}
        setPhoneNumber={setPhoneNumber}
      />
    </div>
  );
}
