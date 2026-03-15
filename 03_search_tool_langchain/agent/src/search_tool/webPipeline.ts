// get 10 colleges in India 2025
// seatch the web
// visit every result page
// summarise
// return the candidate, answer, sources and mode

import { RunnableLambda } from "@langchain/core/runnables";
import { webSearch } from "../utils/webSearch";
import { openUrl } from "../utils/openUrl";
import { summarise } from "../utils/summarise";

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
        pageSumaries: [],
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
    const settledResultsPageSummarise = settledResults
      .filter((settledResult) => settledResult.status === "fulfilled")
      .map((s) => s.value);

      if(settledResultsPageSummarise.length === 0) {
        const fallbackSnippetSummaries = extrackTopResults.map((result: any) => ({
            url: result.url,
            summary: String(result.snippet || result.title || "").trim()
        }).filter((x: any) => x.summary.length > 0)
      }
      
  },
  
);
