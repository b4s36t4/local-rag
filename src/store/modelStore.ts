import { createStore } from "zustand/vanilla";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ModelRecord } from "@mlc-ai/web-llm";

interface ModelStore {
  selectedModel: ModelRecord | null;
}

export const modelStore = createStore(
  persist<ModelStore>((get) => ({ selectedModel: null }), {
    name: "model",
    storage: createJSONStorage(() => localStorage),
  })
);
