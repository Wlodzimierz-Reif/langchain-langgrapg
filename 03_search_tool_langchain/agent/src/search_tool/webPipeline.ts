// get 10 colleges in India 2025
// seatch the web
// visit every result page
// summarise
// return the candidate, answer, sources and mode

import { RunnableLambda, RunnableSequence } from "@langchain/core/runnables";
import { webSearch } from "../utils/webSearch";
import { openUrl } from "../utils/openUrl";
import { summarise } from "../utils/summarise";
import { Candidate } from "./types";
import { getChatModel } from "../shared/models";
import { HumanMessage, SystemMessage } from "langchain";

const setTopResults = 5;

//step 1 - search the web
export const webSearchStep = RunnableLambda.from(
  async (ctx: { q: string; mode: "web" | "direct" }) => {
    const results = await webSearch(ctx.q); // tavily

    return {
      ...ctx,
      results,
    };
  },
);

// step 2 - visit the pages and get content
export const openAndSummariseStep = RunnableLambda.from(
  async (input: { q: string; mode: "web" | "direct"; results: any[] }) => {
    if (!Array.isArray(input.results) || input.results.length === 0) {
      return {
        ...input,
        pageSummaries: [],
        fallback: "No results" as const,
      };
    }

    const extrackTopResults = input.results.slice(0, setTopResults);

    const settledResults = await Promise.allSettled(
      extrackTopResults.map(async (result: any) => {
        const opened = await openUrl(result.url);
        const summarisedContent = await summarise(opened.content);

        return {
          url: opened.url,
          summary: summarisedContent.summary,
        };
      }),
    );

    // status => fulfilled
    const settledResultsPageSummaries = settledResults
      .filter((settledResult) => settledResult.status === "fulfilled")
      .map((s) => s.value);

    // edge case if allseetled every case fails
    if (settledResultsPageSummaries.length === 0) {
      const fallbackSnippetSummaries = extrackTopResults
        .map((result: any) => ({
          url: result.url,
          summary: String(result.snippet || result.title || "").trim(),
        }))
        .filter((x: any) => x.summary.length > 0);

      return {
        ...input,
        pageSummaries: fallbackSnippetSummaries,
        fallback: "No pages could be opened, using snippets instead" as const,
      };
    }

    return {
      ...input,
      pageSummaries: settledResultsPageSummaries,
      fallback: "none" as const,
    };
  },
);

// compose step
export const composeStep = RunnableLambda.from(
  async (input: {
    q: string;
    pageSummaries: { url: string; summary: string }[];
    mode: "web" | "direct";
    fallback: "no-results" | "snippets" | "none";
  }): Promise<Candidate> => {
    const model = getChatModel({ temperature: 0.2 });

    if (!input.pageSummaries || input.pageSummaries.length === 0) {
      const directResponseFromModel = await model.invoke([
        new SystemMessage(
          [
            "You answer briefly and clearly for beginners.",
            "If unsire, say so",
          ].join("\n"),
        ),

        new HumanMessage(input.q),
      ]);

      const directAns = (
        typeof directResponseFromModel.content === "string"
          ? directResponseFromModel.content
          : String(directResponseFromModel.content)
      ).trim();

      return {
        answer: directAns,
        sources: [],
        mode: "direct",
      };
    }

    const res = await model.invoke([
      new SystemMessage(
        [
          "You concisely answer questions using proided page summaries",
          "Rules:",
          "- Be neutral",
          "- 5-8 sentences max",
          "- Use only the provided summaries; do not invent new facts",
        ].join("\n"),
      ),

      new HumanMessage(
        [
          `Question: ${input.q}`,
          `Summaries:`,
          JSON.stringify(input.pageSummaries, null, 2),
        ].join("\n"),
      ),
    ]);

    const finalAnswer =
      typeof res.content === "string" ? res.content : String(res.content);

    const extractSources = input.pageSummaries.map((x) => x.url);

    return {
      answer: finalAnswer.trim(),
      sources: extractSources,
      mode: "web",
    };
  },
);

export const webPath = RunnableSequence.from([
  webSearchStep,
  openAndSummariseStep,
  composeStep,
]);
