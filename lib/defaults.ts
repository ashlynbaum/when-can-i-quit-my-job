import type { GlobalInputs, Scenario } from "./model";

export const defaultInputs: GlobalInputs = {
  projectionYears: 40,
  yearsUntilRetirement: 19,
  startingTotalNW: 1_400_000,
  startingAccessibleNW: 900_000,
  nominalReturn: 0.07,
  inflation: 0.025,
  fees: 0.0002,
  safeWithdrawalRate: 0.04,
  retirementSpending: 180_000,
  restrictedSavingsRate: 0.1
};

export const defaultScenarios: Scenario[] = [
  {
    id: "baseline",
    name: "Baseline",
    segments: [
      {
        id: "baseline-1",
        startYear: 1,
        endYear: 2,
        annualWorkIncome: 403_000,
        annualExpenses: 216_000
      },
      {
        id: "baseline-2",
        startYear: 3,
        endYear: 8,
        annualWorkIncome: 403_000,
        annualExpenses: 204_000
      },
      {
        id: "baseline-3",
        startYear: 9,
        endYear: 11,
        annualWorkIncome: 403_000,
        annualExpenses: 180_000
      },
      {
        id: "baseline-4",
        startYear: 12,
        endYear: 40,
        annualWorkIncome: 0,
        annualExpenses: 180_000
      }
    ]
  },
  {
    id: "sabbatical",
    name: "Sabbatical Year 3",
    segments: [
      {
        id: "sabbatical-1",
        startYear: 1,
        endYear: 2,
        annualWorkIncome: 403_000,
        annualExpenses: 216_000
      },
      {
        id: "sabbatical-2",
        startYear: 3,
        endYear: 3,
        annualWorkIncome: 0,
        annualExpenses: 180_000
      },
      {
        id: "sabbatical-3",
        startYear: 4,
        endYear: 8,
        annualWorkIncome: 403_000,
        annualExpenses: 204_000
      },
      {
        id: "sabbatical-4",
        startYear: 9,
        endYear: 11,
        annualWorkIncome: 403_000,
        annualExpenses: 180_000
      },
      {
        id: "sabbatical-5",
        startYear: 12,
        endYear: 40,
        annualWorkIncome: 0,
        annualExpenses: 180_000
      }
    ]
  },
  {
    id: "two-thirds",
    name: "2/3 Income after Year 4",
    segments: [
      {
        id: "twothirds-1",
        startYear: 1,
        endYear: 2,
        annualWorkIncome: 403_000,
        annualExpenses: 216_000
      },
      {
        id: "twothirds-2",
        startYear: 3,
        endYear: 4,
        annualWorkIncome: 403_000,
        annualExpenses: 204_000
      },
      {
        id: "twothirds-3",
        startYear: 5,
        endYear: 11,
        annualWorkIncome: 268_667,
        annualExpenses: 204_000
      },
      {
        id: "twothirds-4",
        startYear: 12,
        endYear: 40,
        annualWorkIncome: 0,
        annualExpenses: 180_000
      }
    ]
  }
];
