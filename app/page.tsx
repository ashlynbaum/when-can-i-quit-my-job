"use client";

import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { KpiCards } from "@/components/KpiCards";
import { Charts } from "@/components/Charts";
import { RowsTable } from "@/components/RowsTable";
import { defaultInputs, defaultScenarios } from "@/lib/defaults";
import {
  computeKpis,
  computeScenario,
  getCoastFireNumberAtYear,
  getFireNumber,
  getSegmentIssues,
  type GlobalInputs,
  type Scenario,
  type Segment
} from "@/lib/model";
import { parseState, toPersistedState } from "@/lib/storage";

const STORAGE_KEY = "fire-liquidity-dashboard:v2";
const STORAGE_VERSION = 2;

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export default function HomePage() {
  const [inputs, setInputs] = useState<GlobalInputs>(defaultInputs);
  const [scenarios, setScenarios] = useState<Scenario[]>(defaultScenarios);
  const [activeScenarioId, setActiveScenarioId] = useState<string>(defaultScenarios[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tableOpen, setTableOpen] = useState(true);

  useEffect(() => {
    const parsed = parseState(typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null);
    if (parsed && parsed.version === STORAGE_VERSION) {
      setInputs(parsed.inputs);
      setScenarios(parsed.scenarios);
      setActiveScenarioId(parsed.activeScenarioId);
    }
  }, []);

  useEffect(() => {
    const payload = toPersistedState(STORAGE_VERSION, inputs, scenarios, activeScenarioId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [inputs, scenarios, activeScenarioId]);

  const activeScenario = useMemo(
    () => scenarios.find((scenario) => scenario.id === activeScenarioId) ?? scenarios[0],
    [scenarios, activeScenarioId]
  );

  const scenarioResult = useMemo(
    () => computeScenario(inputs, activeScenario),
    [inputs, activeScenario]
  );

  const kpis = useMemo(() => computeKpis(inputs, scenarioResult.rows), [inputs, scenarioResult.rows]);

  const segmentIssues = useMemo(
    () => getSegmentIssues(activeScenario.segments),
    [activeScenario.segments]
  );

  const fireNumber = useMemo(() => getFireNumber(inputs), [inputs]);
  const coastNumberNow = useMemo(() => getCoastFireNumberAtYear(inputs, 1), [inputs]);

  const handleReset = () => {
    setInputs(defaultInputs);
    setScenarios(defaultScenarios);
    setActiveScenarioId(defaultScenarios[0].id);
  };

  const handleAddScenario = () => {
    const newScenario: Scenario = {
      id: createId(),
      name: "New Scenario",
      segments: [
        {
          id: createId(),
          startYear: 1,
          endYear: Math.max(1, inputs.projectionYears),
          annualWorkIncome: 0,
          annualExpenses: inputs.retirementSpending
        }
      ]
    };
    setScenarios((prev) => [...prev, newScenario]);
    setActiveScenarioId(newScenario.id);
  };

  const handleRemoveScenario = (id: string) => {
    if (scenarios.length <= 1) return;
    const next = scenarios.filter((scenario) => scenario.id !== id);
    setScenarios(next);
    setActiveScenarioId(next[0].id);
  };

  const handleRenameScenario = (id: string, name: string) => {
    setScenarios((prev) =>
      prev.map((scenario) => (scenario.id === id ? { ...scenario, name } : scenario))
    );
  };

  const handleUpdateSegment = (scenarioId: string, segmentId: string, patch: Partial<Segment>) => {
    setScenarios((prev) =>
      prev.map((scenario) => {
        if (scenario.id !== scenarioId) return scenario;
        return {
          ...scenario,
          segments: scenario.segments.map((segment) =>
            segment.id === segmentId ? { ...segment, ...patch } : segment
          )
        };
      })
    );
  };

  const handleAddSegment = (scenarioId: string) => {
    setScenarios((prev) =>
      prev.map((scenario) => {
        if (scenario.id !== scenarioId) return scenario;
        const maxEnd = scenario.segments.reduce((max, segment) => Math.max(max, segment.endYear), 0);
        const startYear = Math.min(inputs.projectionYears, maxEnd + 1 || 1);
        const newSegment: Segment = {
          id: createId(),
          startYear,
          endYear: startYear,
          annualWorkIncome: 0,
          annualExpenses: inputs.retirementSpending
        };
        return { ...scenario, segments: [...scenario.segments, newSegment] };
      })
    );
  };

  const handleRemoveSegment = (scenarioId: string, segmentId: string) => {
    setScenarios((prev) =>
      prev.map((scenario) => {
        if (scenario.id !== scenarioId) return scenario;
        return { ...scenario, segments: scenario.segments.filter((segment) => segment.id !== segmentId) };
      })
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <div
        className={`fixed inset-y-0 left-0 z-20 w-full max-w-sm transform bg-white shadow-xl transition md:static md:w-96 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          inputs={inputs}
          scenarios={scenarios}
          activeScenarioId={activeScenario.id}
          segmentIssues={segmentIssues}
          onUpdateInputs={setInputs}
          onSetActiveScenario={setActiveScenarioId}
          onAddScenario={handleAddScenario}
          onRemoveScenario={handleRemoveScenario}
          onRenameScenario={handleRenameScenario}
          onUpdateSegment={handleUpdateSegment}
          onAddSegment={handleAddSegment}
          onRemoveSegment={handleRemoveSegment}
          onReset={handleReset}
        />
      </div>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <button className="button md:hidden" onClick={() => setSidebarOpen((prev) => !prev)}>
            {sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
          </button>
          <div className="text-sm text-slate-500">
            Active scenario: <span className="font-semibold text-slate-700">{activeScenario.name}</span>
          </div>
          <button className="button" onClick={() => setTableOpen((prev) => !prev)}>
            {tableOpen ? "Hide Table" : "Show Table"}
          </button>
        </div>

        <div className="space-y-6">
          <KpiCards kpis={kpis} fireNumber={fireNumber} coastNumberNow={coastNumberNow} />
          <Charts rows={scenarioResult.rows} />
          {tableOpen && <RowsTable rows={scenarioResult.rows} />}
        </div>
      </main>
    </div>
  );
}
