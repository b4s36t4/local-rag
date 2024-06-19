import { Bot } from "lucide-react";
import {
  type NewMessageStore,
  chatStore,
  newMessageStore,
  summarizationStore,
} from "../store/chat";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ChatCompletionMessageParam } from "@mlc-ai/web-llm";
import DOMPurify from "dompurify";
import markdownIt from "markdown-it";
import Shiki from "@shikijs/markdown-it";

const markdown = markdownIt();
markdown.use(
  await Shiki({ theme: "vitesse-dark", fallbackLanguage: "javascript" })
);

export const AIMessage = ({
  message,
}: {
  message: ChatCompletionMessageParam;
}) => {
  const sanitizedMarkdownHTML = useMemo(() => {
    if (!message.content) {
      return;
    }

    const parsed = markdown.render(message.content as string);
    // console.log(parsed);

    return DOMPurify.sanitize(parsed);
  }, [message.content]);

  return (
    <div className="max-w-[50%] my-2 mr-auto py-3 pl-2 pr-6 bg-gray-300 rounded-md">
      <div className="flex flex-col">
        <p className="mr-auto text-sm font-bold">AI:</p>
        <div
          className="prose 2xl:prose-xl prose-slate prose-code:whitespace-pre-wrap"
          dangerouslySetInnerHTML={{
            __html: sanitizedMarkdownHTML ?? (message.content as string),
          }}
        />
      </div>
    </div>
  );
};

export const HumanMessage = ({
  message,
}: {
  message: ChatCompletionMessageParam;
}) => {
  const parsed = useMemo(() => {
    return (
      markdown.render((message.content as string) ?? "") ?? message.content
    );
  }, []);
  return (
    <div className="max-w-[50%] my-2 ml-auto py-3 pl-2 pr-6 bg-gray-300 rounded-md">
      <div className="flex flex-col">
        <p className="ml-auto text-sm font-bold">You:</p>
        <article
          dangerouslySetInnerHTML={{ __html: parsed }}
          className="prose 2xl:prose-xl prose-slate prose-code:whitespace-pre-wrap"
        ></article>
      </div>
    </div>
  );
};

export const RenderMessageList = () => {
  const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([]);
  const [currentMessage, setCurrentMessage] = useState<NewMessageStore>({
    generating: false,
    message: "",
  });

  const [summarizing, setSummarizing] = useState(false);

  const messageContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatStore.subscribe((store, prevStore) => {
      setMessages(store.messages);
      console.log(store.messages.at(-1), "final message");
      messageContainerRef.current?.scrollTo({
        left: 0,
        top: messageContainerRef.current?.scrollHeight ?? 500,
        behavior: "auto",
      });
    });

    newMessageStore.subscribe((store) => {
      setCurrentMessage(store);

      messageContainerRef.current?.scrollTo({
        left: 0,
        top: messageContainerRef.current?.scrollHeight ?? 500,
        behavior: "auto",
      });
    });

    summarizationStore.subscribe((store) => {
      setSummarizing(store.summarizing);
    });
  }, []);

  return (
    <div
      className="overflow-scroll h-full min-h-[600px] flex-1 relative"
      ref={messageContainerRef}
    >
      <div className="absolute flex justify-center w-full mt-5">
        {/* <p className="bg-gray-300 text-center flex m-0 items-center mr-1 rounded-3xl p-2 font-bold italic">
          <Bot className="mr-2" />
          I'm a bot
        </p> */}
      </div>
      <div className="flex flex-col p-4">
        {messages.map((message, index) => {
          if (message.role !== "user") {
            return <AIMessage message={message} />;
          }
          return <HumanMessage message={message} />;
        })}

        {currentMessage.generating && (
          <AIMessage
            message={{ role: "assistant", content: currentMessage.message }}
          />
        )}

        {summarizing && (
          <AIMessage
            message={{
              role: "assistant",
              content: "Summarizing our previous conversation",
            }}
          />
        )}
      </div>
    </div>
  );
};
