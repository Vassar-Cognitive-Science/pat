import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { sendMessage } from "../model-config";


export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestBody = await request.json();
  const history = requestBody.history;
  const humanMessage = requestBody.message;

  const response = await sendMessage(history, humanMessage);

  console.log(response)

  return NextResponse.json(response);
}
