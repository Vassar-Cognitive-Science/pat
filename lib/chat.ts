import { ChatOpenAI } from "langchain/chat_models/openai"

export const chat =  new ChatOpenAI({
    temperature: 0.1,
    openAIApiKey: process.env.OPENAI_API_KEY
})
