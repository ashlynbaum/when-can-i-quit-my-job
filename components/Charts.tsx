"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ComposedChart,
  Bar,
  Legend,
  ReferenceLine,
  Area
} from "recharts";
import type { GlobalInputs, Kpis, YearRow } from "@/lib/model";
import { formatCurrency } from "@/lib/format";
import { useMemo } from "react";

type ChartsProps = {
  rows: YearRow[];
  inputs: GlobalInputs;
  kpis: Kpis;
  targetNumber: number;
};

const tooltipFormatter = (value: number) => formatCurrency(value);

export function Charts({ rows, inputs, kpis, targetNumber }: ChartsProps) {
  const netWorthRows = useMemo(
    () =>
      rows.map((row) => ({
        ...row,
        endAccessibleNW: Math.max(0, row.endAccessibleNW),
        startAccessibleNW: Math.max(0, row.startAccessibleNW)
      })),
    [rows]
  );
  const xTicks = useMemo(() => {
    if (rows.length === 0) return [];
    return rows
      .map((row) => row.year)
      .filter((year) => year === 1 || year % 5 === 0);
  }, [rows]);

  const retirementYear = inputs.yearsUntilRetirement;
  const bridgeGapStart = useMemo(() => {
    const shortfall = rows.find(
      (row) =>
        row.year <= retirementYear &&
        row.workIncome === 0 &&
        row.startAccessibleNW < row.expenses
    );
    return shortfall?.year ?? null;
  }, [rows, retirementYear]);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (!active || !payload || payload.length === 0) return null;
    const year = payload[0]?.payload?.year ?? null;
    const total = payload[0]?.payload?.endTotalNW ?? null;
    const accessible = payload[0]?.payload?.endAccessibleNW ?? null;
    const expenses = payload[0]?.payload?.expenses ?? null;
    return (
      <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-md">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Year {year}
        </div>
        <div className="mt-1 space-y-1">
          <div>Total net worth: {formatCurrency(total)}</div>
          <div>Accessible net worth: {formatCurrency(accessible)}</div>
          <div>Target number: {formatCurrency(targetNumber)}</div>
          <div>Expenses: {formatCurrency(expenses)}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid gap-4">
      <div className="card p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Net Worth Over Time</h3>
            <p className="text-xs text-slate-500">Total vs Accessible</p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-600">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-900" />
              Total net worth
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
              Accessible net worth
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={netWorthRows}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} ticks={xTicks} />
            <YAxis tickFormatter={tooltipFormatter} width={120} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={targetNumber}
              stroke="#94a3b8"
              strokeDasharray="4 4"
              label={{ value: "Target", position: "insideTopLeft", fill: "#64748b", fontSize: 11 }}
            />
            <ReferenceLine
              x={1}
              stroke="#cbd5f5"
              strokeDasharray="2 2"
              label={{ value: "Today", position: "insideTop", fill: "#94a3b8", fontSize: 10 }}
            />
            {kpis.yearsToCoast && (
              <ReferenceLine
                x={kpis.yearsToCoast}
                stroke="#38bdf8"
                strokeDasharray="2 2"
                label={{ value: "Coast", position: "insideTop", fill: "#38bdf8", fontSize: 10 }}
              />
            )}
            {kpis.yearsToEnough && (
              <ReferenceLine
                x={kpis.yearsToEnough}
                stroke="#0f172a"
                strokeDasharray="2 2"
                label={{ value: "Quit", position: "insideTop", fill: "#0f172a", fontSize: 10 }}
              />
            )}
            <ReferenceLine
              x={retirementYear}
              stroke="#a855f7"
              strokeDasharray="2 2"
              label={{
                value: "Retirement",
                position: "insideTop",
                fill: "#a855f7",
                fontSize: 10
              }}
            />
            {bridgeGapStart && (
              <ReferenceLine
                x={bridgeGapStart}
                stroke="#f59e0b"
                strokeDasharray="2 2"
                label={{
                  value: "Bridge Gap",
                  position: "insideTop",
                  fill: "#f59e0b",
                  fontSize: 10
                }}
              />
            )}
            <Area
              type="monotone"
              dataKey="endTotalNW"
              stroke="#0f172a"
              strokeWidth={2}
              fill="#0f172a"
              fillOpacity={0.08}
              name="Total NW"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="endAccessibleNW"
              stroke="#38bdf8"
              strokeWidth={2}
              fill="#38bdf8"
              fillOpacity={0.18}
              name="Accessible NW"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="endTotalNW"
              stroke="#0f172a"
              strokeWidth={2}
              dot={false}
              name="Total NW"
            />
            <Line
              type="monotone"
              dataKey="endAccessibleNW"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={false}
              name="Accessible NW"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Work Income, Expenses, Savings</h3>
          <span className="badge">Cash Flow</span>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={tooltipFormatter} width={90} />
            <Tooltip formatter={tooltipFormatter} />
            <Legend />
            <Bar dataKey="workIncome" name="Work Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="#f97316" radius={[4, 4, 0, 0]} />
            <Line
              type="monotone"
              dataKey="savings"
              stroke="#0f172a"
              strokeWidth={2}
              name="Savings"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">
              Capital Income vs Expenses
            </h3>
            <span className="badge">Accessible</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={tooltipFormatter} width={80} />
              <Tooltip formatter={tooltipFormatter} />
              <Legend />
              <Line
                type="monotone"
                dataKey="capitalIncomeAccessible"
                stroke="#0ea5e9"
                strokeWidth={2}
                name="Capital Income"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#f97316"
                strokeWidth={2}
                name="Expenses"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Withdrawal Needed</h3>
            <span className="badge">Shortfalls</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={tooltipFormatter} width={80} />
              <Tooltip formatter={tooltipFormatter} />
              <Line
                type="monotone"
                dataKey="withdrawalNeeded"
                stroke="#e11d48"
                strokeWidth={2}
                name="Withdrawal Needed"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
