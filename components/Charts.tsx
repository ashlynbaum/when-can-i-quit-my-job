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
  Legend
} from "recharts";
import type { YearRow } from "@/lib/model";
import { formatCurrency } from "@/lib/format";

type ChartsProps = {
  rows: YearRow[];
};

const tooltipFormatter = (value: number) => formatCurrency(value);

export function Charts({ rows }: ChartsProps) {
  return (
    <div className="grid gap-4">
      <div className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Net Worth Over Time</h3>
          <span className="badge">Total vs Accessible</span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={tooltipFormatter} width={90} />
            <Tooltip formatter={tooltipFormatter} />
            <Legend />
            <Line
              type="monotone"
              dataKey="endTotalNW"
              stroke="#0f172a"
              strokeWidth={2}
              name="Total NW"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="endAccessibleNW"
              stroke="#38bdf8"
              strokeWidth={2}
              name="Accessible NW"
              dot={false}
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
