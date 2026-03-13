type Provider = "openai" | "groq" | "gemini";

type HelloOutput = {
  ok: true;
  provider: Provider;
  mode: string;
  message: string;
};

type GeminiGenerateContent = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
};

import "dotenv/config";

export const helloGemini = async (): Promise<HelloOutput> => {
  const apiKey = process.env.GEMINI_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_KEY is not set in the environment variables.");
  }

  const model = "gemini-2.5-flash-lite";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: "Hello, Gemini!",
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Request failed with status ${response.status}: ${await response.text()}`,
    );
  }

  const json = (await response.json()) as GeminiGenerateContent;
  const test =
    json.candidates?.[0].content?.parts?.[0].text || "No response from Gemini.";

  return {
    ok: true,
    provider: "gemini",
    mode: model,
    message: test,
  };
};
