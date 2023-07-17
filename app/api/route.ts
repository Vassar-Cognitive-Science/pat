import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { FaissStore } from "langchain/vectorstores/faiss";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { HumanChatMessage, AIChatMessage } from "langchain/schema";
import { model, generateSystemMessage } from "./model-config";

const directory = "faiss-index";

//const db = await FaissStore.loadFromPython(directory, new OpenAIEmbeddings());

async function sleep(time: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, time)
    })
  }

export async function POST(request: NextRequest): Promise<NextResponse> {

  const requestBody = await request.json();
  const humanMessage = new HumanChatMessage(requestBody.message);
    // await sleep(1000);
    // const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
    // const json = await response.json();
    const response = await model.call([
      humanMessage
    ]);
    const text = (response as AIChatMessage).text;
    return NextResponse.json(text);
}