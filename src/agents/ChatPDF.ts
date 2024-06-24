import type { SearchResult } from "voy-search";
import { ModelInstance } from "./BaseInstance";
import { WorkerPostTypes } from "../const";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import * as pdfjs from "pdfjs-dist";
import type {
  ChatCompletionChunk,
  ChatCompletionMessageParam,
  MLCEngine,
} from "@mlc-ai/web-llm";
import { chatStore, newMessageStore } from "../store/chat";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.mjs`;

class ChatPDF extends ModelInstance {
  static instance: ModelInstance | null = null;
  model: MLCEngine | null = null;
  splitter: RecursiveCharacterTextSplitter | null = null;
  // loader: WebPDFLoader | null = null
  worker: Worker | null = null;

  constructor(model: MLCEngine, worker: Worker) {
    super("chat_pdf", "chat_pdf");
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
        console.log(event.data, "Events");
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

  static getInstance(model: MLCEngine, worker: Worker): ModelInstance {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ChatPDF(model, worker);
    return this.instance;
  }

  addIndex(data: string | string[]): void {
    // throw new Error("Method not implemented.");
    self.postMessage({
      type: WorkerPostTypes.embedQuestion,
      data,
      id: crypto.randomUUID(),
    });
  }

  async ask(question: string, context: string, callback: () => void) {
    console.log(context, question, "data!!");
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

  async loadFile(file: File) {
    const loader = new WebPDFLoader(file, {
      pdfjs: async () => ({
        getDocument: pdfjs.getDocument,
        version: pdfjs.version,
      }),
    });

    const documents = await loader.load();
    const splits = await this.splitter?.splitDocuments(documents);

    if (!splits) {
      return;
    }

    splits.forEach((document, i) => {
      console.log(
        "%c[INDEX]",
        "background-color: red;padding:2px;color: white",
        "Indexing document",
        i
      );
      this.worker?.postMessage({
        data: document.pageContent,
        id: crypto.randomUUID(),
        type: WorkerPostTypes.embedDocument,
      });
    });
  }

  search(question: number[], count?: number): SearchResult {
    return window.db.search(question as any, count || 5);
  }

  saveToCache(): void {
    const serailizedJSON = window.db.serialize();
  }
  loadCache(): void {
    throw new Error("Method not implemented.");
  }
}

export { ChatPDF };
