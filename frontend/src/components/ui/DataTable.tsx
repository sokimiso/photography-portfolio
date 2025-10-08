"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";

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

type SortDirection = "asc" | "desc" | null;

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  onRowClick,
  loading = false,
  highlightRow,
  emptyMessage = "No data available.",
}: DataTableProps<T>) {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [debouncedFilters, setDebouncedFilters] = useState<Record<string, string>>({});
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  /** Debounce filter inputs */
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedFilters({ ...filters }), 300);
    return () => clearTimeout(handler);
  }, [filters]);

  const handleFilterChange = (key: string | keyof T, value: string) => {
    setFilters((prev) => ({ ...prev, [key as string]: value }));
  };

  const handleSort = (key: string | keyof T) => {
    if (sortColumn === key) {
      if (sortDirection === "asc") setSortDirection("desc");
      else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortColumn(null);
      } else setSortDirection("asc");
    } else {
      setSortColumn(key as string);
      setSortDirection("asc");
    }
  };

  /** Filter + sort data */
const displayedData = useMemo(() => {
  let filtered = [...data];

  // Apply all active filters
  filtered = filtered.filter((item) =>
    columns.every((col) => {
      const filterValue = debouncedFilters[col.key as string] || "";
      if (!filterValue) return true;

      // Use render function if exists, else raw value
      let colValue: string | number | null | undefined;

      if (col.render) {
        const rendered = col.render(item);
        if (typeof rendered === "string" || typeof rendered === "number") {
          colValue = rendered;
        } else {
          colValue = null; // ignore complex ReactNodes
        }
      } else {
        // safely cast to string | number | null
        const rawValue = item[col.key as keyof T];
        if (typeof rawValue === "string" || typeof rawValue === "number") {
          colValue = rawValue;
        } else {
          colValue = null;
        }
      }

      if (colValue === undefined || colValue === null) return false;
      return String(colValue).toLowerCase().includes(filterValue.toLowerCase());
    })
  );

  // Apply sorting if any
  if (sortColumn && sortDirection) {
    filtered.sort((a, b) => {
      const col = columns.find((c) => c.key === sortColumn);
      if (!col) return 0;

      let aVal: string | number = col.render ? col.render(a) as string : (a[sortColumn as keyof T] as string | number);
      let bVal: string | number = col.render ? col.render(b) as string : (b[sortColumn as keyof T] as string | number);

      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (aVal === bVal) return 0;

      return sortDirection === "asc"
        ? String(aVal).localeCompare(String(bVal), undefined, { numeric: true })
        : String(bVal).localeCompare(String(aVal), undefined, { numeric: true });
    });
  }

  return filtered;
}, [data, debouncedFilters, sortColumn, sortDirection, columns]);


  if (loading) {
    return (
      <div className="space-y-2 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-300 dark:bg-gray-700 rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          {/* Header + Sorting */}
          <tr className="text-left text-gray-500 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
            {columns.map((col) => {
              const isSorted = sortColumn === col.key;
              return (
                <th
                  key={String(col.key)}
                  className={`py-2 px-3 font-medium text-${col.align || "left"} ${col.className || ""} cursor-pointer select-none`}
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {isSorted && <span>{sortDirection === "asc" ? "▲" : "▼"}</span>}
                  </div>
                </th>
              );
            })}
          </tr>

          {/* Filter Row */}
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} className="py-1 px-3">
                <motion.input
                  type="text"
                  value={filters[col.key as string] || ""}
                  onChange={(e) => handleFilterChange(col.key, e.target.value)}
                  placeholder="Filter..."
                  whileFocus={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                  className="w-full px-2 py-1 text-sm border rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-4 text-center text-gray-500 dark:text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            displayedData.map((item) => {
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
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
