import { z } from "zod";
import type { GlobalInputs, Scenario } from "./model";

export const segmentSchema = z.object({
  id: z.string(),
  startYear: z.number().int().positive(),
  endYear: z.number().int().positive(),
  annualWorkIncome: z.number(),
  annualExpenses: z.number()
});

export const scenarioSchema = z.object({
  id: z.string(),
  name: z.string(),
  segments: z.array(segmentSchema)
});

export const inputsSchema: z.ZodType<GlobalInputs> = z.object({
  projectionYears: z.number().int().positive(),
  yearsUntilRetirement: z.number().int().positive(),
  startingTotalNW: z.number(),
  startingAccessibleNW: z.number(),
  nominalReturn: z.number(),
  inflation: z.number(),
  fees: z.number(),
  safeWithdrawalRate: z.number(),
  retirementSpending: z.number(),
  restrictedSavingsRate: z.number()
});

export const appStateSchema = z.object({
  version: z.number(),
  inputs: inputsSchema,
  scenarios: z.array(scenarioSchema),
  activeScenarioId: z.string()
});

export type PersistedState = z.infer<typeof appStateSchema>;

export function parseState(raw: string | null): PersistedState | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    const parsed = appStateSchema.safeParse(data);
    if (!parsed.success) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

export function toPersistedState(
  version: number,
  inputs: GlobalInputs,
  scenarios: Scenario[],
  activeScenarioId: string
): PersistedState {
  return { version, inputs, scenarios, activeScenarioId };
}
