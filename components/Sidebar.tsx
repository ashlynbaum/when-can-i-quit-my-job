"use client";

import { PercentInput } from "./PercentInput";
import { NumberInput } from "./NumberInput";
import { CurrencyInput } from "./CurrencyInput";
import { InfoTooltip } from "./InfoTooltip";
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
  const restrictedNetWorth = inputs.startingTotalNW - inputs.startingAccessibleNW;

  return (
    <aside
      className="flex h-full flex-col gap-6 overflow-x-hidden overflow-y-auto border-slate-200 bg-white px-5 py-6 md:border-r"
      data-sidebar
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-slate-700">Spill the Tea</h2>
          <p className="text-sm text-slate-500">
            Your baseline numbers that shape the entire projection.
          </p>
        </div>
        <button
          className="hidden rounded-md border border-slate-200 bg-white px-2 py-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-900 md:block"
          onClick={onToggleOpen}
          aria-label="Toggle sidebar"
        >
          <span className="sr-only">{isOpen ? "Collapse sidebar" : "Open sidebar"}</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className={`h-4 w-4 transition-transform ${isOpen ? "rotate-0" : "rotate-180"}`}
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.78 4.22a.75.75 0 0 1 0 1.06L8.56 9.5l4.22 4.22a.75.75 0 1 1-1.06 1.06l-4.75-4.75a.75.75 0 0 1 0-1.06l4.75-4.75a.75.75 0 0 1 1.06 0Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div className="card">
        <div className="space-y-5 px-5 py-5">
          <div className="space-y-2">
            <label className="label flex items-center gap-2">
              <span>Current Annual Income</span>
              <InfoTooltip text="Your current yearly take-home income (after taxes), before any changes." />
            </label>
            <CurrencyInput
              className="input"
              value={inputs.currentYearIncome}
              onChange={(value) => onUpdateInputs({ ...inputs, currentYearIncome: value })}
            />
          </div>

          <div className="space-y-2">
            <label className="label flex items-center gap-2">
              <span>Accessible Net Worth</span>
              <InfoTooltip text="Assets you can use before retirement, like cash, stocks, bonds, and crypto (excluding restricted accounts)." />
            </label>
            <CurrencyInput
              className="input"
              value={inputs.startingAccessibleNW}
              onChange={(value) =>
                onUpdateInputs({
                  ...inputs,
                  startingAccessibleNW: value,
                  startingTotalNW: value + restrictedNetWorth
                })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="label flex items-center gap-2">
              <span>Restricted Net Worth</span>
              <InfoTooltip text="Assets locked until retirement, like 401(k), IRA, and home equity." />
            </label>
            <CurrencyInput
              className="input"
              value={restrictedNetWorth}
              onChange={(value) => onUpdateInputs({ 
                ...inputs, 
                startingTotalNW: inputs.startingAccessibleNW + value 
              })}
            />
            <p className="text-xs text-slate-500">
              Total Net Worth: ${(inputs.startingTotalNW).toLocaleString()}
            </p>
          </div>

          <div className="space-y-2">
            <label className="label flex items-center gap-2">
              <span>Retirement Spending</span>
              <InfoTooltip text="Enter this in today's dollars; inflation is handled via the real return used in the retirement calculations." />
            </label>
            <CurrencyInput
              className="input"
              value={inputs.retirementSpending}
              onChange={(value) => onUpdateInputs({ ...inputs, retirementSpending: value })}
            />
          </div>

          <div className="space-y-2">
            <label className="label flex items-center gap-2">
              <span>Years Until Retirement</span>
              <InfoTooltip text="Years until your retirement accounts can be accessed." />
            </label>
            <NumberInput
              className="input"
              value={inputs.yearsUntilRetirement}
              min={1}
              onChange={(value) => onUpdateInputs({ ...inputs, yearsUntilRetirement: value })}
            />
          </div>

          <PercentInput
            label="Nominal Return"
            tooltip="Expected annual investment return before inflation and fees."
            value={inputs.nominalReturn}
            onChange={(value) => onUpdateInputs({ ...inputs, nominalReturn: value })}
          />
          <PercentInput
            label="Inflation"
            tooltip="Annual inflation rate used to adjust future spending targets."
            value={inputs.inflation}
            onChange={(value) => onUpdateInputs({ ...inputs, inflation: value })}
          />
          <PercentInput
            label="Safe Withdrawal Rate"
            tooltip="Percent of your portfolio you plan to withdraw each year in retirement."
            value={inputs.safeWithdrawalRate}
            onChange={(value) => onUpdateInputs({ ...inputs, safeWithdrawalRate: value })}
            max={0.1}
          />
          <PercentInput
            label="Restricted Savings Rate"
            tooltip="Share of income going to restricted uses like retirement accounts or mortgage principal."
            value={inputs.restrictedSavingsRate}
            onChange={(value) => onUpdateInputs({ ...inputs, restrictedSavingsRate: value })}
            max={0.5}
          />
          <div className="space-y-2">
            <label className="label flex items-center gap-2">
              <span>Projection Years</span>
              <InfoTooltip text="How many years the model projects into the future." />
            </label>
            <NumberInput
              className="input"
              value={inputs.projectionYears}
              min={1}
              onChange={(value) => onUpdateInputs({ ...inputs, projectionYears: value })}
            />
          </div>

          <button className="button w-full" onClick={onReset}>
            Reset to Defaults
          </button>
        </div>
      </div>
    </aside>
  );
}
