"use client";

import React from "react";

interface Column<T> {
  key: keyof T | string;
  header: string | React.ReactNode;
  render?: (item: T) => React.ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  loading?: boolean;
  highlightRow?: (item: T) => boolean;
  emptyMessage?: string;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  onRowClick,
  loading = false,
  highlightRow,
  emptyMessage = "No data available.",
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="space-y-2 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-300 dark:bg-gray-700 rounded" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <div className="text-gray-500 dark:text-gray-400">{emptyMessage}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left text-gray-500 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={`py-2 px-3 font-medium text-${col.align || "left"} ${col.className || ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => {
            const rowHighlight = highlightRow?.(item) ? "bg-red-100 dark:bg-red-900/30" : "";
            return (
              <tr
                key={item.id}
                className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer ${rowHighlight}`}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={`py-2 px-3 text-${col.align || "left"} ${col.className || ""}`}
                  >
                    {col.render ? col.render(item) : (item[col.key as keyof T] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
