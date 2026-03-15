import { z } from "zod";

// Validates required environment variables at startup and provides typed access.
// Missing required vars or invalid values will throw at boot time.
const EnvSchema = z.object({
  PORT: z.string().default("5000"),
  ALLOWER_ORIGIN: z.url().default("http://localhost:3000"),
  MODEL_PROVIDER: z.enum(["gemini", "groq"]).default("gemini"),
  GOOGLE_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
  GROQ_MODEL: z.string().default("llama-3.1-8b-instant"),
  SEARCH_PROVIDER: z.string().default("tavily"),
  TAVILY_API_KEY: z.string().optional(),
});

// Parse and validate process.env — throws if schema constraints are violated
export const env = EnvSchema.parse(process.env);
