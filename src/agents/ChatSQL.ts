import type { SearchResult } from "voy-search";
import type { ChatCompletionMessageParam, MLCEngine } from "@mlc-ai/web-llm";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { WorkerPostTypes } from "../const";
import { createFile, getOrCreateFolder } from "../utils/files";
import { chatStore, newMessageStore } from "../store/chat";

export class ChatSQL {
  static instance: ChatSQL | null = null;
  model: MLCEngine | null = null;
  splitter: RecursiveCharacterTextSplitter | null = null;
  // loader: WebPDFLoader | null = null
  worker: Worker | null = null;

  cacheHandle: FileSystemDirectoryHandle | null = null;
  cacheName: string = "chat_sql";

  constructor(
    model: MLCEngine | null,
    worker: Worker | null,
    loadData = false
  ) {
    this.model = model;
    this.splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 12,
    });
    this.worker = worker;

    this.worker?.addEventListener("message", (event) => {
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

        this;
        console.log("[Embed] Added into Vector Search");
      }

      return;
    });

    getOrCreateFolder(this.cacheName)
      .then((cache) => {
        this.cacheHandle = cache;
      })
      .catch((err) => console.log(err, "Root error"));

    if (loadData) {
      this.loadFromVectorDB();
    }
  }

  saveSQLEmbedding(sql: string) {
    this.worker?.postMessage({
      type: WorkerPostTypes.embedDocument,
      data: sql,
      id: crypto.randomUUID(),
    });
  }

  loadFromVectorDB() {
    const dbJSON = window.db.serialize();
    const blob = new Blob([dbJSON], { type: "text/json" });
    createFile(this.cacheHandle!, `${this.cacheName}_vector`, blob);
  }

  search(question: number[], count?: number): SearchResult {
    return window.db.search(question as any, count || 5);
  }

  async ask(question: string, context: string, callback: () => void) {
    const prompt = `
    
    Give the context below answer my questions.

    context: ${context}

    question: ${question}

    `;

    const stream = await this.model?.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      stream: true,
      stream_options: { include_usage: true },
      temperature: 0.2,
      seed: 10000,
    });

    if (!stream) {
      return;
    }

    const message: ChatCompletionMessageParam = {
      content: "",
      role: "assistant",
    };

    newMessageStore.setState({ generating: true });

    for await (const chunk of stream) {
      // callback(chunk);
      if (
        chunk.choices.length === 0 ||
        chunk.choices[0]?.finish_reason === "stop"
      ) {
        break;
      }

      const chunkMessage = chunk.choices[0].delta.content;
      if (!chunkMessage) {
        break;
      }
      message["content"]! += chunkMessage;

      newMessageStore.setState({ message: message["content"] ?? "" });
    }
    chatStore.getState().pushMessage(message);

    newMessageStore.setState({ generating: false, message: "" });
    callback();
  }
}
