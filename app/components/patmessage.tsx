import { chat } from "../../lib/chat"
import { HumanChatMessage, SystemChatMessage, BaseChatMessage } from "langchain/schema";

async function getPatMessage(message: string):Promise<string>{
    const response = await chat.call([
        new HumanChatMessage(message)
    ]);

    return response.text;
}

interface PatMessageProps {
  userMessage: string;
}


export default async function PatMessage({ userMessage }: PatMessageProps) {

  const message = await getPatMessage(userMessage);

  const bg = "bg-blue-500";
  return (
    <div className={`${bg} text-white p-2 rounded-md mb-2`}>
      <p className="text-sm">Pat</p>
      <p className="text-md">{message}</p>
    </div>
  );
}