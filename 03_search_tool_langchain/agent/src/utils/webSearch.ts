// Web search utility used by the tool layer.
// It forwards a natural-language(user input) query to Tavily and returns validated result items.

import { env } from "../shared/env";
import { WebSearchResultSchema } from "./schemas";

export const webSearch = async (q: string) => {
  // Normalize input and short-circuit empty queries.
  const query = (q ?? "").trim();
  if (!query) return [];

  return await searchTavilyUtil(query);
};

const searchTavilyUtil = async (query: string) => {
  // Degrade gracefully when the API key is missing in local/dev environments.
  if (!env.TAVILY_API_KEY) {
    console.warn("TAVILY_API_KEY is not set. Returning empty search results.");
    return [];
  }
  // the structure of the request body is based on Tavily's API documentation: 
  // https://docs.tavily.com/documentation/api-reference/endpoint/search
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.TAVILY_API_KEY}`,
    },
    body: JSON.stringify({
      query,
      search_depth: "basic",
      maxResults: 5,
      include_answer: false,
      inculde_image: false,
    }),
  });

  if (!response.ok) {
    const text = await safeText(response);
    throw new Error(
      `Tavily API request failed: ${response.status} ${response.statusText} - ${text}`,
    );
  }

  const data = await response.json();
  const results = Array.isArray(data?.results) ? data.results : [];

  // Keep only the first few results and coerce fields into the expected schema.
  const normalisedResult = results.slice(0, 5).map((r: any) =>
    WebSearchResultSchema.parse({
      title: String(r?.title.trim() ?? "Untitled"),
      url: String(r?.url.trim() ?? ""),
      snippet: String(r?.content.trim().slice(0, 220) ?? ""),
    }),
  );

  return WebSearchResultSchema.parse(normalisedResult);
};

const safeText = async (response: Response) => {
  try {
    // Best-effort extraction of server error details for debugging failed requests.
    return await response.json();
  } catch (err) {
    console.error("Failed to read response text", err);
    return "<unable to read response body>";
  }
};
