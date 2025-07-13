import { z } from 'zod';

export const userDetailsInput = z.object({
  // age, income, number_of_dependents, risk_tolerance (high, medium, low)
  age: z.number().int().min(7),
  income: z.number().int().min(0),
  number_of_dependents: z.number().int().min(0),
  risk_tolerance: z.enum(['high', 'medium', 'low']),
});
