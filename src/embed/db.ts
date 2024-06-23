// import {
//   create,
//   insertMultiple,
//   searchVector,
//   type Schema,
//   type Orama,
// } from "@orama/orama";

import { type Voy } from "voy-search";

const matryoshka_dim = 256;

export class EmbedDB {
  static db = "rag-store";
  static dbInstance: Voy | null = null;

  static async getDB() {
    if (this.dbInstance) {
      return this.dbInstance;
    }

    const { Voy } = await import("voy-search");
    this.dbInstance = new Voy();

    return this.dbInstance;
  }
}
