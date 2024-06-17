import { Bot } from "lucide-react";

export const RenderMessageList = () => {
  return (
    <div className="overflow-scroll h-full min-h-[700px] flex-1 relative">
      <div className="absolute flex justify-center w-full mt-5">
        <p className="bg-gray-300 text-center flex m-0 items-center mr-1 rounded-3xl p-2 font-bold italic">
          <Bot className="mr-2" />
          I'm a bot
        </p>
      </div>
    </div>
  );
};
