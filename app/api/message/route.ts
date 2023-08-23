import { NextRequest } from "next/server";
import { sendMessage } from "../model-config";
import { Message, StreamingTextResponse } from "ai"
import { Console } from "console";

export const runtime = "edge";

export async function POST(request: NextRequest): Promise<StreamingTextResponse> {
  const { messages } : {messages:Message[]} = await request.json();

  const history = messages.slice(0, -1);
  console.log(history);
  const humanMessage = messages[messages.length - 1];

  const response = await sendMessage(history, humanMessage);

  if(response.status != 200) {
    console.log(`Error: ${response.status}. ${response.statusText}`)
  }

  return response;
}
