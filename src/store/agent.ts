import { createJSONStorage, persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { ModelInstance } from "../agents/BaseInstance";

interface AgentStore {
  selectedAgentId: string | null;
  updateAgent: (agent: string | null, instance: ModelInstance | null) => void;
  serializeData: () => void;
  deserializeData: () => void;
  selectedAgentInstance?: ModelInstance | null;
}

const storage = new Map();

export const agentStore = createStore(
  persist<AgentStore>(
    (set, get) => ({
      deserializeData: () => {},
      selectedAgentId: null,
      selectedAgentInstance: null,
      serializeData() {},
      updateAgent(agent, instance) {
        set({ selectedAgentId: agent, selectedAgentInstance: instance });
      },
    }),
    {
      name: "agent-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        delete state.selectedAgentInstance;
        return state;
      },
    }
  )
);
