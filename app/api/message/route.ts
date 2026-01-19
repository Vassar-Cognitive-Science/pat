import { NextRequest } from "next/server";
import { sendMessage } from "../model-config";
import { Message, StreamingTextResponse } from "ai"
import Anthropic from '@anthropic-ai/sdk';

type MessageParam = Anthropic.MessageParam;

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<StreamingTextResponse|void> {
  const { messages } : {messages:Message[]} = await request.json();

  const history: MessageParam[] = messages.map((message) => {
    return {
      content: message.content,
      role: message.role === 'assistant' ? 'assistant' : 'user'
    } as MessageParam;
  });
  const response = await sendMessage(history);

  return response;

}
