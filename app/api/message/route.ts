import { NextRequest } from "next/server";
import { sendMessage } from "../model-config";
import { Message, StreamingTextResponse } from "ai"

export const runtime = "edge";

export async function POST(request: NextRequest): Promise<StreamingTextResponse> {
  const { messages } : {messages:Message[]} = await request.json();

  const history = messages.slice(0, -1);
  console.log(history);
  const humanMessage = messages[messages.length - 1];

  const response = await sendMessage(history, humanMessage);

  console.log(response)

  return response;
}
