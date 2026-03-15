import { z } from "zod";

// we'll use it to validate the structure of the web search results returned by the search tool
// even before any model is called, to ensure our agent has the correct data to work with
// and to lower the cost
export const WebSearchResultSchema = z.object({
  title: z.string().min(1).max,
  url: z.url(),
  snippet: z.string().optional().default(""),
});

// capping at 10 results to prevent overwhelming the agent with too much information and to control costs
export const WebSearchResultsSchema = z.array(WebSearchResultSchema).max(10);

export type WebSearchResult = z.infer<typeof WebSearchResultSchema>;

export const OpenUrlInputSchema = z.object({
  url: z.url(),
});

export const OpenUrlOutputSchema = z.object({
  url: z.url(),
  content: z.string().min(1),
});

export const SummarisedInputSchema = z.object({
  text: z.string().min(50, "Need a bit more text to summarise"),
});

export const SummarisedOutputSchema = z.object({
  summary: z.string().min(1),
});

export const SearchInputSchema = z.object({
  q: z.string().min(5, "Please ask a specific query"),
});

export type SearchInput = z.infer<typeof SearchInputSchema>;
