import { getChatModel } from "../shared/models";
import { SummarisedInputSchema, SummarisedOutputSchema } from "./schemas";
import { SystemMessage, HumanMessage } from "langchain";

export const summarise = async (text: string) => {
  const { text: raw } = SummarisedInputSchema.parse({ text });
  const clipped = clip(raw, 4000);

  const model = getChatModel({ temperature: 0.2 });

  // ask the model to summarise in a controlled manner

  const res = await model.invoke([
    new SystemMessage(
      [
        "You are a helpful assistant that writes short , accurate summarisess",
        "Guidlines:",
        "- Be factual and neutral, avoid marketing language",
        "- 5-8 sentences",
        "- no lists unless absolutely neccessary",
        "- Do NOT invent sources; you only summarise the provided text",
        "- Keep it readable for beginners",
      ].join("\n"),
    ),
    new HumanMessage(
      [
        "Summarise the following content for a beginner friendly audience.",
        "FOcus on key facts and remove fluff",
        "TEXT:",
        clipped,
      ].join("\n"),
    ),
  ]);

  const rawModelOutput =
    typeof res.content === "string" ? res.content : String(res.content);

  const summary = normaliseSummary(rawModelOutput);

  return SummarisedOutputSchema.parse({ summary });
};

const clip = (text: string, maxTokens: number) => {
  return text.length > maxTokens ? text.slice(0, maxTokens) : text;
};

const normaliseSummary = (s: string) => {
  // Normalize whitespace and newlines in the summary
  const t = s
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return t.slice(0, 2500);
};
