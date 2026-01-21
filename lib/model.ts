export type Segment = {
  id: string;
  startYear: number;
  endYear: number;
  annualWorkIncome: number;
  annualExpenses: number;
};

export type Scenario = {
  id: string;
  name: string;
  segments: Segment[];
};

export type GlobalInputs = {
  projectionYears: number;
  yearsUntilRetirement: number;
  startingTotalNW: number;
  startingAccessibleNW: number;
  nominalReturn: number;
  inflation: number;
  fees: number;
  safeWithdrawalRate: number;
  retirementSpending: number;
  restrictedSavingsRate: number;
};

export type YearRow = {
  year: number;
  startTotalNW: number;
  startAccessibleNW: number;
  workIncome: number;
  expenses: number;
  savings: number;
  restrictedSavings: number;
  accessibleSavings: number;
  growthTotal: number;
  growthAccessible: number;
  withdrawalNeeded: number;
  endTotalNW: number;
  endAccessibleNW: number;
  capitalIncomeTotal: number;
  capitalIncomeAccessible: number;
  coastFireNumber: number;
};

export type ScenarioResult = {
  rows: YearRow[];
  issues: string[];
};

export type Kpis = {
  yearsToCoast: number | null;
  yearsToFire: number | null;
  earliestSabbaticalYear: number | null;
  accessibleRunwayYears: number | null;
  capitalCoverageAccessible: number | null;
};

type YearPlan = {
  workIncome: number;
  expenses: number;
  source: "segment" | "default";
};

export function getFireNumber(inputs: GlobalInputs): number {
  return inputs.retirementSpending / inputs.safeWithdrawalRate;
}

export function getRealReturn(inputs: GlobalInputs): number {
  return inputs.nominalReturn - inputs.inflation - inputs.fees;
}

export function getCoastFireNumberAtYear(inputs: GlobalInputs, year: number): number {
  const fireNumber = getFireNumber(inputs);
  const yearsRemaining = inputs.yearsUntilRetirement - year + 1;
  const realReturn = getRealReturn(inputs);
  if (yearsRemaining <= 0) return fireNumber;
  return fireNumber / Math.pow(1 + realReturn, yearsRemaining);
}

export function getSegmentIssues(segments: Segment[]): string[] {
  const issues: string[] = [];
  segments.forEach((segment) => {
    if (segment.startYear < 1 || segment.endYear < 1) {
      issues.push(`Segment "${segment.id}" must start at year 1 or later.`);
    }
    if (segment.startYear > segment.endYear) {
      issues.push(`Segment "${segment.id}" has start year after end year.`);
    }
  });

  const occupied = new Map<number, string>();
  const ordered = [...segments].sort((a, b) => a.startYear - b.startYear);
  ordered.forEach((segment) => {
    for (let year = segment.startYear; year <= segment.endYear; year += 1) {
      const prev = occupied.get(year);
      if (prev) {
        issues.push(
          `Year ${year} overlaps between segment "${prev}" and "${segment.id}".`
        );
      } else {
        occupied.set(year, segment.id);
      }
    }
  });
  return Array.from(new Set(issues));
}

export function buildYearPlans(
  inputs: GlobalInputs,
  segments: Segment[]
): { plans: YearPlan[]; issues: string[] } {
  const issues = getSegmentIssues(segments);
  const plans: YearPlan[] = Array.from({ length: inputs.projectionYears }).map(() => ({
    workIncome: 0,
    expenses: inputs.retirementSpending,
    source: "default"
  }));

  const ordered = [...segments].sort((a, b) => a.startYear - b.startYear);
  ordered.forEach((segment) => {
    for (let year = segment.startYear; year <= segment.endYear; year += 1) {
      if (year < 1 || year > inputs.projectionYears) continue;
      const idx = year - 1;
      if (plans[idx].source === "segment") continue;
      plans[idx] = {
        workIncome: segment.annualWorkIncome,
        expenses: segment.annualExpenses,
        source: "segment"
      };
    }
  });

  return { plans, issues };
}

export function computeScenario(inputs: GlobalInputs, scenario: Scenario): ScenarioResult {
  const { plans, issues } = buildYearPlans(inputs, scenario.segments);
  const rows: YearRow[] = [];
  let startTotalNW = inputs.startingTotalNW;
  let startAccessibleNW = inputs.startingAccessibleNW;

  for (let year = 1; year <= inputs.projectionYears; year += 1) {
    const plan = plans[year - 1];
    const workIncome = plan.workIncome;
    const expenses = plan.expenses;
    const savings = workIncome - expenses;
    const restrictedSavings =
      savings > 0 ? Math.min(savings, workIncome * inputs.restrictedSavingsRate) : 0;
    const accessibleSavings = savings - restrictedSavings;
    const growthTotal = startTotalNW * inputs.nominalReturn;
    const growthAccessible = startAccessibleNW * inputs.nominalReturn;
    const withdrawalNeeded = Math.max(0, -savings);
    const endTotalNW = startTotalNW + growthTotal + savings;
    const endAccessibleNW = startAccessibleNW + growthAccessible + accessibleSavings;
    const capitalIncomeTotal = startTotalNW * inputs.safeWithdrawalRate;
    const capitalIncomeAccessible = startAccessibleNW * inputs.safeWithdrawalRate;
    const coastFireNumber = getCoastFireNumberAtYear(inputs, year);

    rows.push({
      year,
      startTotalNW,
      startAccessibleNW,
      workIncome,
      expenses,
      savings,
      restrictedSavings,
      accessibleSavings,
      growthTotal,
      growthAccessible,
      withdrawalNeeded,
      endTotalNW,
      endAccessibleNW,
      capitalIncomeTotal,
      capitalIncomeAccessible,
      coastFireNumber
    });

    startTotalNW = endTotalNW;
    startAccessibleNW = endAccessibleNW;
  }

  return { rows, issues };
}

export function computeKpis(inputs: GlobalInputs, rows: YearRow[]): Kpis {
  const fireNumber = getFireNumber(inputs);
  const yearsToCoast = rows.find((row) => row.startTotalNW >= row.coastFireNumber)?.year ?? null;
  const yearsToFire = rows.find((row) => row.startTotalNW >= fireNumber)?.year ?? null;
  const earliestSabbaticalYear =
    rows.find((row) => row.startAccessibleNW >= row.expenses)?.year ?? null;
  const firstYear = rows[0];
  const accessibleRunwayYears =
    firstYear && firstYear.expenses > 0 ? firstYear.startAccessibleNW / firstYear.expenses : null;
  const capitalCoverageAccessible =
    firstYear && firstYear.expenses > 0
      ? (firstYear.startAccessibleNW * inputs.safeWithdrawalRate) / firstYear.expenses
      : null;

  return {
    yearsToCoast,
    yearsToFire,
    earliestSabbaticalYear,
    accessibleRunwayYears,
    capitalCoverageAccessible
  };
}
