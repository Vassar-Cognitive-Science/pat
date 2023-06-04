import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage, BaseChatMessage } from "langchain/schema";

const chat = new ChatOpenAI({
    temperature: 0.1,
})


export default async function getPatMessage(message: string):Promise<string>{
    const response = await chat.call([
        new HumanChatMessage(message)

    ]);

    return response.text;
}