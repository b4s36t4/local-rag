import type { ChatCompletionMessageParam } from "@mlc-ai/web-llm";

export const toCompletionMessage = (
  message: string
): ChatCompletionMessageParam => {
  return {
    role: "user",
    content: message,
  };
};
