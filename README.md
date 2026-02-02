# When Can I Quit My Job

Interactive, client‑side dashboard for modeling year‑by‑year FIRE scenarios, liquidity, and coast paths.
It helps you see when work becomes optional, how much runway you have in accessible assets, and what changes
move the timeline forward or backward. The goal is a simple, grounded view of trade‑offs: keep earning,
downshift to coast, take a break, or quit entirely.

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Build

```bash
npm run build
```

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Recharts
- zod (localStorage validation)

## Data Model

Each year uses **start‑of‑year balances** and **end‑of‑year contributions**:

- `savings = workIncome - expenses`
- `restrictedSavings = savings > 0 ? min(savings, workIncome * restrictedSavingsRate) : 0`
- `accessibleSavings = savings - restrictedSavings`
- `growthTotal = startTotalNW * nominalReturn`
- `growthAccessible = startAccessibleNW * nominalReturn`
- `withdrawalNeeded = max(0, -savings)`
- `endTotalNW = startTotalNW + growthTotal + savings`
- `endAccessibleNW = startAccessibleNW + growthAccessible + accessibleSavings`

Display‑only metrics:

- `capitalIncomeTotal = startTotalNW * safeWithdrawalRate`
- `capitalIncomeAccessible = startAccessibleNW * safeWithdrawalRate`

Assumptions:

- Savings are **end‑of‑year** contributions (no same‑year growth).
- Capital income is **display‑only** and does not change net worth.

## FIRE Metrics

- **FIRE Number** = `retirementSpending / safeWithdrawalRate`
- **Real Return** = `nominalReturn - inflation - fees`
- **Coast FIRE Number (year t)** = `FIRE Number / (1 + realReturn)^(yearsUntilRetirement - t + 1)`

KPI definitions:

- **Years to Coast**: first year where `startTotalNW >= coastFireNumberAtThatYear`
- **Years to Quit**: first year where `startTotalNW >= fireNumber`
- **Earliest Sabbatical (liquidity)**: first year where `startAccessibleNW >= expenses`
- **Accessible runway**: `startAccessibleNW / year1 expenses`
- **Capital coverage (accessible)**: `(startAccessibleNW * SWR) / year1 expenses`

## Scenarios and Segments

Scenarios are made of year segments with constant income/expenses:

- Segment fields: `startYear`, `endYear`, `annualWorkIncome`, `annualExpenses`
- Overlapping segments are flagged as invalid.
- Gaps are automatically filled with zero income and retirement spending.

Starter scenarios (auto-adjust with sidebar inputs):

1. **Baseline — Stay the Course**
2. **Take a Break** (sabbatical year placed after you can cover a year with accessible savings)
3. **Cruise** (drops to part‑time income after you reach coast)

## Persistence

State persists in `localStorage` (`financial-liquidity-dashboard:v2`) with schema validation.
Use the **Reset to Defaults** button to clear stored state.
