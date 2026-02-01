"use client";

import type { Kpis, GlobalInputs } from "@/lib/model";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { InfoTooltip } from "./InfoTooltip";
import { getSecurityNumberAtYear } from "@/lib/model";

type KpiCardsProps = {
  kpis: Kpis;
  enoughNumber: number;
  inputs: GlobalInputs;
};

export function KpiCards({ kpis, enoughNumber, inputs }: KpiCardsProps) {
  const coastNumberNow = getSecurityNumberAtYear(inputs, 1);

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
      <div className="card px-4 py-3">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          <span>Years to Coast</span>
          <InfoTooltip text="First year where end-of-year total net worth meets the Coast FIRE target." />
        </p>
        <p className="mt-1 text-xl font-semibold text-slate-900">
          {kpis.yearsToCoast ?? "—"}
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          Target today: {formatCurrency(coastNumberNow)}
        </p>
      </div>
      <div className="card px-4 py-3">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          <span>Years to Quit</span>
          <InfoTooltip text="First year where end-of-year total net worth meets the target number to quit your job." />
        </p>
        <p className="mt-1 text-xl font-semibold text-slate-900">
          {kpis.yearsToEnough ?? "—"}
        </p>
        <p className="mt-1 text-[11px] text-slate-500">Target: {formatCurrency(enoughNumber)}</p>
      </div>
      <div className="card px-4 py-3">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          <span>Earliest Sabbatical</span>
          <InfoTooltip text="First year where accessible net worth covers annual expenses." />
        </p>
        <p className="mt-1 text-xl font-semibold text-slate-900">
          {kpis.earliestSabbaticalYear ?? "—"}
        </p>
        <p className="mt-1 text-[11px] text-slate-500">Accessible covers expenses</p>
      </div>
      <div className="card px-4 py-3">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          <span>Accessible Runway</span>
          <InfoTooltip text="Accessible net worth divided by year-1 expenses." />
        </p>
        <p className="mt-1 text-xl font-semibold text-slate-900">
          {kpis.accessibleRunwayYears ? formatNumber(kpis.accessibleRunwayYears) : "—"} yrs
        </p>
        <p className="mt-1 text-[11px] text-slate-500">Year 1 expenses</p>
      </div>
      <div className="card px-4 py-3">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          <span>Capital Coverage</span>
          <InfoTooltip text="Safe-withdrawal-rate income from accessible net worth divided by year-1 expenses." />
        </p>
        <p className="mt-1 text-xl font-semibold text-slate-900">
          {kpis.capitalCoverageAccessible ? formatPercent(kpis.capitalCoverageAccessible) : "—"}
        </p>
        <p className="mt-1 text-[11px] text-slate-500">Accessible SWR / expenses</p>
      </div>
    </div>
  );
}
