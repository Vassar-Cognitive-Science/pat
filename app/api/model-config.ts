
import { StreamingTextResponse, OpenAIStream } from "ai";
import OpenAI from 'openai';
import { ChatCompletionSystemMessageParam, ChatCompletionUserMessageParam } from "openai/resources";
import { ProxyAgent } from "proxy-agent";
import { Client } from "pg";

const pgClient = new Client(); // gets parameters from env vars


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

const systemChatMessage:ChatCompletionSystemMessageParam = {
  content: systemMessage,
  role: 'system'
}

const sendMessage = async (
  messages: OpenAI.ChatCompletionMessageParam[]
): Promise<StreamingTextResponse> => {
  const lastMessage = (messages[messages.length - 1] as ChatCompletionUserMessageParam).content || '';

  const embeddingResponse = await model.embeddings.create({
    input: lastMessage as string,
    model: 'text-embedding-ada-002'
  });

  const embedding = embeddingResponse.data[0].embedding;
  const embedding_str = JSON.stringify(embedding);

  await pgClient.connect();

  const query = `
    SELECT *
    FROM documents
    ORDER BY vector <=> $1
    LIMIT 3; 
  `;

  const results = await pgClient.query(query, [embedding_str]);
  //console.log(results.rows); // Array of matching rows

  for (const row of results.rows) {
    console.log(row.content);
  }

  const response = await model.chat.completions.create({
    model: 'gpt-4-1106-preview',
    stream: true,
    messages: [systemChatMessage, ...messages]
  });

  const stream = OpenAIStream(response);

  return new StreamingTextResponse(stream);
};

export { sendMessage };
