import { env } from "./env";
import { ChatGoogle } from "@langchain/google";

import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatGroq } from "@langchain/groq";

type ModelOpts = {
  temperature?: number;
  maxTokens?: number;
};

export const getChatModel = (opts?: ModelOpts): BaseChatModel => {
  const temp = opts?.temperature ?? 0.2;

  switch (env.MODEL_PROVIDER) {
    case "gemini":
      return new ChatGoogle({
        apiKey: env.GOOGLE_API_KEY,
        model: env.GEMINI_MODEL,
        temperature: temp,
      });
    case "groq":
      return new ChatGroq({
        apiKey: env.GROQ_API_KEY,
        model: env.GROQ_MODEL,
        temperature: temp,
      });
    default:
      throw new Error(`Unsupported model provider: ${env.MODEL_PROVIDER}`);
  }
};
