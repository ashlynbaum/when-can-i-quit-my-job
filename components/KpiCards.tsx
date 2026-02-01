"use client";

import type { Kpis, GlobalInputs, YearRow } from "@/lib/model";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { InfoTooltip } from "./InfoTooltip";
import { getSecurityNumberAtYear } from "@/lib/model";

type KpiCardsProps = {
  kpis: Kpis;
  enoughNumber: number;
  inputs: GlobalInputs;
  rows: YearRow[];
};

export function KpiCards({ kpis, enoughNumber, inputs, rows }: KpiCardsProps) {
  // Years to Coast - target at that year
  const coastTargetAtYear = kpis.yearsToCoast 
    ? getSecurityNumberAtYear(inputs, kpis.yearsToCoast)
    : null;
  
  // Earliest Sabbatical - find runway at that year
  const sabbaticalRow = rows.find(r => r.year === kpis.earliestSabbaticalYear);
  const sabbaticalRunway = sabbaticalRow 
    ? sabbaticalRow.startAccessibleNW / sabbaticalRow.expenses
    : null;

  // Retirement values
  const yearsToRetirement = inputs.yearsUntilRetirement;
  const inflationAdjustment = Math.pow(1 + inputs.inflation, yearsToRetirement);
  const retirementNetWorthToday = kpis.retirementNetWorth !== null 
    ? kpis.retirementNetWorth / inflationAdjustment 
    : null;
  const retirementNetWorthNominal = kpis.retirementNetWorth;

  // Annual income at retirement (SWR * net worth at retirement)
  const retirementAnnualIncomeToday = retirementNetWorthToday !== null
    ? retirementNetWorthToday * inputs.safeWithdrawalRate
    : null;
  const retirementAnnualIncomeFuture = retirementAnnualIncomeToday !== null
    ? retirementAnnualIncomeToday * inflationAdjustment
    : null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <div className="card px-4 py-3">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          <span>Years to Coast</span>
          <InfoTooltip text="When your savings grow enough on their own to reach your retirement goal—even if you stop saving today." />
        </p>
        <p className="mt-1 text-xl font-semibold text-slate-900">
          {kpis.yearsToCoast ?? "—"}
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          {coastTargetAtYear ? `Year ${kpis.yearsToCoast} Target: ${formatCurrency(coastTargetAtYear)}` : "—"}
        </p>
      </div>

      <div className="card px-4 py-3">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          <span>Years to Quit</span>
          <InfoTooltip text="When you'll have enough saved to cover your living expenses without working." />
        </p>
        <p className="mt-1 text-xl font-semibold text-slate-900">
          {kpis.yearsToEnough ?? "—"}
        </p>
        <p className="mt-1 text-[11px] text-slate-500">Target: {formatCurrency(enoughNumber)}</p>
      </div>

      <div className="card px-4 py-3">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          <span>Earliest Sabbatical</span>
          <InfoTooltip text="When your accessible savings can cover a full year off work." />
        </p>
        <p className="mt-1 text-xl font-semibold text-slate-900">
          {kpis.earliestSabbaticalYear ? `Year ${kpis.earliestSabbaticalYear}` : "—"}
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          When accessible savings cover a year off
        </p>
      </div>

      <div className="card px-4 py-3">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          <span>Runway at Sabbatical</span>
          <InfoTooltip text="How many years your accessible savings could sustain you at that point." />
        </p>
        <p className="mt-1 text-xl font-semibold text-slate-900">
          {sabbaticalRunway ? `${formatNumber(sabbaticalRunway)} yrs` : "—"}
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          {kpis.earliestSabbaticalYear ? `At year ${kpis.earliestSabbaticalYear}` : "Based on expenses"}
        </p>
      </div>

      <div className="card px-4 py-3">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          <span>Retirement Net Worth</span>
          <InfoTooltip text="What your total net worth will be worth in today's purchasing power when you retire." />
        </p>
        <p className="mt-1 text-xl font-semibold text-slate-900">
          {retirementNetWorthNominal !== null ? formatCurrency(retirementNetWorthNominal) : "—"}
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          {retirementNetWorthToday !== null 
            ? `Year ${yearsToRetirement}: ${formatCurrency(retirementNetWorthToday)} in today's dollars`
            : "At retirement age"}
        </p>
      </div>

      <div className="card px-4 py-3">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          <span>Annual Income at Retirement</span>
          <InfoTooltip text="How much you can safely withdraw each year from your portfolio in retirement." />
        </p>
        <p className="mt-1 text-xl font-semibold text-slate-900">
          {retirementAnnualIncomeFuture !== null ? formatCurrency(retirementAnnualIncomeFuture) : "—"}
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          {retirementAnnualIncomeToday !== null 
            ? `Year ${yearsToRetirement}: ${formatCurrency(retirementAnnualIncomeToday)} in today's dollars`
            : "Safe withdrawal rate"}
        </p>
      </div>
    </div>
  );
}
