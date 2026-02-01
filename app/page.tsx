"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { KpiCards } from "@/components/KpiCards";
import { Charts } from "@/components/Charts";
import { RowsTable } from "@/components/RowsTable";
import { NumberInput } from "@/components/NumberInput";
import { PercentInput } from "@/components/PercentInput";
import { CurrencyInput } from "@/components/CurrencyInput";
import { Footer } from "@/components/Footer";
import { defaultInputs, defaultScenarios } from "@/lib/defaults";
import { formatCurrency, formatPercent } from "@/lib/format";
import {
  computeKpis,
  computeScenario,
  getEnoughNumber,
  getSecurityNumberAtYear,
  getSegmentIssues,
  type GlobalInputs,
  type Scenario,
  type Segment
} from "@/lib/model";
import { parseState, toPersistedState } from "@/lib/storage";

const STORAGE_KEY = "financial-liquidity-dashboard:v2";
const STORAGE_VERSION = 2;

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const describeSegments = (segments: Segment[]) => {
  const sorted = [...segments].sort((a, b) => a.startYear - b.startYear);
  const merged: Segment[] = [];

  sorted.forEach((segment) => {
    const last = merged[merged.length - 1];
    if (
      last &&
      last.endYear + 1 === segment.startYear &&
      last.annualWorkIncome === segment.annualWorkIncome &&
      last.annualExpenses === segment.annualExpenses
    ) {
      last.endYear = segment.endYear;
      return;
    }
    merged.push({ ...segment });
  });

  const maxSegments = 5;
  const visible = merged.slice(0, maxSegments);
  const remaining = merged.length - visible.length;

  const summary = visible
    .map((segment) => {
      const range =
        segment.startYear === segment.endYear
          ? `Year ${segment.startYear}`
          : `Years ${segment.startYear}-${segment.endYear}`;
      return `${range}: work income ${formatCurrency(segment.annualWorkIncome)}, expenses ${formatCurrency(
        segment.annualExpenses
      )}.`;
    })
    .join(" ");

  if (remaining <= 0) return summary;
  const lastYear = merged[merged.length - 1]?.endYear ?? segments.length;
  return `${summary} + ${remaining} more segments through year ${lastYear}.`;
};

const normalizeSegments = (segments: Segment[]) =>
  segments
    .map(({ startYear, endYear, annualWorkIncome, annualExpenses }) => ({
      startYear,
      endYear,
      annualWorkIncome,
      annualExpenses
    }))
    .sort(
      (a, b) =>
        a.startYear - b.startYear ||
        a.endYear - b.endYear ||
        a.annualWorkIncome - b.annualWorkIncome ||
        a.annualExpenses - b.annualExpenses
    );

const segmentsMatch = (left: Segment[], right: Segment[]) => {
  if (left.length !== right.length) return false;
  const normalizedLeft = normalizeSegments(left);
  const normalizedRight = normalizeSegments(right);
  return normalizedLeft.every((segment, index) => {
    const candidate = normalizedRight[index];
    return (
      segment.startYear === candidate.startYear &&
      segment.endYear === candidate.endYear &&
      segment.annualWorkIncome === candidate.annualWorkIncome &&
      segment.annualExpenses === candidate.annualExpenses
    );
  });
};

const buildGapYearSegments = (segments: Segment[], gapYear: number): Segment[] => {
  const next: Segment[] = [];
  segments.forEach((segment) => {
    if (gapYear < segment.startYear || gapYear > segment.endYear) {
      next.push({ ...segment, id: createId() });
      return;
    }

    if (segment.startYear < gapYear) {
      next.push({
        ...segment,
        id: createId(),
        endYear: gapYear - 1
      });
    }

    next.push({
      ...segment,
      id: createId(),
      startYear: gapYear,
      endYear: gapYear,
      annualWorkIncome: 0
    });

    if (segment.endYear > gapYear) {
      next.push({
        ...segment,
        id: createId(),
        startYear: gapYear + 1
      });
    }
  });
  return next;
};

const buildDefaultScenarios = (inputs: GlobalInputs): Scenario[] => {
  const expenseScale =
    defaultInputs.retirementSpending > 0
      ? inputs.retirementSpending / defaultInputs.retirementSpending
      : 1;
  const incomeScale =
    defaultInputs.currentYearIncome > 0
      ? inputs.currentYearIncome / defaultInputs.currentYearIncome
      : 1;
  const scaledDefaults = defaultScenarios.map((scenario) => ({
    ...scenario,
    segments: scenario.segments.map((segment) => ({
      ...segment,
      annualWorkIncome: Math.round(segment.annualWorkIncome * incomeScale),
      annualExpenses: Math.round(segment.annualExpenses * expenseScale)
    }))
  }));
  const baseline = scaledDefaults.find((scenario) => scenario.id === "baseline") ?? scaledDefaults[0];
  const baseResult = computeScenario(inputs, baseline);
  const baseKpis = computeKpis(inputs, baseResult.rows);
  const earliestSabbaticalYear = baseKpis.earliestSabbaticalYear ?? 1;
  const coastYear = baseKpis.yearsToCoast ?? 1;
  const gapYear = Math.max(1, earliestSabbaticalYear + 1, coastYear + 1);
  const clampedGapYear = Math.min(inputs.projectionYears, gapYear);

  return scaledDefaults.map((scenario) => {
    if (scenario.id !== "sabbatical") return scenario;
    return {
      ...scenario,
      description: `Take year ${clampedGapYear} off, then return to your prior income afterward.`,
      segments: buildGapYearSegments(baseline.segments, clampedGapYear)
    };
  });
};

