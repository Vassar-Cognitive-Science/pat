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

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string
const supabaseUrl = process.env.SUPABASE_URL as string

const model = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0.9,
});

const systemMessage = `
    You are a philosopher having a dialog with one of your students. \
    You should argue that the mind is best understood through neuroscience \
    and a reductionist approach. You should push the student to argue \
    against this position, and encourage them to offer evidence and \
    support for their position. Be friendly, but firm.

    Keep your responses to one main point at a time and be concise. \
    If the student \
    makes an assertion without reason or evidence, ask them to elaborate \
    or explain. 

    These are some excerpts that may be related to the conversation. \
    You can optionally use this information in your response.
    
    {excerpts}`;

const client = createClient(supabaseUrl, supabaseKey);
const embeddings = new OpenAIEmbeddings();

let vectorStore: SupabaseVectorStore = new SupabaseVectorStore(embeddings, {
  client: client,
  tableName: "documents"
});

const chatPrompt = ChatPromptTemplate.fromPromptMessages([
  SystemMessagePromptTemplate.fromTemplate(systemMessage),
  new MessagesPlaceholder("history"),
  HumanMessagePromptTemplate.fromTemplate("{input}"),
]);

const sendMessage = async(history:{message:string;sender:"You"|"Pat"}[], message: string) => {

  // convert history into a chat history object
  const chathistory = new ChatMessageHistory();
  for(const m of history) {
    if(m.sender == "Pat"){
      chathistory.addAIChatMessage(m.message);
    }
    if(m.sender == "You"){
      chathistory.addUserMessage(m.message);
    }
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
    verbose: true,
  });

  if(!vectorStore || !chat) {
    return "Sorry, I'm not ready yet. Please wait a few seconds and try again.";
  }

  const relevantDocs = await vectorStore.similaritySearch(message, 3);
  const excerpts = relevantDocs.map((doc) => doc.pageContent).join("\n\n");

  const response = await chat.call({
    input: message,
    excerpts: excerpts,
  });


  console.log({response})

  return response.response;
}

export { sendMessage };
