"use client";

import { useMemo } from "react";
import type { YearRow } from "@/lib/model";
import { formatCurrency, formatPercent } from "@/lib/format";

type RowsTableProps = {
  rows: YearRow[];
};

export function RowsTable({ rows }: RowsTableProps) {
  const headers = [
    "Year",
    "Start Total NW",
    "Start Accessible NW",
    "Work Income",
    "Expenses",
    "Savings",
    "Restricted Savings",
    "Accessible Savings",
    "Growth Total",
    "Growth Accessible",
    "Withdrawal Needed",
    "End Total NW",
    "End Accessible NW",
    "Capital Income Total",
    "Capital Income Accessible",
    "Coast FIRE Number"
  ];

  const csvData = useMemo(() => {
    const lines = [headers.join(",")];
    rows.forEach((row) => {
      lines.push(
        [
          row.year,
          row.startTotalNW,
          row.startAccessibleNW,
          row.workIncome,
          row.expenses,
          row.savings,
          row.restrictedSavings,
          row.accessibleSavings,
          row.growthTotal,
          row.growthAccessible,
          row.withdrawalNeeded,
          row.endTotalNW,
          row.endAccessibleNW,
          row.capitalIncomeTotal,
          row.capitalIncomeAccessible,
          row.coastFireNumber
        ].join(",")
      );
    });
    return lines.join("\n");
  }, [rows, headers]);

  const downloadCsv = () => {
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "fire-dashboard.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Computed Rows</h3>
          <p className="text-xs text-slate-500">All values are nominal dollars.</p>
        </div>
        <button className="button" onClick={downloadCsv}>
          Export CSV
        </button>
      </div>
      <div className="mt-4 overflow-auto">
        <table className="min-w-full text-left text-xs text-slate-600">
          <thead className="sticky top-0 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-3 py-2">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.year} className="border-b border-slate-100">
                <td className="px-3 py-2 font-medium text-slate-700">{row.year}</td>
                <td className="px-3 py-2">{formatCurrency(row.startTotalNW)}</td>
                <td className="px-3 py-2">{formatCurrency(row.startAccessibleNW)}</td>
                <td className="px-3 py-2">{formatCurrency(row.workIncome)}</td>
                <td className="px-3 py-2">{formatCurrency(row.expenses)}</td>
                <td className="px-3 py-2">{formatCurrency(row.savings)}</td>
                <td className="px-3 py-2">{formatCurrency(row.restrictedSavings)}</td>
                <td className="px-3 py-2">{formatCurrency(row.accessibleSavings)}</td>
                <td className="px-3 py-2">{formatCurrency(row.growthTotal)}</td>
                <td className="px-3 py-2">{formatCurrency(row.growthAccessible)}</td>
                <td className="px-3 py-2">{formatCurrency(row.withdrawalNeeded)}</td>
                <td className="px-3 py-2">{formatCurrency(row.endTotalNW)}</td>
                <td className="px-3 py-2">{formatCurrency(row.endAccessibleNW)}</td>
                <td className="px-3 py-2">{formatCurrency(row.capitalIncomeTotal)}</td>
                <td className="px-3 py-2">{formatCurrency(row.capitalIncomeAccessible)}</td>
                <td className="px-3 py-2">{formatCurrency(row.coastFireNumber)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 text-xs text-slate-400">
        Returns are nominal. Coast FIRE number uses real return (nominal - inflation - fees).
      </div>
    </div>
  );
}
