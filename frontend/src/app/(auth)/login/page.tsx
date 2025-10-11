"use client";

import { useState } from "react";
import { useAuth } from "@context/AuthContext";

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password); // AuthContext handles role redirect
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Checking session...
      </div>
    );
  }

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
