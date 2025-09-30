"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@context/AuthContext";
import Breadcrumb from "../components/Breadcrumb";

type UserRole = "CUSTOMER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  deliveryAddress: string;
  role: UserRole;
  emailConfirmed: boolean;
  orders?: string[];
}

interface UsersPageComponentProps {
  selectedUser?: User | null;
}

export default function UsersPageComponent({ selectedUser: preSelectedUser }: UsersPageComponentProps) {
  const { token } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(preSelectedUser || null);
  const path = ["Dashboard", "Užívatelia"];

  useEffect(() => {
    if (preSelectedUser) setSelectedUser(preSelectedUser);
  }, [preSelectedUser]);

  // You can add fetching users, search, and form submission here

  return (
    <div className="space-y-6">
      <div><Breadcrumb path={path} /></div>
      
      {/* Edit User Card */}
      <div className="flex-1 p-6 rounded-xl shadow-lg bg-white/10 backdrop-blur-md border border-white/20">
        <h2 className="text-lg font-bold mb-2">Editovať používateľa</h2>

        {/* User search */}
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Hľadať používateľa"
            className="flex-1 p-2 border rounded"
          />
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            🔍
          </button>
        </div>

        {/* Users list */}
        <div className="mb-2">
          {users.map((u) => (
            <div
              key={u.id}
              className="cursor-pointer p-1 hover:bg-gray-100"
              onClick={() => setSelectedUser(u)}
            >
              {u.firstName} {u.lastName} ({u.email})
            </div>
          ))}
        </div>

        {/* Selected User Form */}
        {selectedUser && (
          <div className="mt-2 space-y-3">
            <div>
              <small className="block mb-1 text-gray-500">Meno</small>
              <input
                type="text"
                value={selectedUser.firstName}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, firstName: e.target.value })
                }
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <small className="block mb-1 text-gray-500">Priezvisko</small>
              <input
                type="text"
                value={selectedUser.lastName}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, lastName: e.target.value })
                }
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <small className="block mb-1 text-gray-500">Telefón</small>
              <input
                type="text"
                value={selectedUser.phoneNumber}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, phoneNumber: e.target.value })
                }
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <small className="block mb-1 text-gray-500">Email</small>
              <input
                type="email"
                value={selectedUser.email}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, email: e.target.value })
                }
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <small className="block mb-1 text-gray-500">Role</small>
              <select
                value={selectedUser.role}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, role: e.target.value as UserRole })
                }
                className="w-full p-2 border rounded"
              >
                <option value="CUSTOMER">CUSTOMER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              Uložiť zmeny
            </button>
          </div>
        )}
      </div>

      {/* Add User Card */}
      <div className="flex-1 p-6 rounded-xl shadow-lg bg-white/10 backdrop-blur-md border border-white/20">
        <h2 className="text-lg font-bold mb-2">Pridať používateľa</h2>
        {/* Form for creating new user */}
      </div>
    </div>
  );
}
