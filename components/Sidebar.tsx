"use client";

import { CurrencyInput } from "./CurrencyInput";
import { PercentInput } from "./PercentInput";
import { NumberInput } from "./NumberInput";
import type { GlobalInputs } from "@/lib/model";

type SidebarProps = {
  inputs: GlobalInputs;
  isOpen: boolean;
  onToggleOpen: () => void;
  onUpdateInputs: (inputs: GlobalInputs) => void;
  onReset: () => void;
};

export function Sidebar({
  inputs,
  isOpen,
  onToggleOpen,
  onUpdateInputs,
  onReset
}: SidebarProps) {
  return (
    <aside className="flex h-full flex-col gap-6 overflow-y-auto bg-white px-5 py-6 shadow-lg md:shadow-none">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Calculator</p>
          <h1 className="text-2xl font-semibold text-slate-900">Your Inputs</h1>
        </div>
        <button
          className="rounded-md border border-slate-200 bg-white px-2 py-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-900 md:hidden"
          onClick={onToggleOpen}
          aria-label="Close sidebar"
        >
          <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor">
            <path
              d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
            />
          </svg>
        </button>
      </div>

      <div className="card">
        <div className="card-header">Financial Starting Point</div>
        <div className="space-y-4 px-5 py-5">
          <CurrencyInput
            label="Current Total Net Worth"
            value={inputs.startingTotalNW}
            onChange={(value) => onUpdateInputs({ ...inputs, startingTotalNW: value })}
            min={0}
          />
          <CurrencyInput
            label="Accessible Net Worth (Non-Retirement)"
            value={inputs.startingAccessibleNW}
            onChange={(value) => onUpdateInputs({ ...inputs, startingAccessibleNW: value })}
            min={0}
          />
          <CurrencyInput
            label="Current Year Income"
            value={inputs.currentYearIncome}
            onChange={(value) => onUpdateInputs({ ...inputs, currentYearIncome: value })}
            min={0}
          />
          <CurrencyInput
            label="Annual Expenses in Retirement"
            value={inputs.retirementSpending}
            onChange={(value) => onUpdateInputs({ ...inputs, retirementSpending: value })}
            min={0}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-header">Timeline & Planning</div>
        <div className="space-y-4 px-5 py-5">
          <NumberInput
            label="Years Until Retirement"
            value={inputs.yearsUntilRetirement}
            onChange={(value) => onUpdateInputs({ ...inputs, yearsUntilRetirement: value })}
            min={1}
          />
          <NumberInput
            label="Projection Years"
            value={inputs.projectionYears}
            onChange={(value) => onUpdateInputs({ ...inputs, projectionYears: value })}
            min={1}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-header">Investment Assumptions</div>
        <div className="space-y-4 px-5 py-5">
          <PercentInput
            label="Expected Nominal Return"
            value={inputs.nominalReturn}
            onChange={(value) => onUpdateInputs({ ...inputs, nominalReturn: value })}
          />
          <PercentInput
            label="Expected Inflation"
            value={inputs.inflation}
            onChange={(value) => onUpdateInputs({ ...inputs, inflation: value })}
          />
          <PercentInput
            label="Investment Fees"
            value={inputs.fees}
            onChange={(value) => onUpdateInputs({ ...inputs, fees: value })}
            max={0.05}
          />
          <PercentInput
            label="Safe Withdrawal Rate"
            value={inputs.safeWithdrawalRate}
            onChange={(value) => onUpdateInputs({ ...inputs, safeWithdrawalRate: value })}
            max={0.1}
          />
          <PercentInput
            label="% Income to Retirement Accounts"
            value={inputs.restrictedSavingsRate}
            onChange={(value) => onUpdateInputs({ ...inputs, restrictedSavingsRate: value })}
            max={1}
          />
        </div>
      </div>

      <button className="button w-full" onClick={onReset}>
        Reset to Defaults
      </button>
    </aside>
  );
}
