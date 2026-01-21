"use client";

import { PercentInput } from "./PercentInput";
import type { GlobalInputs, Scenario, Segment } from "@/lib/model";

type SidebarProps = {
  inputs: GlobalInputs;
  scenarios: Scenario[];
  activeScenarioId: string;
  segmentIssues: string[];
  onUpdateInputs: (inputs: GlobalInputs) => void;
  onSetActiveScenario: (id: string) => void;
  onAddScenario: () => void;
  onRemoveScenario: (id: string) => void;
  onRenameScenario: (id: string, name: string) => void;
  onUpdateSegment: (scenarioId: string, segmentId: string, patch: Partial<Segment>) => void;
  onAddSegment: (scenarioId: string) => void;
  onRemoveSegment: (scenarioId: string, segmentId: string) => void;
  onReset: () => void;
};

export function Sidebar({
  inputs,
  scenarios,
  activeScenarioId,
  segmentIssues,
  onUpdateInputs,
  onSetActiveScenario,
  onAddScenario,
  onRemoveScenario,
  onRenameScenario,
  onUpdateSegment,
  onAddSegment,
  onRemoveSegment,
  onReset
}: SidebarProps) {
  const activeScenario = scenarios.find((scenario) => scenario.id === activeScenarioId) ?? scenarios[0];

  return (
    <aside className="flex h-full flex-col gap-6 overflow-y-auto px-5 py-6">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">FIRE + Liquidity</p>
        <h1 className="text-2xl font-semibold text-slate-900">Scenario Builder</h1>
        <p className="text-sm text-slate-500">
          Model year-by-year cash flow and compare accessible vs total net worth.
        </p>
      </div>

      <div className="card">
        <div className="card-header">Global Defaults</div>
        <div className="space-y-4 px-5 py-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Projection Years</label>
              <input
                className="input"
                type="number"
                value={inputs.projectionYears}
                min={1}
                onChange={(event) =>
                  onUpdateInputs({ ...inputs, projectionYears: Number(event.target.value) })
                }
              />
            </div>
            <div>
              <label className="label">Years Until Retirement</label>
              <input
                className="input"
                type="number"
                value={inputs.yearsUntilRetirement}
                min={1}
                onChange={(event) =>
                  onUpdateInputs({ ...inputs, yearsUntilRetirement: Number(event.target.value) })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Starting Total NW</label>
              <input
                className="input"
                type="number"
                value={inputs.startingTotalNW}
                onChange={(event) =>
                  onUpdateInputs({ ...inputs, startingTotalNW: Number(event.target.value) })
                }
              />
            </div>
            <div>
              <label className="label">Starting Accessible NW</label>
              <input
                className="input"
                type="number"
                value={inputs.startingAccessibleNW}
                onChange={(event) =>
                  onUpdateInputs({ ...inputs, startingAccessibleNW: Number(event.target.value) })
                }
              />
            </div>
          </div>

          <PercentInput
            label="Nominal Return"
            value={inputs.nominalReturn}
            onChange={(value) => onUpdateInputs({ ...inputs, nominalReturn: value })}
          />
          <PercentInput
            label="Inflation"
            value={inputs.inflation}
            onChange={(value) => onUpdateInputs({ ...inputs, inflation: value })}
          />
          <PercentInput
            label="Fees"
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
            label="Restricted Savings Rate"
            value={inputs.restrictedSavingsRate}
            onChange={(value) => onUpdateInputs({ ...inputs, restrictedSavingsRate: value })}
            max={0.5}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Retirement Spending</label>
              <input
                className="input"
                type="number"
                value={inputs.retirementSpending}
                onChange={(event) =>
                  onUpdateInputs({ ...inputs, retirementSpending: Number(event.target.value) })
                }
              />
            </div>
          </div>

          <button className="button w-full" onClick={onReset}>
            Reset to Defaults
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Scenarios</div>
        <div className="space-y-4 px-5 py-5">
          <div className="space-y-2">
            {scenarios.map((scenario) => (
              <button
                key={scenario.id}
                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm ${
                  scenario.id === activeScenarioId
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
                onClick={() => onSetActiveScenario(scenario.id)}
              >
                <span>{scenario.name}</span>
                {scenario.id === activeScenarioId && (
                  <span className="text-xs opacity-70">Active</span>
                )}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button className="button flex-1" onClick={onAddScenario}>
              Add Scenario
            </button>
            {scenarios.length > 1 && (
              <button
                className="button button-danger"
                onClick={() => onRemoveScenario(activeScenarioId)}
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {activeScenario && (
        <div className="card">
          <div className="card-header">Active Scenario</div>
          <div className="space-y-4 px-5 py-5">
            <div>
              <label className="label">Scenario Name</label>
              <input
                className="input"
                value={activeScenario.name}
                onChange={(event) => onRenameScenario(activeScenario.id, event.target.value)}
              />
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
              Gaps default to zero income and retirement spending. Overlapping segments are not
              allowed.
            </div>

            <div className="space-y-3">
              {activeScenario.segments.map((segment) => (
                <div key={segment.id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Segment
                    </p>
                    <button
                      className="button button-danger px-2 py-1 text-xs"
                      onClick={() => onRemoveSegment(activeScenario.id, segment.id)}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div>
                      <label className="label">Start Year</label>
                      <input
                        className="input"
                        type="number"
                        min={1}
                        value={segment.startYear}
                        onChange={(event) =>
                          onUpdateSegment(activeScenario.id, segment.id, {
                            startYear: Number(event.target.value)
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="label">End Year</label>
                      <input
                        className="input"
                        type="number"
                        min={1}
                        value={segment.endYear}
                        onChange={(event) =>
                          onUpdateSegment(activeScenario.id, segment.id, {
                            endYear: Number(event.target.value)
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="label">Annual Work Income</label>
                      <input
                        className="input"
                        type="number"
                        value={segment.annualWorkIncome}
                        onChange={(event) =>
                          onUpdateSegment(activeScenario.id, segment.id, {
                            annualWorkIncome: Number(event.target.value)
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="label">Annual Expenses</label>
                      <input
                        className="input"
                        type="number"
                        value={segment.annualExpenses}
                        onChange={(event) =>
                          onUpdateSegment(activeScenario.id, segment.id, {
                            annualExpenses: Number(event.target.value)
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {segmentIssues.length > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {segmentIssues.map((issue) => (
                  <p key={issue}>{issue}</p>
                ))}
              </div>
            )}

            <button className="button w-full" onClick={() => onAddSegment(activeScenario.id)}>
              Add Segment
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
