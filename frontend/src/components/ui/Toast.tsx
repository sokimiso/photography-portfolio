"use client";

import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cn } from "@/lib/utils";

export const ToastProvider = ToastPrimitives.Provider;

export const ToastViewport = () => (
  <ToastPrimitives.Viewport
    className="fixed bottom-0 right-0 flex flex-col p-4 gap-2 w-96 max-w-full z-[1000] outline-none"
  />
);

type ToastProps = React.ComponentProps<typeof ToastPrimitives.Root>;

export const Toast = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Root>, ToastProps>(
  ({ className, ...props }, ref) => (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(
        "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-3 shadow-md flex items-center justify-between",
        className
      )}
      {...props}
    />
  )
);

export const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentProps<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title ref={ref} className={cn("font-bold text-sm", className)} {...props} />
));

export const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentProps<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description ref={ref} className={cn("text-sm text-gray-600 dark:text-gray-300", className)} {...props} />
));

export const ToastAction = ToastPrimitives.Action;
