"use client";

import type { Kpis, GlobalInputs } from "@/lib/model";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";

type KpiCardsProps = {
  kpis: Kpis;
  enoughNumber: number;
  inputs: GlobalInputs;
};

export function KpiCards({ kpis, enoughNumber, inputs }: KpiCardsProps) {
  // Calculate retirement values in today's dollars
  const yearsToRetirement = inputs.yearsUntilRetirement;
  const inflationAdjustment = Math.pow(1 + inputs.inflation, yearsToRetirement);
  const retirementNetWorthToday = kpis.retirementNetWorth !== null 
    ? kpis.retirementNetWorth / inflationAdjustment 
    : null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Years to Coast */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Years to Coast
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {kpis.yearsToCoast ?? "—"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Stop grinding, take lower-paying work you enjoy
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
            <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Years to Quit */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              Years to Quit
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {kpis.yearsToEnough ?? "—"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Work becomes optional, live off your money
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
            <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Retirement Net Worth */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
              At Retirement
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {retirementNetWorthToday !== null ? formatCurrency(retirementNetWorthToday) : "—"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Net worth in today's dollars
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50">
            <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Earliest Sabbatical */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
              Earliest Sabbatical
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {kpis.earliestSabbaticalYear !== null ? `Year ${kpis.earliestSabbaticalYear}` : "—"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              When accessible savings cover a year off
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
            <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Accessible Runway */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Accessible Runway
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {kpis.accessibleRunwayYears !== null 
                ? `${formatNumber(kpis.accessibleRunwayYears)} yrs` 
                : "—"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Years of expenses in accessible savings
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
            <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Target Number */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Target Number
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {formatCurrency(enoughNumber)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Amount needed to quit and live off investments
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
            <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
