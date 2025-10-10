import { useState } from "react";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/button";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    deliveryAddress: string;
    sendConfirmationEmail?: boolean;
  }) => void;
  glassBoxStyle: string;
}

export default function CreateUserModal({ isOpen, onClose, onSave, glassBoxStyle }: CreateUserModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [sendConfirmationEmail, setSendConfirmationEmail] = useState(true); // default checked

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ firstName, lastName, email, phoneNumber, deliveryAddress, sendConfirmationEmail });
  };

  const handleCancel = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhoneNumber("");
    setDeliveryAddress("");
    setSendConfirmationEmail(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-2">
      <div className={`relative w-full max-w-md p-6 space-y-4 rounded bg-white/10 border border-white/20 text-amber-50 backdrop-blur-md`}>
        <h2 className="text-xl font-semibold">Create New User</h2>

        <div className="space-y-2">
          <Label>First Name</Label>
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={glassBoxStyle} />

          <Label>Last Name</Label>
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} className={glassBoxStyle} />

          <Label>Email</Label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className={glassBoxStyle} />

          <Label>Phone</Label>
          <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className={glassBoxStyle} />

          <Label>Address</Label>
          <input value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} className={glassBoxStyle} />

          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={sendConfirmationEmail}
              onChange={(e) => setSendConfirmationEmail(e.target.checked)}
              id="sendConfirmationEmail"
            />
            <label htmlFor="sendConfirmationEmail" className="text-sm">Send confirmation email</label>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={handleCancel} variant="secondary">Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  );
}
