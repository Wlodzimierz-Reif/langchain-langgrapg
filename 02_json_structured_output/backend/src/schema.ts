import { z } from "zod";

// Structured response returned by the ask endpoint.
export const AskResultSchema = z.object({
  // Human-readable answer summary: 1 to 1000 characters.
  summary: z.string().min(1).max(1000),
  // Model confidence score constrained to the [0, 1] range.
  confidence: z.number().min(0).max(1),
});

// TypeScript type inferred from AskResultSchema.
export type AskResult = z.infer<typeof AskResultSchema>;
