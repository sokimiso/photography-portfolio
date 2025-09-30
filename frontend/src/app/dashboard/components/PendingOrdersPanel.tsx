"use client";

import { OrderResult } from "@hooks/useGlobalSearch";

type Props = {
  pendingOrders: OrderResult[];
  loading: boolean;
  onSelectOrder: (order: OrderResult) => void;
};

export default function PendingOrdersPanel({ pendingOrders, loading, onSelectOrder }: Props) {
  return (
    <div className="p-4 mb-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
      <h2 className="text-lg font-bold mb-2 cursor-default">Čakajúce objednávky</h2>
      {loading ? (
        <div className="animate-pulse space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      ) : pendingOrders.length === 0 ? (
        <div>Žiadne čakajúce objednávky</div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {pendingOrders.map((o) => (
            <div
              key={o.id}
              className="p-2 border rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={() => onSelectOrder(o)}
            >
              <div className="font-medium">{o.readableOrderNumber}</div>
              <div>{o.user.firstName} {o.user.lastName}</div>
              <div>{o.user.email}</div>
              <div>{o.package.displayName}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
