import { NextRequest } from "next/server";
import { sendMessage } from "../model-config";
import { Message, StreamingTextResponse } from "ai"
import { ChatCompletionMessageParam, ChatCompletionAssistantMessageParam, ChatCompletionUserMessageParam } from "openai/resources";

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<StreamingTextResponse|void> {
  const { messages } : {messages:Message[]} = await request.json();

  const history:ChatCompletionMessageParam[] = messages.map((message) => {
    if(message.role == 'assistant'){
      return {
        content: message.content,
        role: 'assistant',
        name: 'Pat'
      } as ChatCompletionAssistantMessageParam
    } else {
      return {
        content: message.content,
        role: 'user',
        name: 'You'
      } as ChatCompletionUserMessageParam
    }
  });
  const response = await sendMessage(history);

  return response;
  
}
