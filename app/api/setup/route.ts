import { NextResponse } from "next/server";

import { setupEmbeddings } from "../model-config";

export async function POST(): Promise<NextResponse> {
  const response = await setupEmbeddings();
  return NextResponse.json(response);
}
