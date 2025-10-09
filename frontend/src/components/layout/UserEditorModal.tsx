"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { UserResult } from "@/types/order.dto";
import { useScrollLock } from "@/hooks/useScrollLock";
import { Label } from "@/components/ui/Label";
import { formatDate } from "@/utils/formatDate";
import { useTexts } from "@/context/TextContext";
import { useUserOrders } from "@/hooks/useUserOrders";

interface UserEditorModalProps {
  selectedUser?: UserResult | null;
  isOpen: boolean;
  onClose: () => void;
  isCreating: boolean;
  isManageMode?: boolean;
  userForm: UserResult | null;

  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResultsUsers: UserResult[];
  loadingSearch: boolean;
  onUserSelect: (user: UserResult) => void;

  onSave: (payload: Partial<UserResult>) => void;
  onDelete?: (userId: string) => void;
  glassBoxStyle: string;

  firstName: string;
  setFirstName: (val: string) => void;

  lastName: string;
  setLastName: (val: string) => void;

  phoneNumber: string;
  setPhoneNumber: (val: string) => void;
}

export default function UserEditorModal(props: UserEditorModalProps) {
  const {
    isOpen,
    onClose,
    isCreating,
    isManageMode,
    userForm,
    searchQuery,
    setSearchQuery,
    searchResultsUsers,
    loadingSearch,
    onUserSelect,
    selectedUser,
    onSave,
    onDelete,
    glassBoxStyle,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    phoneNumber,
    setPhoneNumber,
  } = props;

  const [deliveryAddress, setDeliveryAddress] = useState(userForm?.deliveryAddress || "");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [createdAt, setCreatedAt] = useState<string>("");
  const [updatedAt, setUpdatedAt] = useState<string>("");
  const [lastLoginAt, setLastLoginAt] = useState<string>("");

  const { orders, loading } = useUserOrders(selectedUser?.id, orderStatusFilter);
  const isSearchMode = !userForm && !isCreating && !isManageMode;
  const texts = useTexts();

  useScrollLock(isOpen);

  // Initialize modal fields when opening or selecting a user
  useEffect(() => {
    if (isOpen && selectedUser) {
      setFirstName(selectedUser.firstName || "");
      setLastName(selectedUser.lastName || "");
      setPhoneNumber(selectedUser.phoneNumber || "");
      setDeliveryAddress(selectedUser.deliveryAddress || "");
      setOrderStatusFilter("CONFIRMED");

      setCreatedAt(selectedUser.createdAt || "");
      setUpdatedAt(selectedUser.updatedAt || "");
      setLastLoginAt(selectedUser.lastLoginAt || "");
    }
  }, [isOpen, selectedUser, setFirstName, setLastName, setPhoneNumber]);

  const modalTitle = isManageMode
    ? "Manage User"
    : isCreating
    ? "Vytvoriť nového používateľa"
    : selectedUser
    ? "Editovať používateľa"
    : "";

  const resetAllFields = () => {
    setSearchQuery("");
    setFirstName("");
    setLastName("");
    setPhoneNumber("");
    setDeliveryAddress("");
  };

  const handleSave = () => {
    onSave({
      firstName,
      lastName,
      phoneNumber,
      deliveryAddress,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 overflow-auto p-2">
      <div className="relative flex flex-col w-full max-w-[95%] xs:max-w-[90%] sm:max-w-[85%] md:max-w-[80%] lg:max-w-[50%] rounded bg-white/10 border border-white/20 text-amber-50 backdrop-blur-md shadow-xl">
        <div className={`flex-1 flex flex-col overflow-y-auto p-4 space-y-4 ${userForm ? "min-h-[750px]" : ""}`}>
          <h2 className="text-xl font-semibold mb-4">{modalTitle}</h2>

          {/* Search Mode */}
          {!userForm && (
            <div className="mb-4">
              <input
                type="text"
                placeholder="Hľadať používateľa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="p-2 border rounded w-full mb-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              {loadingSearch && <div>Hľadanie...</div>}
              {searchResultsUsers.length > 0 && (
                <div className="max-h-60 overflow-y-auto border rounded p-2 space-y-1 bg-white dark:bg-gray-800">
                  {searchResultsUsers.map((u) => (
                    <div
                      key={u.id}
                      onClick={() => onUserSelect(u)}
                      className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 p-1 rounded"
                    >
                      {u.firstName} {u.lastName} - {u.email}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* User Form */}
          {userForm && (
            <>
              <div className="text-xl font-semibold mb-4 flex justify-between items-center">
                <div className="flex w-full justify-between">
                  <div className="grid grid-cols-2 gap-2">
                    <span>
                      <Label>{texts.common?.name}</Label>
                      <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={glassBoxStyle} />
                    </span>
                    <span>
                      <Label>{texts.common?.lastName}</Label>
                      <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className={glassBoxStyle} />
                    </span>
                  </div>
                </div>
                <div className="flex w-full text-red-500 font-semibold ml-2">
                  {selectedUser?.deletedAt && <span>DELETED at {formatDate(selectedUser.deletedAt)}</span>}
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 py-1">
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <Label>{texts.common?.email}</Label>
                    <div className="relative">
                      <input value={userForm.email} readOnly className={`${glassBoxStyle} pr-8`} />
                      {userForm.emailConfirmed ? (
                        <CheckCircle className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500" size={18} />
                      ) : (
                        <XCircle className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500" size={18} />
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>{texts.common?.phone}</Label>
                    <input value={phoneNumber} readOnly className={glassBoxStyle} />
                  </div>
                </div>

                <div className="flex flex-col">
                  <Label>{texts.common?.address}</Label>
                  <input type="text" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} className={glassBoxStyle} />
                </div>
              </div>

              {/* User Orders Section */}
              <div className="mt-6">
                <h3 className="font-semibold text-lg mb-2">{texts.dashboard?.ordersPage?.orders?.orders}</h3>

                <div className="flex gap-2 mb-3">
                  {["CONFIRMED", "PENDING", "COMPLETED", "CANCELLED", "ALL"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setOrderStatusFilter(s === "ALL" ? "" : s)}
                      className={`px-3 py-1 rounded ${
                        orderStatusFilter === s || (s === "ALL" && !orderStatusFilter)
                          ? "bg-primary text-white"
                          : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {loading ? (
                  <div>Loading orders...</div>
                ) : orders.length === 0 ? (
                  <div className="text-gray-400 text-sm">{texts.dashboard?.ordersPage?.orders?.noOrders}</div>
                ) : (
                  <div className="space-y-2 max-h-75 overflow-y-auto">
                    {orders.map((order) => (
                      <div key={order.id} className="flex justify-between p-2 rounded bg-white/10 border border-white/20 hover:bg-white/20 transition">
                        <div>
                          <div className="font-medium">{order.readableOrderNumber}</div>
                          <div className="text-sm text-gray-400">{order.status}</div>
                        </div>
                        <div className="font-semibold">{order.finalPrice} €</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer Info */}
                <div className="sticky bottom-0 mt-4 space-y-1 p-1">
                  <span className="block w-full text opacity-50 font-normal">Created: {createdAt ? formatDate(createdAt) : "-"}</span>
                  <span className="block w-full text opacity-50 font-normal">Last updated: {updatedAt ? formatDate(updatedAt) : "-"}</span>
                  <span className="block w-full text opacity-50 font-normal">User's last login: {lastLoginAt ? formatDate(lastLoginAt) : "-"}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="sticky bottom-0 left-0 right-0 flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700 bg-white/10 backdrop-blur-md">
          {isSearchMode ? (
            <button
              onClick={() => {
                onClose();
                resetAllFields();
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Zrušiť
            </button>
          ) : (
            <>
              {!(isCreating && isManageMode) && (
                <button onClick={handleSave} className="px-4 py-2 rounded main-ui-button">
                  {isCreating ? "Vytvoriť objednávku" : "Editovať"}
                </button>
              )}
              {!isCreating && selectedUser && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Odstrániť
                </button>
              )}
              <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                Zatvoriť
              </button>
            </>
          )}
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-hidden">
            <div className="p-6 space-y-4 relative flex flex-col max-h-[90vh] sm:max-w-[95%] md:max-w-[50%] rounded-xl bg-white/10 border border-white/20 text-amber-50 backdrop-blur-md shadow-xl">
              <h3 className="text-lg font-semibold">Potvrdiť odstránenie</h3>
              <p>Ste si istý, že chcete odstrániť tohto používateľa? Táto akcia je reverzibilná.</p>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400"
                >
                  Zrušiť
                </button>
                <button
                  onClick={() => {
                    if (selectedUser) onDelete?.(selectedUser.id);
                    setShowDeleteConfirm(false);
                    onClose();
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Odstrániť
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
