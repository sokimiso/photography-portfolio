"use client";

import { useState } from "react";
import { UserResult } from "@/types/order.dto";
import { useScrollLock } from "@/hooks/useScrollLock";
import { Label } from "@/components/ui/Label";
import { formatDate } from "@/utils/formatDate";

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
  } = props;

  const [firstName, setFirstName] = useState(userForm?.firstName || "");
  const [lastName, setLastName] = useState(userForm?.lastName || "");
  const [email, setEmail] = useState(userForm?.email || "");
  const [phoneNumber, setPhoneNumber] = useState(userForm?.phoneNumber || "");
  const [role, setRole] = useState<UserResult["role"]>(userForm?.role || "CUSTOMER");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isSearchMode = !userForm && !isCreating && !isManageMode;

  useScrollLock(isOpen);

  if (!isOpen) return null;

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
    setEmail("");
    setPhoneNumber("");
    setRole("CUSTOMER");
  };

  const handleSave = () => {
    onSave({ firstName, lastName, email, phoneNumber, role });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-hidden">
      <div className="relative flex flex-col max-h-[90vh] sm:max-w-[95%] md:max-w-[50%] rounded-xl bg-white/10 border border-white/20 text-amber-50 backdrop-blur-md shadow-xl">
        
        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          <h2 className="text-xl font-semibold mb-4 flex justify-between items-center">
            <span>
              {selectedUser?.deletedAt && (
                <span className="text-red-500 font-semibold ml-2">
                  DELETED at {formatDate(selectedUser.deletedAt)}
                </span>
              )}
            </span>
            <span className="font-semibold">
              Vytvorené: {formatDate(selectedUser?.createdAt) || ""}
            </span>
          </h2>

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
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 py-1">
                <div className="flex flex-col">
                  <Label>First Name</Label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="p-2 rounded w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="flex flex-col">
                  <Label>Last Name</Label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="p-2 rounded w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="flex flex-col">
                  <Label>Email</Label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="p-2 rounded w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="flex flex-col">
                  <Label>Phone</Label>
                  <input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="p-2 rounded w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="flex flex-col">
                  <Label>Role</Label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserResult["role"])}
                    className="p-2 rounded w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="CUSTOMER">Customer</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
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
              <button onClick={handleSave} className="px-4 py-2 rounded main-ui-button">
                {isCreating ? "Vytvoriť používateľa" : "Uložiť"}
              </button>
              {!isCreating && selectedUser && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Odstrániť
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
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
