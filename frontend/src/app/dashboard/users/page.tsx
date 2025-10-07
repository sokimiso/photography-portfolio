"use client";

import UsersPageComponent from "./UsersPageComponent";
import type { User } from "./UsersPageComponent";

interface UsersPageProps {
  selectedUser?: User;
}

export default function UsersPage({ selectedUser }: UsersPageProps) {
  return <UsersPageComponent selectedUser={selectedUser} />;
}
