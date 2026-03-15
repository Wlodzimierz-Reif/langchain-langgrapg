// fetch every page
// the LLM itself cannot directly browse the web,
// but it can use tools that perform web searches and retrieve information.
// We then decide which content is safe tje what we want the model to show

// We fetch the URL, stip all noise, keep exact article like content thet we need

import { convert } from "html-to-text";
import { OpenUrlOutputSchema } from "./schemas";

export const openUrl = async (url: string) => {
  // step1
  const normalised = validateUrl(url);

  // step2 - fetch the page by ourselves
  // avoid instant 403 on strict websites

  const res = await fetch(normalised, {
    headers: {
      "User-Agent": "agent-core/1.0 (+course-demo)",
    },
  });

  if (!res.ok) {
    const body = await safeText(res);
    throw new Error(
      `Failed to fetch URL: ${res.status} ${res.statusText} - ${body.slice(0, 200)}`,
    );
  }

  //   step3 -
  const contentType = res.headers.get("Content-Type") ?? "";
  const raw = await res.text();

  //   step 4 - html to normal text
  const text = contentType.includes("text/html")
    ? convert(raw, {
        wordwrap: false,
        selectors: [
          {
            selector: "nav",
            format: "skip",
          },
          {
            selector: "header",
            format: "skip",
          },
          {
            selector: "footer",
            format: "skip",
          },
          {
            selector: "script",
            format: "skip",
          },
          {
            selector: "style",
            format: "skip",
          },
        ],
      })
    : raw;

  // step 5
  const cleaned = collapseWhitespace(text);
  const capped = cleaned.slice(0, 8000);

  //   step 6
  return OpenUrlOutputSchema.parse({
    url,
    content: capped,
  });
};

const validateUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    // https:
    if (!/^https?:$/.test(parsed.protocol)) {
      throw new Error("Invalid URL protocol. Only HTTP and HTTPS are allowed.");
    }
    return parsed.toString();
  } catch (err) {
    throw new Error("Invalid URL");
  }
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

const collapseWhitespace = (text: string) => {
  return text.replace(/\s+/g, " ").trim();
};
