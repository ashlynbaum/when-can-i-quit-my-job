import type { GlobalInputs, Scenario } from "./model";

export const defaultInputs: GlobalInputs = {
  projectionYears: 45,
  yearsUntilRetirement: 25,
  startingTotalNW: 440_000,
  startingAccessibleNW: 12_000,
  nominalReturn: 0.07,
  inflation: 0.025,
  fees: 0.0002,
  safeWithdrawalRate: 0.04,
  retirementSpending: 100_000,
  restrictedSavingsRate: 0.12,
  currentYearIncome: 180_000
};

export const defaultScenarios: Scenario[] = [
  {
    id: "baseline",
    name: "Baseline - Stay the Course",
    description: "Current income until retirement. Expenses held at retirement spending throughout.",
    segments: [
      {
        id: "baseline-1",
        startYear: 1,
        endYear: 25,
        annualWorkIncome: 180_000,
        annualExpenses: 100_000
      },
      {
        id: "baseline-2",
        startYear: 26,
        endYear: 45,
        annualWorkIncome: 0,
        annualExpenses: 100_000
      }
    ]
  },
  {
    id: "sabbatical",
    name: "Take a Break",
    description: "Take year 3 off, then return to your prior income afterward.",
    segments: [
      {
        id: "sabbatical-1",
        startYear: 1,
        endYear: 2,
        annualWorkIncome: 180_000,
        annualExpenses: 100_000
      },
      {
        id: "sabbatical-2",
        startYear: 3,
        endYear: 3,
        annualWorkIncome: 0,
        annualExpenses: 100_000
      },
      {
        id: "sabbatical-3",
        startYear: 4,
        endYear: 25,
        annualWorkIncome: 180_000,
        annualExpenses: 100_000
      },
      {
        id: "sabbatical-4",
        startYear: 26,
        endYear: 45,
        annualWorkIncome: 0,
        annualExpenses: 100_000
      }
    ]
  },
  {
    id: "two-thirds",
    name: "Cruise",
    description: "Drop to part-time income after year 4, maintaining steady expenses.",
    segments: [
      {
        id: "twothirds-1",
        startYear: 1,
        endYear: 4,
        annualWorkIncome: 180_000,
        annualExpenses: 100_000
      },
      {
        id: "twothirds-2",
        startYear: 5,
        endYear: 25,
        annualWorkIncome: 120_000,
        annualExpenses: 100_000
      },
      {
        id: "twothirds-3",
        startYear: 26,
        endYear: 45,
        annualWorkIncome: 0,
        annualExpenses: 100_000
      }
    ]
  }
];