export default function HomePage() {
  const [inputs, setInputs] = useState<GlobalInputs>(defaultInputs);
  const [scenarios, setScenarios] = useState<Scenario[]>(() => buildDefaultScenarios(defaultInputs));
  const [activeScenarioId, setActiveScenarioId] = useState<string>(defaultScenarios[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tableOpen, setTableOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(360);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isEditingScenario, setIsEditingScenario] = useState(false);
  const [showDetailedEdits, setShowDetailedEdits] = useState(false);
  const [simpleEditMode, setSimpleEditMode] = useState<"income" | "expenses">("income");
  const [simpleEditInflation, setSimpleEditInflation] = useState(false);
  const [simpleEditExpenseBase, setSimpleEditExpenseBase] = useState(inputs.retirementSpending);
  const [simpleEditExpenseBaseEdited, setSimpleEditExpenseBaseEdited] = useState(false);
  const [simpleEditReduceExpenses, setSimpleEditReduceExpenses] = useState(false);
  const [simpleEditExpenseRules, setSimpleEditExpenseRules] = useState<
    { id: string; startYear: number; expenseValue: number | null }[]
  >([]);
  const [scenarioMeta, setScenarioMeta] = useState<
    Record<string, { autoName: boolean; autoDescription: boolean }>
  >({});
  const [tableEdits, setTableEdits] = useState<Record<string, string>>({});
  const [dragFill, setDragFill] = useState<{
    field: "income" | "expenses";
    startYear: number;
    currentYear: number;
    value: number;
  } | null>(null);
  const [scenarioMenuOpen, setScenarioMenuOpen] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [bulkIncome, setBulkIncome] = useState(inputs.currentYearIncome);
  const [suggestion, setSuggestion] = useState({
    reduceStartYear: 3,
    reduceEndYear: 10,
    reduceMultiplier: 0.67,
    zeroIncomeAfterYear: 11
  });
  const prevInputsRef = useRef(inputs);

  useEffect(() => {
    const parsed = parseState(typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null);
    if (parsed && parsed.version === STORAGE_VERSION) {
      setInputs(parsed.inputs);
      setScenarios(parsed.scenarios);
      setActiveScenarioId(parsed.activeScenarioId);
      setBulkIncome(parsed.scenarios[0]?.segments[0]?.annualWorkIncome ?? parsed.inputs.currentYearIncome);
    }
  }, []);

  useEffect(() => {
    const prevInputs = prevInputsRef.current;
    if (prevInputs.retirementSpending === inputs.retirementSpending) return;
    const prevDefaults = buildDefaultScenarios(prevInputs);
    const nextDefaults = buildDefaultScenarios(inputs);
    setScenarios((prev) =>
      prev.map((scenario) => {
        const prevDefault = prevDefaults.find((candidate) => candidate.id === scenario.id);
        const nextDefault = nextDefaults.find((candidate) => candidate.id === scenario.id);
        if (!prevDefault || !nextDefault) return scenario;
        if (!segmentsMatch(scenario.segments, prevDefault.segments)) return scenario;
        return { ...scenario, segments: nextDefault.segments, description: nextDefault.description };
      })
    );
  }, [inputs.retirementSpending]);

  useEffect(() => {
    const prevInputs = prevInputsRef.current;
    if (prevInputs.currentYearIncome === inputs.currentYearIncome) return;
    const prevDefaults = buildDefaultScenarios(prevInputs);
    const nextDefaults = buildDefaultScenarios(inputs);
    setScenarios((prev) =>
      prev.map((scenario) => {
        const prevDefault = prevDefaults.find((candidate) => candidate.id === scenario.id);
        const nextDefault = nextDefaults.find((candidate) => candidate.id === scenario.id);
        if (!prevDefault || !nextDefault) return scenario;
        if (!segmentsMatch(scenario.segments, prevDefault.segments)) return scenario;
        return { ...scenario, segments: nextDefault.segments, description: nextDefault.description };
      })
    );
  }, [inputs.currentYearIncome]);

  useEffect(() => {
    prevInputsRef.current = inputs;
  }, [inputs]);

  useEffect(() => {
    const payload = toPersistedState(STORAGE_VERSION, inputs, scenarios, activeScenarioId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [inputs, scenarios, activeScenarioId]);

  const activeScenario = useMemo(
    () => scenarios.find((scenario) => scenario.id === activeScenarioId) ?? scenarios[0],
    [scenarios, activeScenarioId]
  );
  const baselineScenario = useMemo(
    () => scenarios.find((scenario) => scenario.id === "baseline") ?? scenarios[0] ?? activeScenario,
    [scenarios, activeScenario]
  );
  const isBaselineScenario = baselineScenario?.id === activeScenario?.id;

  useEffect(() => {
    const nextScenario = scenarios.find((scenario) => scenario.id === activeScenarioId) ?? scenarios[0];
    setBulkIncome(nextScenario?.segments[0]?.annualWorkIncome ?? inputs.currentYearIncome);
  }, [activeScenarioId, inputs.currentYearIncome, scenarios]);

  useEffect(() => {
    if (isBaselineScenario) {
      setShowComparison(false);
    }
  }, [isBaselineScenario]);

  useEffect(() => {
    if (!scenarioMenuOpen) return;
    const handleClose = () => setScenarioMenuOpen(false);
    document.addEventListener("click", handleClose);
    return () => document.removeEventListener("click", handleClose);
  }, [scenarioMenuOpen]);

  useEffect(() => {
    if (!isEditingScenario) return;
    setShowDetailedEdits(false);
  }, [isEditingScenario]);

  useEffect(() => {
    if (simpleEditExpenseBaseEdited) return;
    setSimpleEditExpenseBase(inputs.retirementSpending);
  }, [inputs.retirementSpending, simpleEditExpenseBaseEdited]);

  useEffect(() => {
    if (!isEditingScenario) return;
    setTableEdits({});
  }, [activeScenarioId, isEditingScenario]);

  useEffect(() => {
    if (!dragFill) return;
    const handleMouseUp = () => {
      const start = Math.min(dragFill.startYear, dragFill.currentYear);
      const end = Math.max(dragFill.startYear, dragFill.currentYear);
      for (let year = start; year <= end; year += 1) {
        handleUpdateSegmentAtYear(
          activeScenario.id,
          year,
          dragFill.field === "income"
            ? { annualWorkIncome: dragFill.value }
            : { annualExpenses: dragFill.value }
        );
      }
      setTableEdits((prev) => {
        const next = { ...prev };
        for (let year = start; year <= end; year += 1) {
          const key = `${year}-${dragFill.field}`;
          delete next[key];
        }
        return next;
      });
      setDragFill(null);
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [activeScenario.id, dragFill]);

  useEffect(() => {
    if (!isResizingSidebar) return;
    const handleMouseMove = (event: MouseEvent) => {
      const nextWidth = Math.max(220, Math.min(440, event.clientX));
      setSidebarWidth(nextWidth);
    };
    const handleMouseUp = () => setIsResizingSidebar(false);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizingSidebar]);

  const scenarioResult = useMemo(
    () => computeScenario(inputs, activeScenario),
    [inputs, activeScenario]
  );
  const baselineResult = useMemo(
    () => computeScenario(inputs, baselineScenario),
    [inputs, baselineScenario]
  );

  const normalizedSuggestion = useMemo(() => {
    const maxYear = Math.max(1, inputs.projectionYears);
    const reduceStartYear = Math.max(1, Math.min(maxYear, Math.round(suggestion.reduceStartYear)));
    const reduceEndYear = Math.max(reduceStartYear, Math.min(maxYear, Math.round(suggestion.reduceEndYear)));
    const zeroIncomeAfterYear = Math.max(
      1,
      Math.min(maxYear + 1, Math.round(suggestion.zeroIncomeAfterYear))
    );
    const reduceMultiplier = Math.min(1, Math.max(0, suggestion.reduceMultiplier));

    return {
      reduceStartYear,
      reduceEndYear,
      reduceMultiplier,
      zeroIncomeAfterYear
    };
  }, [inputs.projectionYears, suggestion]);

  useEffect(() => {
    if (!simpleEditReduceExpenses) return;
    if (simpleEditExpenseRules.length > 0) return;
    setSimpleEditExpenseRules([
      {
        id: createId(),
        startYear: normalizedSuggestion.reduceStartYear,
        expenseValue: null
      }
    ]);
  }, [
    normalizedSuggestion.reduceStartYear,
    simpleEditExpenseBase,
    simpleEditExpenseRules.length,
    simpleEditReduceExpenses
  ]);

  useEffect(() => {
    if (simpleEditReduceExpenses) return;
    if (simpleEditExpenseRules.length === 0) return;
    setSimpleEditExpenseRules([]);
  }, [simpleEditReduceExpenses, simpleEditExpenseRules.length]);

  const suggestedRows = useMemo(() => {
    return scenarioResult.rows.map((row) => {
      let workIncome = row.workIncome;
      let expenses = row.expenses;
      const inRange =
        row.year >= normalizedSuggestion.reduceStartYear &&
        row.year <= normalizedSuggestion.reduceEndYear;

      if (simpleEditMode === "income") {
        workIncome = inputs.currentYearIncome;
        if (inRange) {
          workIncome = Math.round(workIncome * normalizedSuggestion.reduceMultiplier);
        }
        if (row.year >= normalizedSuggestion.zeroIncomeAfterYear) {
          workIncome = 0;
        }
      } else {
        const baseExpenses = Number.isFinite(simpleEditExpenseBase)
          ? simpleEditExpenseBase
          : inputs.retirementSpending;
        const sortedRules = simpleEditReduceExpenses
          ? [...simpleEditExpenseRules].sort((a, b) => a.startYear - b.startYear)
          : [];
        const activeRule = sortedRules
          .filter((rule) => rule.startYear <= row.year)
          .slice(-1)[0];
        const ruleBaseYear = activeRule?.startYear ?? 1;
        const ruleBaseValue =
          typeof activeRule?.expenseValue === "number" ? activeRule.expenseValue : baseExpenses;
        const inflationFactor = simpleEditInflation
          ? Math.pow(1 + inputs.inflation, Math.max(0, row.year - ruleBaseYear))
          : 1;
        expenses = Math.round(ruleBaseValue * inflationFactor);
      }

      return { ...row, workIncome, expenses };
    });
  }, [
    normalizedSuggestion,
    scenarioResult.rows,
    simpleEditMode,
    inputs.currentYearIncome,
    inputs.retirementSpending,
    inputs.inflation,
    simpleEditInflation,
    simpleEditExpenseBase,
    simpleEditReduceExpenses,
    simpleEditExpenseRules
  ]);

  const suggestedScenarioName = useMemo(() => {
    const percent = Math.round(normalizedSuggestion.reduceMultiplier * 100);
    const label = simpleEditMode === "income" ? "Income" : "Expenses";
    const range =
      simpleEditMode === "income"
        ? `${normalizedSuggestion.reduceStartYear}-${normalizedSuggestion.reduceEndYear}`
        : `after ${normalizedSuggestion.reduceStartYear}`;
    if (simpleEditMode === "expenses") {
      const inflationLabel = simpleEditInflation ? " (inflation)" : "";
      const reductionLabel = simpleEditReduceExpenses ? " + reductions" : "";
      return `${label}${inflationLabel} ${range}${reductionLabel}`;
    }
    return `${label} ${range} @ ${percent}% + 0 after ${normalizedSuggestion.zeroIncomeAfterYear}`;
  }, [normalizedSuggestion, simpleEditMode, simpleEditInflation, simpleEditReduceExpenses]);

  const kpis = useMemo(() => computeKpis(inputs, scenarioResult.rows), [inputs, scenarioResult.rows]);
  const baselineKpis = useMemo(
    () => computeKpis(inputs, baselineResult.rows),
    [inputs, baselineResult.rows]
  );

  const segmentIssues = useMemo(
    () => getSegmentIssues(activeScenario.segments),
    [activeScenario.segments]
  );

  const enoughNumber = useMemo(() => getEnoughNumber(inputs), [inputs]);
  const securityNumberNow = useMemo(() => getSecurityNumberAtYear(inputs, 1), [inputs]);

  const deltaYearsToEnough =
    kpis.yearsToEnough !== null && baselineKpis.yearsToEnough !== null
      ? kpis.yearsToEnough - baselineKpis.yearsToEnough
      : null;
  const deltaYearsToCoast =
    kpis.yearsToCoast !== null && baselineKpis.yearsToCoast !== null
      ? kpis.yearsToCoast - baselineKpis.yearsToCoast
      : null;
  const deltaRetirementNetWorth =
    kpis.retirementNetWorth !== null && baselineKpis.retirementNetWorth !== null
      ? kpis.retirementNetWorth - baselineKpis.retirementNetWorth
      : null;

  const tradeoffSummary = useMemo(() => {
    if (isBaselineScenario) {
      return "This is the default balance of time and money.";
    }
    
    const baselineRows = baselineResult.rows;
    const scenarioRows = scenarioResult.rows;
    
    // Calculate more context
    const totalIncomeChange = scenarioRows.reduce((sum, row, idx) => 
      sum + (row.workIncome - (baselineRows[idx]?.workIncome ?? 0)), 0);
    const totalExpenseChange = scenarioRows.reduce((sum, row, idx) => 
      sum + (row.expenses - (baselineRows[idx]?.expenses ?? 0)), 0);
    const yearOff = scenarioRows.find((row, index) => {
      const baselineRow = baselineRows[index];
      // Only consider it a "year off" if it's before retirement and income goes to 0
      return row.year < inputs.yearsUntilRetirement && 
             row.workIncome === 0 && 
             baselineRow?.workIncome > 0;
    })?.year;
    
    // Priority 1: "Enough to quit" timing changes
    if (deltaYearsToEnough !== null && deltaYearsToEnough !== 0) {
      const timeLabel = `${Math.abs(deltaYearsToEnough)} year${
        Math.abs(deltaYearsToEnough) === 1 ? "" : "s"
      }`;
      const yearLabel = yearOff ? (yearOff === 1 ? "this year" : `year ${yearOff}`) : null;
      
      if (deltaYearsToEnough > 0) {
        // Takes longer - explain what flexibility you gain
        if (yearOff) {
          return `You reach enough to quit ${timeLabel} later but you take ${yearLabel} off, and you gain time to reset now while building toward independence.`;
        }
        return `You reach enough to quit ${timeLabel} later, and you gain room to reduce income, shift what you work on, or take a reset to focus on yourself and purpose.`;
      } else {
        // Faster - explain what you did to get there
        if (yearOff) {
          return `You reach enough to quit ${timeLabel} sooner even with taking ${yearLabel} off, and you gain both time now and financial independence sooner.`;
        } else if (totalIncomeChange > 0 && totalExpenseChange <= 0) {
          return `You reach enough to quit ${timeLabel} sooner by earning more while keeping expenses in check, and you gain a faster exit from required work.`;
        } else if (totalExpenseChange < 0 && totalIncomeChange <= 0) {
          return `You reach enough to quit ${timeLabel} sooner by spending less, and you gain both a faster path out and a sustainable lifestyle.`;
        }
        return `You reach enough to quit ${timeLabel} sooner, and you gain a shorter path to financial independence.`;
      }
    }
    
    // Priority 2: Coast/security timing changes (when "enough" timing is same)
    if (deltaYearsToCoast !== null && deltaYearsToCoast !== 0) {
      const timeLabel = `${Math.abs(deltaYearsToCoast)} year${
        Math.abs(deltaYearsToCoast) === 1 ? "" : "s"
      }`;
      const yearLabel = yearOff ? (yearOff === 1 ? "this year" : `year ${yearOff}`) : null;
      
      if (deltaYearsToCoast > 0) {
        if (yearOff) {
          return `You reach coast mode ${timeLabel} later but you take ${yearLabel} off, and you gain a sabbatical while maintaining your path to security.`;
        }
        return `You reach coast mode ${timeLabel} later, and you gain more flexibility in how you earn along the way.`;
      } else {
        if (yearOff) {
          return `You reach coast mode ${timeLabel} sooner even with taking ${yearLabel} off, and you gain both time now and security earlier.`;
        }
        return `You reach coast mode ${timeLabel} sooner, and you gain the security to take lower-paying meaningful work earlier.`;
      }
    }
    
    // Priority 3: Retirement net worth changes (when timing is same)
    if (deltaRetirementNetWorth !== null && deltaRetirementNetWorth !== 0) {
      const formatted = formatCurrency(Math.abs(deltaRetirementNetWorth));
      const yearLabel = yearOff ? (yearOff === 1 ? "this year" : `year ${yearOff}`) : null;
      
      if (deltaRetirementNetWorth < 0) {
        if (yearOff) {
          return `You end retirement with ${formatted} less due to taking ${yearLabel} off, and you gain meaningful experiences and rest when you need them most.`;
        }
        if (totalExpenseChange > 0) {
          return `You end retirement with ${formatted} less, and you gain a higher quality of life during working years.`;
        }
        return `You end retirement with ${formatted} less, and you gain more room to breathe now.`;
      } else {
        if (totalIncomeChange > 0) {
          return `You end retirement with ${formatted} more from higher earnings, and you gain a bigger cushion for unexpected costs or legacy goals.`;
        }
        return `You end retirement with ${formatted} more, and you gain a bigger cushion later.`;
      }
    }
    
    // Priority 4: Year off (when other metrics same)
    if (yearOff) {
      const yearLabel = yearOff === 1 ? "this year" : `year ${yearOff}`;
      return `You take ${yearLabel} off, and you gain time to reset, explore, or focus on what matters beyond work.`;
    }
    
    // Fallback: Describe the change pattern
    return "This scenario gives you a different mix of work and spending choices while tracking similar financial outcomes.";
  }, [
    baselineResult.rows,
    deltaRetirementNetWorth,
    deltaYearsToEnough,
    deltaYearsToCoast,
    isBaselineScenario,
    scenarioResult.rows,
    inputs.yearsUntilRetirement
  ]);

  const comparisonNarrative = useMemo(() => {
    if (isBaselineScenario) return null;
    if (!showComparison) return null;
    return null;
  }, [isBaselineScenario, showComparison]);

  const handleReset = () => {
    setInputs(defaultInputs);
    const nextScenarios = buildDefaultScenarios(defaultInputs);
    setScenarios(nextScenarios);
    setActiveScenarioId(nextScenarios[0]?.id ?? defaultScenarios[0].id);
    setScenarioMeta({});
    setIsEditingScenario(false);
  };

  const handleAddScenario = () => {
    const newScenario: Scenario = {
      id: createId(),
      name: "New Scenario",
      description: "",
      segments: [
        {
          id: createId(),
          startYear: 1,
          endYear: Math.max(1, inputs.projectionYears),
          annualWorkIncome: inputs.currentYearIncome,
          annualExpenses: inputs.retirementSpending
        }
      ]
    };
    newScenario.description = describeSegments(newScenario.segments);
    setScenarioMeta((prev) => ({
      ...prev,
      [newScenario.id]: { autoName: true, autoDescription: true }
    }));
    setScenarios((prev) => [...prev, newScenario]);
    setActiveScenarioId(newScenario.id);
    setIsEditingScenario(true);
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
    setScenarioMeta((prev) => ({
      ...prev,
      [id]: { autoName: false, autoDescription: prev[id]?.autoDescription ?? false }
    }));
  };

  const handleUpdateScenario = (id: string, patch: Partial<Scenario>) => {
    setScenarios((prev) =>
      prev.map((scenario) => (scenario.id === id ? { ...scenario, ...patch } : scenario))
    );
    if (typeof patch.description === "string") {
      setScenarioMeta((prev) => ({
        ...prev,
        [id]: { autoName: prev[id]?.autoName ?? false, autoDescription: false }
      }));
    }
  };

  const handleUpdateSegment = (scenarioId: string, segmentId: string, patch: Partial<Segment>) => {
    setScenarios((prev) =>
      prev.map((scenario) => {
        if (scenario.id !== scenarioId) return scenario;
        const nextScenario = {
          ...scenario,
          segments: scenario.segments.map((segment) =>
            segment.id === segmentId ? { ...segment, ...patch } : segment
          )
        };
        if (scenarioMeta[scenarioId]?.autoDescription) {
          return { ...nextScenario, description: describeSegments(nextScenario.segments) };
        }
        return nextScenario;
      })
    );
  };

  const handleUpdateSegmentAtYear = (scenarioId: string, year: number, patch: Partial<Segment>) => {
    setScenarios((prev) =>
      prev.map((scenario) => {
        if (scenario.id !== scenarioId) return scenario;
        const target = scenario.segments.find(
          (segment) => year >= segment.startYear && year <= segment.endYear
        );
        if (!target) return scenario;
        const hasChanges = Object.entries(patch).some(
          ([key, value]) => target[key as keyof Segment] !== value
        );
        if (!hasChanges) return scenario;

        const buildMiddle = () => ({
          ...target,
          ...patch,
          id: createId(),
          startYear: year,
          endYear: year
        });

        const updatedSegments = scenario.segments.flatMap((segment) => {
          if (segment.id !== target.id) return [segment];
          if (segment.startYear === year && segment.endYear === year) {
            return [
              {
                ...segment,
                ...patch
              }
            ];
          }
          const next: Segment[] = [];
          if (segment.startYear < year) {
            next.push({
              ...segment,
              id: createId(),
              endYear: year - 1
            });
          }
          next.push(buildMiddle());
          if (segment.endYear > year) {
            next.push({
              ...segment,
              id: createId(),
              startYear: year + 1
            });
          }
          return next;
        });

        const nextScenario = {
          ...scenario,
          segments: updatedSegments
        };
        if (scenarioMeta[scenarioId]?.autoDescription) {
          return { ...nextScenario, description: describeSegments(nextScenario.segments) };
        }
        return nextScenario;
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
          annualWorkIncome: Number.isFinite(bulkIncome) ? bulkIncome : inputs.currentYearIncome,
          annualExpenses: inputs.retirementSpending
        };
        const nextScenario = { ...scenario, segments: [...scenario.segments, newSegment] };
        if (scenarioMeta[scenarioId]?.autoDescription) {
          return { ...nextScenario, description: describeSegments(nextScenario.segments) };
        }
        return nextScenario;
      })
    );
  };

  const handleRemoveSegment = (scenarioId: string, segmentId: string) => {
    setScenarios((prev) =>
      prev.map((scenario) => {
        if (scenario.id !== scenarioId) return scenario;
        const nextScenario = {
          ...scenario,
          segments: scenario.segments.filter((segment) => segment.id !== segmentId)
        };
        if (scenarioMeta[scenarioId]?.autoDescription) {
          return { ...nextScenario, description: describeSegments(nextScenario.segments) };
        }
        return nextScenario;
      })
    );
  };

  const rowsToSegments = (rows: typeof scenarioResult.rows): Segment[] => {
    if (rows.length === 0) return [];
    const segments: Segment[] = [];
    let current = {
      startYear: rows[0].year,
      endYear: rows[0].year,
      annualWorkIncome: rows[0].workIncome,
      annualExpenses: rows[0].expenses
    };

    rows.slice(1).forEach((row) => {
      if (row.workIncome === current.annualWorkIncome && row.expenses === current.annualExpenses) {
        current.endYear = row.year;
      } else {
        segments.push({ id: createId(), ...current });
        current = {
          startYear: row.year,
          endYear: row.year,
          annualWorkIncome: row.workIncome,
          annualExpenses: row.expenses
        };
      }
    });
    segments.push({ id: createId(), ...current });
    return segments;
  };

  const handleCreateSuggestedScenario = () => {
    const segments = rowsToSegments(suggestedRows);
    const newScenario: Scenario = {
      id: createId(),
      name: suggestedScenarioName,
      description: "",
      segments
    };
    newScenario.description = describeSegments(newScenario.segments);
    setScenarioMeta((prev) => ({
      ...prev,
      [newScenario.id]: { autoName: true, autoDescription: true }
    }));

    setScenarios((prev) => [...prev, newScenario]);
    setActiveScenarioId(newScenario.id);
    setIsEditingScenario(true);
  };

  return (
    <>
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 text-slate-900">
      <header className="border-b border-slate-200/40 px-6 pt-16 pb-7">
        <div className="mx-auto w-full max-w-6xl flex flex-col items-center gap-5 text-center">
          <div className="flex w-full flex-col items-center gap-6">
            <div className="flex w-full max-w-3xl flex-col items-center gap-8">
              <div className="relative inline-block w-fit mb-4">
                <div
                  className="absolute inset-[-7px] z-[1] rounded-full"
                  style={{
                    backgroundImage: `conic-gradient(from 180deg at 50% 50%, #ebf6f2 0deg, #e7f3e0 18.3deg, #e5eff8 118.8deg, #fef1d8 176.4deg, #f7f4fa 237.6deg, #f7dbe5 295.2deg, #ebf6f2 360deg)`,
                    opacity: 0.8,
                    filter: "blur(5px)",
                    transform: "translateZ(0)",
                    WebkitTransform: "translateZ(0)"
                  }}
                />
                <span
                  className="relative z-[2] inline-block rounded-full border-2 border-white/90 bg-[#f7f7f799] px-3 py-1 text-[11px] font-semibold tracking-wide text-slate-700 whitespace-nowrap"
                >
                  👋 Heyo! I'm a financial calculator
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <h1 className="font-domine text-4xl font-semibold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent sm:text-5xl leading-tight pb-2">
                  When can I quit my job
                </h1>
                <p className="mx-auto max-w-md text-sm text-slate-600 sm:text-base">
                  Money won't make you happy. But not having enough is exhausting. Find out when you can stop grinding and start choosing how you spend your time.
                </p>
              </div>
              <div className="-mt-3 mb-6 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold">
                <a
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-2 text-white shadow-md transition hover:from-slate-800 hover:to-slate-700 hover:shadow-lg"
                  href="#inputs"
                >
                  Run the numbers
                  <svg 
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div
            id="story"
            className="grid gap-6 rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white/80 to-blue-50/40 px-6 py-5 text-xs text-slate-600 shadow-sm sm:grid-cols-3"
          >
            <div className="p-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Survive</p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">1. Cover the basics</p>
              <p className="mt-1">Rent, food, healthcare. The stuff that keeps you alive and not panicking about next month.</p>
            </div>
            <div className="p-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Coast</p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-600">2. Stop the grind</p>
              <p className="mt-1">Your money grows itself to retirement. You can shift to work you actually enjoy, even if it pays less.</p>
            </div>
            <div className="p-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Quit</p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-purple-600">3. Work becomes optional</p>
              <p className="mt-1">You decide what Tuesday looks like. Time with people you love. Purpose over paycheck.</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white/60 px-3 py-2 text-slate-600">
              <span className="text-slate-400">Made by</span>
              <a href="https://ashlyn.app" target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-600 hover:text-emerald-700">
                ashlyn.app
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <div
          id="inputs"
          className={`fixed inset-y-0 left-0 z-20 transform bg-white transition-all duration-300 ease-in-out md:sticky md:top-0 md:h-screen md:shrink-0 md:overflow-hidden ${
            sidebarOpen ? "w-full translate-x-0 shadow-lg md:shadow-none" : "w-10 translate-x-0 md:w-10"
          }`}
          style={
            sidebarOpen
              ? { width: `clamp(240px, ${sidebarWidth}px, 480px)` }
              : undefined
          }
        >
          {sidebarOpen ? (
            <Sidebar
              inputs={inputs}
              isOpen={sidebarOpen}
              onToggleOpen={() => setSidebarOpen((prev) => !prev)}
              onUpdateInputs={setInputs}
              onReset={handleReset}
            />
          ) : (
            <div className="flex h-full items-start justify-center bg-slate-50 pl-6 pr-5 pt-4 transition-opacity duration-300 ease-in-out">
              <button
                className="rounded-md border border-slate-200 bg-white px-2 py-2 pl-3 text-slate-500 transition -translate-x-2 hover:border-slate-300 hover:text-slate-900"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M7.22 15.78a.75.75 0 0 1 0-1.06L11.44 10 7.22 5.78a.75.75 0 1 1 1.06-1.06l4.75 4.75c.3.3.3.77 0 1.06l-4.75 4.75a.75.75 0 0 1-1.06 0Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          )}
          {sidebarOpen && (
            <div
              className="absolute right-0 top-0 hidden h-full w-1 cursor-col-resize bg-transparent hover:bg-slate-200 md:block"
              role="separator"
              aria-label="Resize sidebar"
              onMouseDown={() => setIsResizingSidebar(true)}
            />
          )}
        </div>

        <main className="min-w-0 flex-1 p-6">
          <div className="mx-auto w-full max-w-6xl">
            <div className="space-y-6">
              <section className="card" id="results">
              <div className="px-5 pt-6 pb-3">
                <p className="text-sm font-semibold text-slate-700">
                  Select Your Flavor
                </p>
                <p className="mt-1 text-sm text-slate-500 mb-4">
                  Switch scenarios to see how the projections change.
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                {scenarios.map((scenario) => (
                  <div key={scenario.id} className="group relative inline-flex items-center">
                    <button
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 ease-out group-hover:pr-9 group-focus-within:pr-9 ${
                        scenario.id === activeScenarioId
                          ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                      onClick={() => setActiveScenarioId(scenario.id)}
                    >
                      {scenario.name}
                    </button>
                    <button
                      type="button"
                      className={`pointer-events-none absolute right-1 top-1/2 inline-flex h-5 w-5 -translate-y-1/2 translate-x-1 scale-95 items-center justify-center rounded-full opacity-0 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-x-0 group-focus-within:scale-100 group-focus-within:pointer-events-auto ${
                        scenario.id === activeScenarioId
                          ? "text-white/70 hover:bg-white/20 hover:text-white"
                          : "text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                      }`}
                      aria-label={`Edit ${scenario.name}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        setActiveScenarioId(scenario.id);
                        setIsEditingScenario(true);
                      }}
                    >
                      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25ZM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0L15.13 4.1l3.75 3.75 1.83-1.81Z" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  className="rounded-full border border-dashed border-slate-300 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:border-slate-400 hover:text-slate-700"
                  onClick={handleAddScenario}
                >
                  + Create New Scenario
                </button>
                </div>
              </div>
              <div className="px-5 pt-2 pb-4 border-b border-slate-200/60">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-3">
                      <div>
                        <p className="text-base font-semibold text-slate-900">
                          {activeScenario.name}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {activeScenario.description?.trim() ||
                            "Add a description to clarify this plan."}
                        </p>
                      </div>
                      <div className="rounded-lg border border-emerald-100 bg-emerald-50/40 px-3 py-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">
                          Key trade-off
                        </p>
                        <p className="mt-1 text-sm text-slate-700">{tradeoffSummary}</p>
                      </div>
                      {!isBaselineScenario && (
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                              showComparison
                                ? "bg-slate-900 text-white"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                            onClick={() => setShowComparison((prev) => !prev)}
                          >
                            {showComparison ? "Hide Comparison" : "Compare to Baseline"}
                          </button>
                          {showComparison && comparisonNarrative && (
                            <p className="text-xs text-slate-500">{comparisonNarrative}</p>
                          )}
                        </div>
                      )}
                      {showComparison && !isBaselineScenario && (
                        <div className="grid gap-2 sm:grid-cols-3">
                          <div className="rounded-lg border border-slate-100 bg-white px-3 py-2">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                              Years to Coast
                            </p>
                            <p
                              className={`mt-1 text-sm font-semibold ${
                                deltaYearsToCoast !== null && deltaYearsToCoast <= 0
                                  ? "text-emerald-600"
                                  : "text-amber-600"
                              }`}
                            >
                              {deltaYearsToCoast === null
                                ? "—"
                                : `${deltaYearsToCoast > 0 ? "+" : ""}${deltaYearsToCoast} yr`}
                            </p>
                          </div>
                          <div className="rounded-lg border border-slate-100 bg-white px-3 py-2">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                              Years to Quit
                            </p>
                            <p
                              className={`mt-1 text-sm font-semibold ${
                                deltaYearsToEnough !== null && deltaYearsToEnough <= 0
                                  ? "text-emerald-600"
                                  : "text-amber-600"
                              }`}
                            >
                              {deltaYearsToEnough === null
                                ? "—"
                                : `${deltaYearsToEnough > 0 ? "+" : ""}${deltaYearsToEnough} yr`}
                            </p>
                          </div>
                          <div className="rounded-lg border border-slate-100 bg-white px-3 py-2">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                              Retirement net worth
                            </p>
                            <p
                              className={`mt-1 text-sm font-semibold ${
                                deltaRetirementNetWorth !== null && deltaRetirementNetWorth >= 0
                                  ? "text-emerald-600"
                                  : "text-amber-600"
                              }`}
                            >
                              {deltaRetirementNetWorth === null
                                ? "—"
                                : `${deltaRetirementNetWorth > 0 ? "+" : "-"}${formatCurrency(
                                    Math.abs(deltaRetirementNetWorth)
                                  )}`}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <button
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                        aria-label={`Scenario options for ${activeScenario.name}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          setScenarioMenuOpen((prev) => !prev);
                        }}
                      >
                        ⋯
                      </button>
                      {scenarioMenuOpen && (
                        <div
                          className="absolute right-0 z-10 mt-2 w-40 rounded-lg border border-slate-200 bg-white p-1 text-xs text-slate-600 shadow-lg"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <button
                            className="w-full rounded-md px-3 py-2 text-left hover:bg-slate-50"
                            onClick={() => {
                              setIsEditingScenario(true);
                              setScenarioMenuOpen(false);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className={`w-full rounded-md px-3 py-2 text-left ${
                              scenarios.length <= 1
                                ? "cursor-not-allowed text-slate-300"
                                : "text-red-600 hover:bg-red-50"
                            }`}
                            disabled={scenarios.length <= 1}
                            onClick={() => {
                              if (scenarios.length <= 1) return;
                              handleRemoveScenario(activeScenario.id);
                              setScenarioMenuOpen(false);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3 px-5 py-5">
                <KpiCards kpis={kpis} enoughNumber={enoughNumber} inputs={inputs} />
                {kpis.bridgeGapYears !== null && kpis.bridgeGapYears > 0 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs text-amber-800">
                    Your accessible savings run out about {kpis.bridgeGapYears}{" "}
                    {kpis.bridgeGapYears === 1 ? "year" : "years"} before retirement accounts are
                    available. Consider adding bridge income or reducing expenses in that gap.
                  </div>
                )}
              </div>
              </section>
              <Charts rows={scenarioResult.rows} inputs={inputs} kpis={kpis} targetNumber={enoughNumber} />
              {tableOpen && <RowsTable rows={scenarioResult.rows} />}
            </div>
          </div>
        </main>
      </div>

      {isEditingScenario && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setIsEditingScenario(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-[min(1100px,95vw)] max-h-[92vh] overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {activeScenario.name === "New Scenario" ? "New Scenario" : "Edit Scenario"}
                </h3>
              </div>
              <button className="button" onClick={() => setIsEditingScenario(false)}>
                Close
              </button>
            </div>

            <div className="grid h-[calc(92vh-72px)] gap-6 overflow-y-auto p-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <div className="space-y-6">
                <p className="text-sm text-slate-500">
                  Tweak your income and expenses over time to see how it changes your forecast.
                </p>
                <div className="card">
                  <div className="space-y-6 px-5 py-5">
                    <div>
                      <label className="label">Scenario Name</label>
                      <input
                        className="input mb-4"
                        value={activeScenario.name}
                        onChange={(event) => handleRenameScenario(activeScenario.id, event.target.value)}
                      />
                      <label className="label">Description</label>
                      <textarea
                        className="input min-h-[80px]"
                        value={activeScenario.description}
                        onChange={(event) =>
                          handleUpdateScenario(activeScenario.id, { description: event.target.value })
                        }
                        placeholder="Describe this scenario in plain English."
                      />
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="space-y-2 px-5 py-5 text-sm text-slate-600">
                    <h4 className="text-sm font-semibold text-slate-700">Simple Edit</h4>
                    <p className="text-xs text-slate-500">
                      Generate a new scenario by applying income changes across years. You can tweak after
                      creation.
                    </p>
                    <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-1 text-xs">
                      <button
                        type="button"
                        className={`rounded-full px-3 py-1 font-medium transition ${
                          simpleEditMode === "income"
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                        onClick={() => setSimpleEditMode("income")}
                      >
                        Income
                      </button>
                      <button
                        type="button"
                        className={`rounded-full px-3 py-1 font-medium transition ${
                          simpleEditMode === "expenses"
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                        onClick={() => setSimpleEditMode("expenses")}
                      >
                        Expenses
                      </button>
                    </div>
                    {simpleEditMode === "income" ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="label">Reduce Income Start</label>
                          <NumberInput
                            className="input"
                            min={1}
                            value={suggestion.reduceStartYear}
                            onChange={(value) => setSuggestion((prev) => ({ ...prev, reduceStartYear: value }))}
                          />
                        </div>
                        <div>
                          <label className="label">Reduce Income End</label>
                          <NumberInput
                            className="input"
                            min={1}
                            value={suggestion.reduceEndYear}
                            onChange={(value) => setSuggestion((prev) => ({ ...prev, reduceEndYear: value }))}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="label">Starting Annual Expenses</label>
                          <CurrencyInput
                            className="input"
                            min={0}
                            value={simpleEditExpenseBase}
                            onChange={(value) => {
                              setSimpleEditExpenseBase(value);
                              setSimpleEditExpenseBaseEdited(true);
                            }}
                          />
                        </div>
                        <div className="py-2">
                          <label className="flex items-center gap-2 text-xs text-slate-500">
                            <input
                              type="checkbox"
                              checked={simpleEditInflation}
                              onChange={(event) => setSimpleEditInflation(event.target.checked)}
                              className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                            />
                            Apply {formatPercent(inputs.inflation)} inflation to increase your expenses
                            over time
                          </label>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              className="group inline-flex items-center gap-2 text-left text-xs font-semibold text-slate-600 transition hover:text-slate-900"
                              onClick={() => setSimpleEditReduceExpenses((prev) => !prev)}
                            >
                              <svg
                                aria-hidden="true"
                                viewBox="0 0 20 20"
                                className={`h-3 w-3 text-slate-500 transition-transform group-hover:text-slate-700 ${
                                  simpleEditReduceExpenses ? "rotate-180" : ""
                                }`}
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.06l3.71-3.83a.75.75 0 1 1 1.08 1.04l-4.25 4.38a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06Z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Change expected expenses based on year
                            </button>
                            <button
                              type="button"
                              className="text-xs font-semibold text-slate-500 transition hover:text-slate-900"
                              onClick={() => setSimpleEditReduceExpenses((prev) => !prev)}
                            >
                              {simpleEditReduceExpenses ? "Hide" : "Add"}
                            </button>
                          </div>
                          <p className="mt-1 text-[11px] text-slate-400">
                            From the start year, your expense value is projected forward.
                          </p>
                          {simpleEditReduceExpenses && (
                            <div className="mt-3 space-y-3">
                              {simpleEditExpenseRules.map((rule, index) => (
                                <div key={rule.id} className="space-y-2">
                                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                    Rule {index + 1}
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="label">Start Year</label>
                                      <NumberInput
                                        className="input"
                                        min={1}
                                        value={rule.startYear}
                                        onChange={(value) =>
                                          setSimpleEditExpenseRules((prev) =>
                                            prev.map((entry) =>
                                              entry.id === rule.id
                                                ? { ...entry, startYear: value }
                                                : entry
                                            )
                                          )
                                        }
                                      />
                                    </div>
                                    <div>
                                      <label className="label">Expense Value</label>
                                      <CurrencyInput
                                        className="input"
                                        min={0}
                                        value={rule.expenseValue}
                                        placeholder="Enter amount"
                                        onChange={(value) =>
                                          setSimpleEditExpenseRules((prev) =>
                                            prev.map((entry) =>
                                              entry.id === rule.id
                                                ? { ...entry, expenseValue: value }
                                                : entry
                                            )
                                          )
                                        }
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {simpleEditExpenseRules.length > 0 && (
                                <button
                                  type="button"
                                  className="text-left text-xs font-semibold text-slate-500 transition hover:text-slate-900"
                                  onClick={() =>
                                    setSimpleEditExpenseRules((prev) => {
                                      const lastStart = prev[prev.length - 1]?.startYear ?? 1;
                                      return [
                                        ...prev,
                                        {
                                          id: createId(),
                                          startYear: lastStart + 1,
                                          expenseValue: null
                                        }
                                      ];
                                    })
                                  }
                                >
                                  + Add another rule
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                    {simpleEditMode === "income" && (
                      <PercentInput
                        label="Income Multiplier"
                        value={suggestion.reduceMultiplier}
                        onChange={(value) => setSuggestion((prev) => ({ ...prev, reduceMultiplier: value }))}
                        max={1}
                        step={0.01}
                      />
                    )}
                    {simpleEditMode === "income" && (
                      <div>
                        <label className="label">Zero Income After Year</label>
                        <NumberInput
                          className="input"
                          min={1}
                          value={suggestion.zeroIncomeAfterYear}
                          onChange={(value) => setSuggestion((prev) => ({ ...prev, zeroIncomeAfterYear: value }))}
                        />
                      </div>
                    )}
                    <button className="button button-primary w-full" onClick={handleCreateSuggestedScenario}>
                      Apply
                    </button>
                  </div>
                </div>

                {showDetailedEdits && (
                  <div className="card">
                    <div className="space-y-6 px-5 py-5">
                      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          Base Income
                        </p>
                        <div className="mt-2 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                          <div>
                            <label className="label">Base Annual Work Income</label>
                            <NumberInput
                              className="input"
                              value={bulkIncome}
                              onChange={setBulkIncome}
                            />
                          </div>
                          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                            <button
                              className="button w-full sm:w-auto"
                              onClick={() => setBulkIncome(inputs.currentYearIncome)}
                            >
                              Use Current Income
                            </button>
                            <button
                              className="button w-full sm:w-auto"
                              onClick={() =>
                                setScenarios((prev) =>
                                  prev.map((scenario) =>
                                    scenario.id === activeScenario.id
                                      ? {
                                          ...scenario,
                                          segments: scenario.segments.map((segment) => ({
                                            ...segment,
                                            annualWorkIncome: bulkIncome
                                          }))
                                        }
                                      : scenario
                                  )
                                )
                              }
                            >
                              Apply to All Segments
                            </button>
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          Sets the annual work income across every segment in this scenario.
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Segments</p>
                          <button
                            className="text-xs font-semibold text-slate-500 transition hover:text-slate-900"
                            onClick={() => handleAddSegment(activeScenario.id)}
                          >
                            + Add Segment
                          </button>
                        </div>

                        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                          Gaps default to zero income and retirement spending. Overlapping segments are not
                          allowed.
                        </div>
                      </div>

                      {segmentIssues.length > 0 && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                          {segmentIssues.map((issue) => (
                            <p key={issue}>{issue}</p>
                          ))}
                        </div>
                      )}

                      <div className="space-y-3">
                        {activeScenario.segments.map((segment) => (
                          <div key={segment.id} className="rounded-xl border border-slate-200 bg-white p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  Segment {segment.startYear}-{segment.endYear}
                                </p>
                                <p className="text-xs text-slate-500">
                                  Years {segment.startYear} through {segment.endYear}
                                </p>
                              </div>
                              <button
                                className="text-xs font-semibold text-slate-500 transition hover:text-red-600"
                                onClick={() => handleRemoveSegment(activeScenario.id, segment.id)}
                              >
                                Remove
                              </button>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-3">
                              <div>
                                <label className="label">Start Year</label>
                                <NumberInput
                                  className="input"
                                  min={1}
                                  value={segment.startYear}
                                  onChange={(value) =>
                                    handleUpdateSegment(activeScenario.id, segment.id, { startYear: value })
                                  }
                                />
                              </div>
                              <div>
                                <label className="label">End Year</label>
                                <NumberInput
                                  className="input"
                                  min={1}
                                  value={segment.endYear}
                                  onChange={(value) =>
                                    handleUpdateSegment(activeScenario.id, segment.id, { endYear: value })
                                  }
                                />
                              </div>
                              <div>
                                <label className="label">Annual Work Income</label>
                                <NumberInput
                                  className="input"
                                  value={segment.annualWorkIncome}
                                  onChange={(value) =>
                                    handleUpdateSegment(activeScenario.id, segment.id, {
                                      annualWorkIncome: value
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <label className="label">Annual Expenses</label>
                                <NumberInput
                                  className="input"
                                  value={segment.annualExpenses}
                                  onChange={(value) =>
                                    handleUpdateSegment(activeScenario.id, segment.id, { annualExpenses: value })
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="card flex h-full flex-col">
                <div className="px-5 pt-5">
                  <h4 className="text-sm font-semibold text-slate-700">Income & Spending Over Time</h4>
                  <p className="mt-1 text-xs text-slate-500">
                    Live view of how this scenario changes yearly income and expenses.
                  </p>
                </div>
                <div className="mt-4 flex-1 overflow-auto px-5 pb-5">
                  <div className="h-full rounded-lg border border-slate-200">
                    <table className="min-w-full text-left text-xs text-slate-600">
                      <thead className="sticky top-0 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
                        <tr>
                          <th className="px-3 py-2">Year</th>
                          <th className="px-3 py-2">Work Income</th>
                          <th className="px-3 py-2">Expenses</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scenarioResult.rows.map((row) => {
                          const coastYear = kpis.yearsToCoast ?? Number.POSITIVE_INFINITY;
                          const enoughYear = kpis.yearsToEnough ?? Number.POSITIVE_INFINITY;
                          const isCoastRange = row.year >= coastYear && row.year < enoughYear;
                          const isEnoughRange = row.year >= enoughYear;
                          const incomeKey = `${row.year}-income`;
                          const expensesKey = `${row.year}-expenses`;
                          const dragField = dragFill?.field;
                          const dragStart = dragFill?.startYear ?? row.year;
                          const dragCurrent = dragFill?.currentYear ?? row.year;
                          const dragMin = Math.min(dragStart, dragCurrent);
                          const dragMax = Math.max(dragStart, dragCurrent);
                          const isDragRange =
                            dragFill &&
                            row.year >= dragMin &&
                            row.year <= dragMax;
                          return (
                            <tr
                              key={row.year}
                              className={`border-b border-slate-100 ${
                                isEnoughRange
                                  ? "bg-emerald-50/60"
                                  : isCoastRange
                                    ? "bg-sky-50/70"
                                    : ""
                              }`}
                            >
                              <td className="px-3 py-2 font-medium text-slate-700">{row.year}</td>
                              <td className="px-3 py-2">
                                <div
                                  className={`fill-cell ${
                                    dragField === "income" && isDragRange ? "fill-cell-active" : ""
                                  }`}
                                  onMouseEnter={() =>
                                    dragFill?.field === "income" &&
                                    setDragFill((prev) =>
                                      prev ? { ...prev, currentYear: row.year } : prev
                                    )
                                  }
                                >
                                  <input
                                    className="w-full bg-transparent pr-4 text-right text-xs text-slate-700 focus:outline-none"
                                    inputMode="numeric"
                                    value={tableEdits[incomeKey] ?? String(row.workIncome)}
                                    onChange={(event) =>
                                      setTableEdits((prev) => ({
                                        ...prev,
                                        [incomeKey]: event.target.value
                                      }))
                                    }
                                    onBlur={() => {
                                      const raw = tableEdits[incomeKey] ?? String(row.workIncome);
                                      const parsed = Number(raw.replace(/,/g, ""));
                                      if (Number.isNaN(parsed)) {
                                        setTableEdits((prev) => {
                                          const next = { ...prev };
                                          delete next[incomeKey];
                                          return next;
                                        });
                                        return;
                                      }
                                      handleUpdateSegmentAtYear(activeScenario.id, row.year, {
                                        annualWorkIncome: parsed
                                      });
                                      setTableEdits((prev) => {
                                        const next = { ...prev };
                                        delete next[incomeKey];
                                        return next;
                                      });
                                    }}
                                    aria-label={`Work income for year ${row.year}`}
                                  />
                                  <button
                                    type="button"
                                    className="fill-handle"
                                    aria-label={`Fill work income from year ${row.year}`}
                                    onMouseDown={(event) => {
                                      event.preventDefault();
                                      const raw = tableEdits[incomeKey] ?? String(row.workIncome);
                                      const parsed = Number(raw.replace(/,/g, ""));
                                      if (Number.isNaN(parsed)) return;
                                      setDragFill({
                                        field: "income",
                                        startYear: row.year,
                                        currentYear: row.year,
                                        value: parsed
                                      });
                                    }}
                                  />
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <div
                                  className={`fill-cell ${
                                    dragField === "expenses" && isDragRange ? "fill-cell-active" : ""
                                  }`}
                                  onMouseEnter={() =>
                                    dragFill?.field === "expenses" &&
                                    setDragFill((prev) =>
                                      prev ? { ...prev, currentYear: row.year } : prev
                                    )
                                  }
                                >
                                  <input
                                    className="w-full bg-transparent pr-4 text-right text-xs text-slate-700 focus:outline-none"
                                    inputMode="numeric"
                                    value={tableEdits[expensesKey] ?? String(row.expenses)}
                                    onChange={(event) =>
                                      setTableEdits((prev) => ({
                                        ...prev,
                                        [expensesKey]: event.target.value
                                      }))
                                    }
                                    onBlur={() => {
                                      const raw = tableEdits[expensesKey] ?? String(row.expenses);
                                      const parsed = Number(raw.replace(/,/g, ""));
                                      if (Number.isNaN(parsed)) {
                                        setTableEdits((prev) => {
                                          const next = { ...prev };
                                          delete next[expensesKey];
                                          return next;
                                        });
                                        return;
                                      }
                                      handleUpdateSegmentAtYear(activeScenario.id, row.year, {
                                        annualExpenses: parsed
                                      });
                                      setTableEdits((prev) => {
                                        const next = { ...prev };
                                        delete next[expensesKey];
                                        return next;
                                      });
                                    }}
                                    aria-label={`Expenses for year ${row.year}`}
                                  />
                                  <button
                                    type="button"
                                    className="fill-handle"
                                    aria-label={`Fill expenses from year ${row.year}`}
                                    onMouseDown={(event) => {
                                      event.preventDefault();
                                      const raw = tableEdits[expensesKey] ?? String(row.expenses);
                                      const parsed = Number(raw.replace(/,/g, ""));
                                      if (Number.isNaN(parsed)) return;
                                      setDragFill({
                                        field: "expenses",
                                        startYear: row.year,
                                        currentYear: row.year,
                                        value: parsed
                                      });
                                    }}
                                  />
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    <Footer />
    </>
  );
}
