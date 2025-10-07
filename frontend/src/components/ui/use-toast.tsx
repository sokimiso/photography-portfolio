"use client";

import * as React from "react";
import { ToastProvider, Toast, ToastTitle, ToastDescription, ToastAction, ToastViewport } from "./Toast";

type ToastOptions = {
  title: string;
  description?: string;
  duration?: number;
  variant?: "default" | "destructive";
};

export const ToastContext = React.createContext<{
  toast: (options: ToastOptions) => void;
}>({
  toast: () => {},
});

export const ToastProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<ToastOptions[]>([]);

  const toast = (options: ToastOptions) => {
    setToasts((prev) => [...prev, options]);
    setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, options.duration ?? 4000);
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastProvider>
        {children}
        {toasts.map((t, i) => (
          <Toast key={i}>
            <ToastTitle>{t.title}</ToastTitle>
            {t.description && <ToastDescription>{t.description}</ToastDescription>}
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  );
};

export const useToast = () => React.useContext(ToastContext);
