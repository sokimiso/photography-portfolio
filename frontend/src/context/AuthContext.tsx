"use client";

import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";

export type UserRole = "ADMIN" | "CUSTOMER" | "GUEST" | null;

interface AuthContextProps {
  loggedIn: boolean;
  role: "ADMIN" | "CUSTOMER" | null;
  token: string | null; // kept for backward compatibility
  user?: { id: string; firstName: string; lastName: string; email: string };
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  loggedIn: false,
  role: null,
  token: null,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState<"ADMIN" | "CUSTOMER" | null>(null);
  const [user, setUser] = useState<AuthContextProps["user"]>();
  const [token] = useState<string | null>(null); // dummy placeholder for legacy code

  // On mount, check current user
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await apiClient.get("/api/auth/me", { withCredentials: true });
        const currentUser = res.data.user;
        setLoggedIn(true);
        setRole(currentUser.role);
        setUser(currentUser);
      } catch {
        setLoggedIn(false);
        setRole(null);
        setUser(undefined);
      } finally {
        setLoading(false); // <--- mark done
      }
    };

    checkSession();
  }, []);


  const login = async (email: string, password: string) => {
    try {
      // Send login request, backend sets HTTP-only cookie
      await apiClient.post("/api/auth/login", { email, password }, { withCredentials: true });

      // Fetch current user info using the cookie
      const res = await apiClient.get("/api/auth/me", { withCredentials: true });

      const loggedUser = res.data.user;

      setLoggedIn(true);
      setRole(loggedUser.role);
      setUser(loggedUser);

      router.push("/dashboard");
    } catch (err: any) {
      console.error("Login failed", err.response?.data || err.message);
      throw err;
    }
  };


  const logout = async () => {
    try {
      await apiClient.post("/api/auth/logout"); // clear cookie
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setLoggedIn(false);
      setRole(null);
      setUser(undefined);
      router.push("/");
    }
  };

  return (
    <AuthContext.Provider value={{ loggedIn, role, token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
