"use client";

import { useState, ChangeEvent } from "react";
import { UserResult, PhotoshootPackage, OrderResult } from "@/types/order.dto";
import CustomSelect from "@/components/ui/CustomSelect";
import { useScrollLock } from "@/hooks/useScrollLock";
import { Label } from "@/components/ui/Label";
import { formatDate } from "@/utils/formatDate";
import { useTexts } from "@/context/TextContext";

export type OrderPhoto = {
  id: string;
  url: string;
  title: string;
  description: string;
  isPublic: boolean;
  isVisible: boolean;
  isFinalDelivery: boolean;
  toPostprocess: boolean;
  toPrint: boolean;
};

interface OrderEditorModalProps {
  selectedOrder?: OrderResult | null;
  isOpen: boolean;
  onClose: () => void;
  isCreating: boolean;
  isManageMode?: boolean;
  packages: PhotoshootPackage[];
  statusColors: Record<OrderResult["status"], string>;
  glassBoxStyle: string;
  userForm: UserResult | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResultsUsers: UserResult[];
  searchResultsOrders: OrderResult[];
  loadingSearch: boolean;
  onUserSelect: (user: UserResult) => void;
  onOrderSelect: (order: OrderResult) => void;

  selectedPackageId: string;
  setSelectedPackageId: (id: string) => void;

  shootDate: string;
  setShootDate: (val: string) => void;

  createdAt: string;

  notes: string;
  setNotes: (val: string) => void;

  shootPlace: string;
  setShootPlace: (val: string) => void;  

  discount: number;
  setDiscount: (val: number) => void;

  basePrice: number;
  setBasePrice: (val: number) => void;

  finalPrice: number;
  setFinalPrice: (val: number) => void;

  transportPrice: number;
  setTransportPrice: (val: number) => void;

  amountPaid: number;
  setAmountPaid: (val: number) => void;

  status: OrderResult["status"];
  setStatus: (val: OrderResult["status"]) => void;

  onSave: () => void;
  onDelete?: (orderId: string) => void;
}

