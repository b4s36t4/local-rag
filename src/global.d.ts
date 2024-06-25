// declare global {
//   declare interface Window {
//     myCustomProperty: string;
//     myCustomMethod: () => void;
//   }
// }

// interface NewMessage {
//   email: string;
// }

declare interface Window {
  MODEL_LOADED: boolean;
  CHAT_PDF: boolean;
  db: import("voy-search").Voy;
  modal: HTMLDivElement & {
    open: () => void;
    close: () => void;
    status: boolean;
  };
}

declare type AGENT = { chat_pdf: "chat_pdf"; chat_sql: "chat_sql" };
