"use client";

import { useState } from "react";

interface Column {
  key: string;
  label: string;
  className?: string;
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, unknown>[];
  onRowClick?: (row: Record<string, unknown>) => void;
}

export default function DataTable({
  columns,
  data,
  onRowClick,
}: DataTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (aVal == null || bVal == null) return 0;
        const cmp = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        return sortAsc ? cmp : -cmp;
      })
    : data;

  return (
    <div className="overflow-x-auto border border-ft-border rounded-lg">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-ft-card">
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                className={`text-left text-ft-dim text-[10px] uppercase tracking-widest font-body font-normal px-4 py-2 cursor-pointer hover:text-ft-light select-none ${
                  col.className ?? ""
                }`}
              >
                {col.label}
                {sortKey === col.key && (
                  <span className="ml-1">{sortAsc ? "▲" : "▼"}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr
              key={i}
              onClick={() => onRowClick?.(row)}
              className={`${
                i % 2 === 0 ? "bg-ft-surface" : "bg-ft-bg"
              } ${
                onRowClick
                  ? "cursor-pointer hover:bg-ft-card transition-colors"
                  : ""
              }`}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-2 text-ft-light font-body ${
                    col.className ?? ""
                  }`}
                >
                  {String(row[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