export default function OrderEditorModal(props: OrderEditorModalProps) {
  const {
    isOpen,
    onClose,
    isCreating,
    isManageMode,
    packages,
    statusColors,
    glassBoxStyle,
    userForm,
    searchQuery,
    setSearchQuery,
    searchResultsUsers,
    searchResultsOrders,
    loadingSearch,
    onUserSelect,
    onOrderSelect,
    selectedPackageId,
    setSelectedPackageId,
    shootDate,
    setShootDate,
    createdAt,
    shootPlace,
    setShootPlace,    
    notes,
    setNotes,
    discount,
    setDiscount,
    basePrice,
    setBasePrice,
    finalPrice,
    setFinalPrice,
    transportPrice,
    setTransportPrice,
    amountPaid,
    setAmountPaid,
    status,
    setStatus,
    onSave,
    selectedOrder,
    onDelete,
  } = props;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isSearchMode = !userForm && !isCreating && !isManageMode;
  const texts = useTexts();

  // Helper to reset all modal fields
  const resetAllFields = () => {
    setSearchQuery("");
    setSelectedPackageId("");
    setShootDate("");
    setShootPlace("");
    setNotes("");
    setDiscount(0);
    setBasePrice(0);
    setFinalPrice(0);
    setTransportPrice(0);
    setAmountPaid(0);
    setStatus("PENDING");
  };


  useScrollLock(isOpen);

  if (!isOpen) return null;

  // Modal title helper
  let modalTitle = "";

  if (isManageMode) {
    modalTitle = "Manage Order";
  } else if (isCreating) {
    modalTitle = "Vytvoriť novú objednávku";
  } else if (selectedOrder) {
    modalTitle = "Editovať objednávku";
  }

  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-hidden">
    <div className="relative flex flex-col max-h-[90vh] sm:max-w-[95%] md:max-w-[85%] min-w-[50%] rounded bg-white/10 border border-white/20 text-amber-50 backdrop-blur-md shadow-xl">
    
      {/* User & Order Info */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        <h2 className="text-xl font-semibold mb-4">{modalTitle}</h2>

        {/* User Search */}
        {!userForm && (
          <div className="mb-4">
            <input
              type="text"
              placeholder="Hľadať používateľa alebo objednávku..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2 border rounded w-full mb-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            {loadingSearch && <div>Hľadanie...</div>}
            {(searchResultsUsers.length > 0 || searchResultsOrders.length > 0) && (
              <div className="max-h-60 overflow-y-auto border rounded p-2 space-y-1 bg-white dark:bg-gray-800">
                {searchResultsUsers.map((u) => (
                  <div key={u.id} onClick={() => onUserSelect(u)} className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 p-1 rounded">
                    {u.firstName} {u.lastName} - {u.email}
                  </div>
                ))}
                {searchResultsOrders.map((o) => (
                  <div key={o.id} onClick={() => onOrderSelect(o)} className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 p-1 rounded">
                    Order #{o.readableOrderNumber} - {o.user.firstName} {o.user.lastName}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {userForm && (
          <>
            {/* User Info */}
            <div>
            <h2 className="text-xl font-semibold mb-4 flex justify-between items-center">
              <span>
                {selectedOrder?.readableOrderNumber ? `#${selectedOrder.readableOrderNumber}` : ""}
                {selectedOrder?.deletedAt && (
                  <span className="text-red-500 font-semibold ml-2">
                    DELETED at {formatDate(selectedOrder.deletedAt)}
                  </span>
                )}
              </span>

              <span className="font-semibold">
                Vytvorené: {formatDate(selectedOrder?.createdAt) || ""}
              </span>
            </h2>
              <h3 className="font-medium mb-2">Informácie o zákazníkovi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 py-1">
                <div className="flex flex-col">
                  <Label>{texts.common?.name}</Label>
                  <input value={userForm.firstName} readOnly className="p-2 rounded w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                </div>
                <div className="flex flex-col">
                  <Label>{texts.common?.lastName}</Label>
                  <input value={userForm.lastName} readOnly className="p-2 rounded w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                </div>
                <div className="flex flex-col">
                  <Label>{texts.common?.email}</Label>
                  <input value={userForm.email} readOnly className="p-2 rounded w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                </div>
                <div className="flex flex-col">
                  <Label>{texts.common?.phone}</Label>
                  <input value={userForm.phoneNumber} readOnly className="p-2 rounded w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                </div>
              </div>
            </div>

            {/* Order Info */}
            <div>
              <h3 className="font-medium mb-2">Informácie o objednávke</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex flex-col">
                  <Label>{texts.common?.package}</Label>
                  <CustomSelect
                    options={packages.map((p) => ({ id: p.id, name: p.displayName }))}
                    value={{ id: selectedPackageId, name: packages.find(p => p.id === selectedPackageId)?.displayName || "" }}
                    onChange={(pkg) => setSelectedPackageId(pkg.id.toString())}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <span>
                    <Label>Dátum fotenia</Label>
                    <input type="date" value={shootDate} onChange={(e) => setShootDate(e.target.value)} className={glassBoxStyle} />
                  </span>
                  <span>
                    <Label>Čas fotenia</Label>
                    <input type="time"  />
                  </span>  
                </div>                

                <div className="flex flex-col">
                  <Label>Miesto fotenia</Label>
                  <input type="text" value={shootPlace} onChange={(e) => setShootPlace(e.target.value)} className={glassBoxStyle}  />
                </div>

                <div className="flex flex-col">
                  <Label>Stav objednávky</Label>
                  <CustomSelect
                    options={["PENDING","CONFIRMED","COMPLETED","CANCELLED"].map(op => ({id: op, name: op }))} 
                    value={{id: status, name: status}}
                    onChange={(value) => setStatus(value.id as OrderResult["status"])}
                    getOptionClass={(opt) => statusColors[opt.id as OrderResult["status"]]}
                    getButtonClass={(val) => statusColors[val.id as OrderResult["status"]]}                  
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <span>
                    <Label>Základná cena (€)</Label>
                    <input type="number" value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value))} className={glassBoxStyle} />
                  </span>
                  <span>
                    <Label>Doprava (€)</Label>
                    <input type="number" value={transportPrice} onChange={(e) => setTransportPrice(Number(e.target.value))} className={glassBoxStyle} />
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <span>
                    <Label>Zľava (€)</Label>
                    <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className={glassBoxStyle} />
                  </span>
                  <span>
                    <Label>Konečná cena (€)</Label>
                    <input type="number" value={finalPrice} onChange={(e) => setFinalPrice(Number(e.target.value))} className={glassBoxStyle} />
                  </span>                  
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <span>
                    <Label>Uhradené (€)</Label>
                    <input type="number" value={amountPaid} onChange={(e) => setAmountPaid(Number(e.target.value))} className={glassBoxStyle} />
                  </span>
                  <span>
                    <Label>Zostáva uhradiť (€)</Label>
                    <input type="number" value={finalPrice - amountPaid} readOnly className={glassBoxStyle} />
                  </span>
                </div>
              </div>

              <div className="flex flex-col mt-4">
                <Label>Poznámky</Label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={5} className={glassBoxStyle} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 left-0 right-0 flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700 bg-white/10 backdrop-blur-md">
        {isSearchMode ? (
          // Search mode → only show cancel button
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
            {/* Normal editing / creating buttons */}
            {!(isCreating && isManageMode) && (
              <button onClick={onSave} className="px-4 py-2 rounded main-ui-button">
                {isCreating ? "Vytvoriť objednávku" : "Editovať"}
              </button>
            )}
            {!isCreating && selectedOrder && (
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


      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-hidden">
          <div className="p-6 space-y-4 relative flex flex-col max-h-[90vh] sm:max-w-[95%] md:max-w-[85%] min-w-[50%] rounded-xl bg-white/10 border border-white/20 text-amber-50 backdrop-blur-md shadow-xl">
            <h3 className="text-lg font-semibold">Potvrdiť odstránenie</h3>
            <p>Ste si istý, že chcete odstrániť túto objednávku? Táto akcia je reverzibilná.</p>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400">
                Zrušiť
              </button>
              <button
                onClick={() => {
                  if (selectedOrder) onDelete?.(selectedOrder.id);
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
