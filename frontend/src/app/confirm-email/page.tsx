"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";

export default function ConfirmEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Overujeme vašu e-mailovú adresu...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Neplatný potvrdzovací odkaz.");
      return;
    }

    const confirmEmail = async () => {
      try {
        await apiClient.get(`/api/users/confirm-email?token=${token}`);
        setStatus("success");
        setMessage("E-mail bol úspešne potvrdený! Môžete sa prihlásiť.");
        // Optional: Redirect after 3 seconds
        setTimeout(() => router.push("/login"), 30000);
      } catch (err: any) {
        setStatus("error");
        setMessage(
          err?.response?.data?.message || "Overenie zlyhalo. Odkaz môže byť neplatný alebo vypršal."
        );
      }
    };

    confirmEmail();
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center p-6">
      <div
        className={`rounded-xl p-8 shadow-lg border max-w-md w-full ${
          status === "success"
            ? "border-green-400 bg-green-50 text-green-800"
            : status === "error"
            ? "border-red-400 bg-red-50 text-red-800"
            : "border-gray-300 bg-gray-50 text-gray-700"
        }`}
      >
        <h1 className="text-2xl font-semibold mb-2">
          {status === "loading"
            ? "Overujeme e-mail..."
            : status === "success"
            ? "E-mail potvrdený!"
            : "Overenie zlyhalo"}
        </h1>
        <p className="text-sm">{message}</p>

        {status === "success" && (
          <p className="mt-4 text-gray-600 text-xs">
            Presmerovávame vás na prihlasovaciu stránku...
          </p>
        )}
      </div>
    </div>
  );
}
