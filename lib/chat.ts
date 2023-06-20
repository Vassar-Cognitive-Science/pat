import { ChatOpenAI } from "langchain/chat_models/openai"

// const chat =  new ChatOpenAI({
//     temperature: 0.1,
//     openAIApiKey: process.env.OPENAI_API_KEY
// })

export default async function (message: string): Promise<string> {

    const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
    const json = await response.json();
    return json.title;

}
        
