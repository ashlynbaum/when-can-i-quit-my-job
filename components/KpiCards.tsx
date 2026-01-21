"use client";

import type { Kpis } from "@/lib/model";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";

type KpiCardsProps = {
  kpis: Kpis;
  fireNumber: number;
  coastNumberNow: number;
};

export function KpiCards({ kpis, fireNumber, coastNumberNow }: KpiCardsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="card px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Years to Coast
        </p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">
          {kpis.yearsToCoast ?? "—"}
        </p>
        <p className="mt-1 text-xs text-slate-500">Target today: {formatCurrency(coastNumberNow)}</p>
      </div>
      <div className="card px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Years to FIRE</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">
          {kpis.yearsToFire ?? "—"}
        </p>
        <p className="mt-1 text-xs text-slate-500">FIRE number: {formatCurrency(fireNumber)}</p>
      </div>
      <div className="card px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Earliest Sabbatical
        </p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">
          {kpis.earliestSabbaticalYear ?? "—"}
        </p>
        <p className="mt-1 text-xs text-slate-500">Accessible covers expenses</p>
      </div>
      <div className="card px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Accessible Runway
        </p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">
          {kpis.accessibleRunwayYears ? formatNumber(kpis.accessibleRunwayYears) : "—"} yrs
        </p>
        <p className="mt-1 text-xs text-slate-500">Year 1 expenses</p>
      </div>
      <div className="card px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Capital Coverage
        </p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">
          {kpis.capitalCoverageAccessible ? formatPercent(kpis.capitalCoverageAccessible) : "—"}
        </p>
        <p className="mt-1 text-xs text-slate-500">Accessible SWR / expenses</p>
      </div>
    </div>
  );
}
