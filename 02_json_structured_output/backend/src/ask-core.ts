import { createChatModel } from "./lc-model";
import { AskResult, AskResultSchema } from "./schema";

// Sends a query to the Gemini model and returns a structured JSON response
// conforming to AskResultSchema (summary + confidence score).
export const askStructured = async (query: string): Promise<AskResult> => {
  // Initialise the LangChain chat model wrapper for Gemini
  const { model } = createChatModel("gemini", null);

  // keep instructions brief so that schema stays visible to the model
  const system = "You are a concise assistant. Return only the requested JSON";

  // Ask the model to summarise the query and rate its confidence
  const user = `Summarise for a beginner: \n "${query}" \n Return fields: summary(short paragraph), confidence(0..1)`;

  // Bind the Zod schema so LangChain enforces structured output parsing
  const structured = model.withStructuredOutput(AskResultSchema);

  // Invoke the model with a system + user turn
  const result = await structured.invoke([
    { role: "system", content: system },
    { role: "user", content: user },
  ]);

  return result;
};
