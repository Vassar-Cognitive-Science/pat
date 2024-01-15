import { createClient } from "@supabase/supabase-js";
import { Message, StreamingTextResponse, OpenAIStream } from "ai";
import OpenAI from 'openai';
import { ChatCompletionSystemMessageParam } from "openai/resources";
import { ProxyAgent } from "proxy-agent";

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabaseUrl = process.env.SUPABASE_URL as string;

const model = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string,
  httpAgent: new ProxyAgent()
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

    You can be argumentative, but do not be rude or insulting.

    Avoid repeating yourself. Try to push the conversation in new directions.

    If the student makes an assertion without reason or evidence, ask \
    them to elaborate or explain. Do not fill in the gaps for them.

    Below are excerpts from trusted sources that may be related to \
    the conversation. You can optionally use this information in your response.
    
    EXCERPTS

    {excerpts}`;

const client = createClient(supabaseUrl, supabaseKey);
/*const embeddings = new OpenAIEmbeddings();

let vectorStore: SupabaseVectorStore = new SupabaseVectorStore(embeddings, {
  client: client,
  tableName: "documents",
});

const chatPrompt = ChatPromptTemplate.fromPromptMessages([
  SystemMessagePromptTemplate.fromTemplate(systemMessage),
  new MessagesPlaceholder("history"),
  HumanMessagePromptTemplate.fromTemplate("{input}"),
]);*/

const systemChatMessage:ChatCompletionSystemMessageParam = {
  content: systemMessage,
  role: 'system'
}

const sendMessage = async (
  messages: OpenAI.ChatCompletionMessageParam[]
): Promise<StreamingTextResponse> => {
  // convert history into a chat history object

  // const relevantDocs = await vectorStore.similaritySearch(message.content, 2);
  // const excerpts = relevantDocs.map((doc) => doc.pageContent).join("\n\n");

  const response = await model.chat.completions.create({
    model: 'gpt-4-1106-preview',
    stream: true,
    messages: [systemChatMessage, ...messages]
  });

  const stream = OpenAIStream(response);

  return new StreamingTextResponse(stream);
};

export { sendMessage };
