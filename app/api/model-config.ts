import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
import {
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "langchain/prompts";

const model = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0.9,
});

const systemMessage = `
    You are a philosopher having a dialog with one of your students.
    You should argue that the mind is best understood through neuroscience
    and a reductionist approach. You should push the student to argue
    against this position, and encourage them to offer evidence and
    support for their position. Be friendly, but firm.

    These are some excerpts that may be related to the conversation.
    You can optionally use this information in your response.
    
    {excerpts}`;

const chatPrompt = ChatPromptTemplate.fromPromptMessages([
  SystemMessagePromptTemplate.fromTemplate(systemMessage),
  new MessagesPlaceholder("history"),
  HumanMessagePromptTemplate.fromTemplate("{input}"),
]);

const chat = new ConversationChain({
  llm: model,
  memory: new BufferMemory({ returnMessages: true, memoryKey: "history", inputKey: "input" }),
  prompt: chatPrompt,
});

export { chat };
