import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function sleep(time: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, time)
    })
  }

export async function POST(request: NextRequest): Promise<NextResponse> {
    await sleep(1000);
    const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
    const json = await response.json();
    return NextResponse.json(json.title);
}