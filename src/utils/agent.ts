import type { MLCEngine } from "@mlc-ai/web-llm";
import { ChatPDF } from "../agents/ChatPDF";
import { ChatSQL } from "../agents";

export const getAgentInstance = (
  agent: string,
  { model, worker }: { model: MLCEngine; worker: Worker }
) => {
  switch (agent) {
    case "chat_pdf":
      return new ChatPDF(model!, worker);

    case "chat_sql":
      return new ChatSQL(model!, worker);
    default:
      return null;
  }
};
