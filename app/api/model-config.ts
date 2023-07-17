import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory"
import { SystemMessagePromptTemplate, HumanMessagePromptTemplate, ChatPromptTemplate } from "langchain/prompts";

const model = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0.9,
});

const chat = new ConversationChain({
  llm: model,
  memory: new BufferMemory({ returnMessages: true})
})

const generateSystemMessage = (): SystemChatMessage => {
  return new SystemChatMessage(`
    You are a philosopher having a dialog with one of your students.
    You should argue that the mind is best understood through neuroscience
    and a reductionist approach. You should push the student to argue
    against this position, and encourage them to offer evidence and
    support for their position. Be friendly, but firm.

    These are some excerpts that may be related to the conversation.
    You can optionally use this information in your response.`
  );
};

const generateChatPrompt = (): ChatPromptTemplate => {
  return ChatPromptTemplate.fromPromptMessages([

  ])
}

export { model, generateSystemMessage, generateChatPrompt };
