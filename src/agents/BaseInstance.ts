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
    callback?: () => void
  ): Promise<void> {
    throw new Error("Not Implemented");
  }

  async loadFile(file: File): Promise<void> {}

  async loadSavedFiles(): Promise<File[]> {
    return [];
  }
}

export { ModelInstance };
