"use client";

import { Suspense } from "react";
import ConfirmEmailClient from "./ConfirmEmailPageComponent";

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConfirmEmailClient />
    </Suspense>
  );
}
