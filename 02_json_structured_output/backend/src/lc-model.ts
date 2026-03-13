import { ChatGoogle } from "@langchain/google";
import { loadEnv } from "./env";

export type Provider = "gemini";

export const createChatModel = (provider: Provider, model: any) => {
  loadEnv();

  const base = {
    temperature: 0 as const,
  };

  return {
    provider: "gemini",
    model: new ChatGoogle({
      ...base,
      model: "gemini-2.5-flash",
    }),
  };
};
