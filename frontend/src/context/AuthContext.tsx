"use client";

import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export type UserRole = "ADMIN" | "CUSTOMER" | "GUEST" | null;

interface AuthContextProps {
  loggedIn: boolean;
  role: "ADMIN" | "CUSTOMER" | null;
  token: string | null;
  user?: { id: string; firstName: string; lastName: string; email: string };
  login: (token: string, role: "ADMIN" | "CUSTOMER") => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  loggedIn: false,
  role: null,
  token: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState<"ADMIN" | "CUSTOMER" | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Initialize state from cookies or localStorage on mount
  useEffect(() => {
    const storedToken = Cookies.get("token") || localStorage.getItem("token") || null;
    const storedRole = (Cookies.get("role") as "ADMIN" | "CUSTOMER" | undefined) || null;

    if (storedToken && storedRole) {
      setToken(storedToken);
      setLoggedIn(true);
      setRole(storedRole);
    }
  }, []);

  const login = (jwt: string, userRole: "ADMIN" | "CUSTOMER") => {
    // Store in cookies
    Cookies.set("token", jwt, { expires: 7 });
    Cookies.set("role", userRole, { expires: 7 });

    // Store in localStorage
    localStorage.setItem("token", jwt);

    setToken(jwt);
    setLoggedIn(true);
    setRole(userRole);
    router.push("/dashboard");
  };

  const logout = () => {
    // Remove from cookies
    Cookies.remove("token");
    Cookies.remove("role");

    // Remove from localStorage
    localStorage.removeItem("token");

    setToken(null);
    setLoggedIn(false);
    setRole(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ loggedIn, role, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for usage
export const useAuth = () => useContext(AuthContext);
