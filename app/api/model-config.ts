import { ChatOpenAI } from "langchain/chat_models/openai";
import { ConversationChain } from "langchain/chains";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import {
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "langchain/prompts";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { createClient } from "@supabase/supabase-js";
import { Message, LangChainStream, StreamingTextResponse } from "ai";

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabaseUrl = process.env.SUPABASE_URL as string;

const model = new ChatOpenAI({
  modelName: "gpt-3.5-turbo-16k",
  temperature: 0.9,
  streaming: true,
});

const systemMessage = `
    Your name is Pat, short for philosophical artificial thinker.
    
    You are a cognitive scientist having a casual conversation with one of your students.

    The topic of the conversation is how to understand the mind from a philosophical and scientific perspective.

    Specifically, you should present arguments that the mind is best \
    understood through neuroscience and a reductionist approach. You \
    should get the student to argue against this position, and encourage \
    them to offer evidence and support for their position. Do not provide these arguments for them.

    Your responses are concise and to the point. The dialog should focus on one argument at a time.

    Avoid repeteating yourself. Try to push the conversation in new directions.

    If the student makes an assertion without reason or evidence, ask \
    them to elaborate or explain. Do not fill in the gaps for them.

    Below are excerpts from trusted sources that may be related to \
    the conversation. You can optionally use this information in your response.
    
    EXCERPTS

    {excerpts}`;

const client = createClient(supabaseUrl, supabaseKey);
const embeddings = new OpenAIEmbeddings();

let vectorStore: SupabaseVectorStore = new SupabaseVectorStore(embeddings, {
  client: client,
  tableName: "documents",
});

const chatPrompt = ChatPromptTemplate.fromPromptMessages([
  SystemMessagePromptTemplate.fromTemplate(systemMessage),
  new MessagesPlaceholder("history"),
  HumanMessagePromptTemplate.fromTemplate("{input}"),
]);

const sendMessage = async (
  history: Message[],
  message: Message
): Promise<StreamingTextResponse> => {
  // convert history into a chat history object
  const chathistory = new ChatMessageHistory();
  for (const m of history) {
    if (m.role == "assistant") {
      chathistory.addAIChatMessage(m.content);
    }
    if (m.role == "user") {
      chathistory.addUserMessage(m.content);
    }
  }

  const { stream, handlers } = LangChainStream();

  handlers.handleChainError = (e: Error, runId: string):Promise<void> =>  {
    console.log(e.message);
    return Promise.resolve();
  }

  handlers.handleLLMError = (e: Error, runId: string):Promise<void> =>  {
    console.log(e.message);
    return Promise.resolve();
  }

  const chat = new ConversationChain({
    llm: model,
    memory: new BufferMemory({
      returnMessages: true,
      memoryKey: "history",
      inputKey: "input",
      chatHistory: chathistory,
    }),
    prompt: chatPrompt,
    verbose: false,
  });

  const relevantDocs = await vectorStore.similaritySearch(message.content, 2);
  const excerpts = relevantDocs.map((doc) => doc.pageContent).join("\n\n");

  chat.call(
    {
      input: message.content,
      excerpts: excerpts,
    },
    [handlers]
  ).catch((e) => {
    console.log(e.message);
  });

  return new StreamingTextResponse(stream);
};

export { sendMessage };
