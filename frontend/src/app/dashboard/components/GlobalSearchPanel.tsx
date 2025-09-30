"use client";

import { UserResult, OrderResult } from "@hooks/useGlobalSearch";

type Props = {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  results: { users: UserResult[]; orders: OrderResult[] };
  loading: boolean;
  message: string | null;
  onSelectUser: (user: UserResult) => void;
  onSelectOrder: (order: OrderResult) => void;
  globalSearch: (query: string) => void;
};

export default function GlobalSearchPanel({
  searchQuery,
  setSearchQuery,
  results,
  loading,
  message,
  onSelectUser,
  onSelectOrder,
  globalSearch,
}: Props) {
  return (
    <div className="p-4 rounded-xl shadow-lg bg-white/10 backdrop-blur-md border border-white/20 mb-4">
      <h2 className="text-lg font-bold mb-2">Globálne hľadanie</h2>
      <div className="flex flex-col sm:flex-row gap-2 mb-2">
        <input
          type="text"
          placeholder="Hľadať používateľov alebo objednávky"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={() => globalSearch(searchQuery)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          🔍
        </button>
      </div>

      <div className="space-y-2 mt-2">
        {loading ? (
          <div className="animate-pulse space-y-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        ) : message ? (
          <div className="text-red-500">{message}</div>
        ) : (
          <>
            {results.users.length > 0 && (
              <div>
                <strong>Užívatelia:</strong>
                <div className="mt-1 space-y-1">
                  {results.users.map((u) => (
                    <div
                      key={u.id}
                      className="cursor-pointer p-1 hover:bg-gray-100"
                      onClick={() => onSelectUser(u)}
                    >
                      {u.firstName} {u.lastName} ({u.email})
                    </div>
                  ))}
                </div>
              </div>
            )}
            {results.orders.length > 0 && (
              <div className="mt-2">
                <strong>Objednávky:</strong>
                <div className="mt-1 space-y-1">
                  {results.orders.map((o) => (
                    <div
                      key={o.id}
                      className="cursor-pointer p-1 hover:bg-gray-100"
                      onClick={() => onSelectOrder(o)}
                    >
                      {o.readableOrderNumber} — {o.user.firstName} {o.user.lastName} ({o.user.email}) — {o.package.displayName}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
