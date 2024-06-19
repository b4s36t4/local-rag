import type { ChatCompletionMessageParam, MLCEngine } from "@mlc-ai/web-llm";
import { summarizationStore } from "../store/chat";

export const toCompletionMessage = (
  message: string
): ChatCompletionMessageParam => {
  return {
    role: "user",
    content: message,
  };
};

export const summarizeSystemMessage = async (
  messages: ChatCompletionMessageParam[],
  model: MLCEngine
) => {
  summarizationStore.setState({ summarizing: true });
  const messagesJoined = messages.map((message) => {
    if (message.role === "user") {
      return "";
    }
    return message.content as string;
  });
  const prompt = `Summarize the following messages into whole new message without loosing any important information or keywords. Messages: ${messagesJoined.join(
    "\n\n"
  )}
  
  Keep it short and simple to understand, return the only result nothing much.
  `;

  const summarize = await model.chat.completions.create({
    messages: [{ role: "user", content: prompt, name: "Summarizer" }],
    stream: false,
  });

  summarizationStore.setState({ summarizing: false });

  return summarize.choices;
};
