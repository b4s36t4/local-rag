import type { ChatCompletionMessageParam, MLCEngine } from "@mlc-ai/web-llm";
import { chatStore } from "../store/chat";
import { summarizeSystemMessage } from "./message";

const getMemory = async (
  questionMessage: ChatCompletionMessageParam,
  model: MLCEngine
) => {
  let memory: ChatCompletionMessageParam[] = [];
  const previousMessages = chatStore.getState().messages;
  if (previousMessages.length > 4) {
    const summarizedMessage = await summarizeSystemMessage(
      chatStore
        .getState()
        .messages.slice(0, chatStore.getState().messages.length - 1),
      model
    );

    if (summarizedMessage.length === 0) {
      return;
    }

    console.log(summarizedMessage, "message");

    memory.push({
      role: "system",
      content: `Given our previous conversation context as summorized ${summarizedMessage[0].message.content}, answer the upcoming questions keeping the context in mind. If you find the context not useful ignore the context and answer your own for the questions asked. \n\n User: `,
    });
    memory.push(questionMessage);
  } else {
    memory.push(...chatStore.getState().messages);
  }
};
