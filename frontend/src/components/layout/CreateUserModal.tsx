"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/Label";
import { useTexts } from "@/context/TextContext";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    deliveryAddress: string;
  }) => void;
  glassBoxStyle: string;
}

export default function CreateUserModal({ isOpen, onClose, onSave, glassBoxStyle }: CreateUserModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const texts = useTexts();

  const resetAllFields = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhoneNumber("");
    setDeliveryAddress("");
  };

  const handleSave = () => {
    onSave({ firstName, lastName, email, phoneNumber, deliveryAddress });
    resetAllFields();
    onClose();
  };

  const handleCancel = () => {
    resetAllFields();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 overflow-auto p-2">
      <div className="relative flex flex-col w-full max-w-[95%] sm:max-w-[80%] md:max-w-[50%] rounded bg-white/10 border border-white/20 text-amber-50 backdrop-blur-md shadow-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold mb-4">Vytvoriť nového používateľa</h2>

        <div className="grid gap-3">
          <div>
            <Label>{texts.common?.name}</Label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={glassBoxStyle} />
          </div>

          <div>
            <Label>{texts.common?.lastName}</Label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className={glassBoxStyle} />
          </div>

          <div>
            <Label>{texts.common?.email}</Label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={glassBoxStyle} />
          </div>

          <div>
            <Label>{texts.common?.phone}</Label>
            <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className={glassBoxStyle} />
          </div>

          <div>
            <Label>{texts.common?.address}</Label>
            <input type="text" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} className={glassBoxStyle} />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={handleCancel} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 rounded main-ui-button">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
