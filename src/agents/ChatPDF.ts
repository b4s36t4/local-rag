import type { SearchResult } from "voy-search";
import { ModelInstance } from "./BaseInstance";
import { WorkerPostTypes } from "../const";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import * as pdfjs from "pdfjs-dist";
import type { ChatCompletionChunk, MLCEngine } from "@mlc-ai/web-llm";

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

  async ask(
    question: string,
    context: string,
    callback: (chunk: ChatCompletionChunk) => void
  ) {
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

    for await (const chunk of stream) {
      callback(chunk);
    }
  }

  async loadFile(file: File, callback: (event: any) => void) {
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
