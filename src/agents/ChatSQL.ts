import type { SearchResult } from "voy-search";
import { ModelInstance } from "./BaseInstance";
import type { MLCEngine } from "@mlc-ai/web-llm";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { WorkerPostTypes } from "../const";

export class ChatSQL extends ModelInstance {
  static instance: ModelInstance | null = null;
  model: MLCEngine | null = null;
  splitter: RecursiveCharacterTextSplitter | null = null;
  // loader: WebPDFLoader | null = null
  worker: Worker | null = null;

  cacheHandle: FileSystemDirectoryHandle | null = null;

  static cacheNameStatic: string = "chat_sql";

  constructor(model: MLCEngine, worker: Worker) {
    super("chat_sql", "chat_sql");
    this.model = model;
    this.splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 12,
    });
    this.worker = worker;

    this.worker.addEventListener("message", (event) => {
      const { type } = event.data;

      if (type === WorkerPostTypes.embedDocument) {
        console.log("[Embed] Document embed created");
        if (!event.data.data?.length) {
          console.log(
            "%c[Embed Error]",
            "background-color: red;padding:2px;color:white",
            "Can't embed"
          );
          return;
        }
        window.db.add({
          embeddings: [
            {
              embeddings: event.data.data.at(0),
              id: crypto.randomUUID(),
              title: event.data.payload,
              url: "",
            },
          ],
        });
        console.log("[Embed] Added into Vector Search");
      }

      return;
    });
  }

  addIndex(data: string | string[]): void {
    throw new Error("Method not implemented.");
  }
  search(question: number[], count?: number): SearchResult {
    return window.db.search(question as any, count || 5);
  }
  saveToCache(): void {
    throw new Error("Method not implemented.");
  }
  loadCache(): void {
    throw new Error("Method not implemented.");
  }
}
