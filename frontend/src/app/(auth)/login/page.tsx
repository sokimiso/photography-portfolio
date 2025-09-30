"use client";

import { useState } from "react";
import { useAuth } from "@context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setError(errData.message || "Login failed");
        return;
      }

      const data: { token: string; role: "ADMIN" | "CUSTOMER" } = await res.json();

      // Call AuthProvider login
      login(data.token, data.role);
    } catch (err) {
      console.error(err);
      setError("Unexpected error occurred");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 shadow-md rounded px-8 py-6 w-full max-w-md"
      >
        <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Prihlásenie
        </h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <label className="block mb-2 text-gray-700 dark:text-gray-200">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            required
          />
        </label>

        <label className="block mb-4 text-gray-700 dark:text-gray-200">
          Heslo
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            required
          />
        </label>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
        >
          Prihlásiť sa
        </button>
      </form>
    </div>
  );
}
