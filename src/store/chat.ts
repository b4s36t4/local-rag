import { createStore } from "zustand/vanilla";
import type { ChatCompletionMessageParam } from "@mlc-ai/web-llm";

interface ChatStore {
  messages: ChatCompletionMessageParam[];
  pushMessage: (message: ChatCompletionMessageParam) => void;
}

export interface NewMessageStore {
  generating: boolean;
  message: string;
}

export const newMessageStore = createStore<NewMessageStore>((set, get) => ({
  generating: false,
  message: "",
}));

export const chatStore = createStore<ChatStore>((set, get) => ({
  messages: [],
  pushMessage: (message) => {
    set(({ messages }) => ({
      messages: [...messages, message],
    }));
  },
}));
