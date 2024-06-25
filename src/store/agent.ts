import { createJSONStorage, persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { ChatPDF, ChatSQL } from "../agents";

interface AgentStore {
  serializeData: () => void;
  deserializeData: () => void;
  agent?:
    | null
    | ({ id: "chat_pdf" | null } & { instance?: ChatPDF | null })
    | ({ id: "chat_sql" | null } & { instance?: ChatSQL | null });
}

const storage = new Map();

export const agentStore = createStore(
  persist<AgentStore>(
    (set, get) => ({
      deserializeData: () => {},
      serializeData() {},
      agent: null,
    }),
    {
      name: "agent-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        delete state.agent?.instance;
        return state;
      },
    }
  )
);
