import type { ChatCompletionChunk } from "@mlc-ai/web-llm";
import { type SearchResult } from "voy-search";

abstract class ModelInstance {
  name: string;
  cacheName: string;

  constructor(name: string, cacheName: string) {
    this.name = name;
    this.cacheName = cacheName;
  }

  getInstance(): ModelInstance {
    return this;
  }

  abstract addIndex(data: string | string[]): void;

  abstract search(question: number[], count?: number): SearchResult;

  abstract saveToCache(): void;

  abstract loadCache(): void;

  async ask(
    question: string,
    context: string,
    callback?: (chunk: ChatCompletionChunk) => void
  ): Promise<void> {
    throw new Error("Not Implemented");
  }

  abstract loadFile(file: File): void;
}

export { ModelInstance };
