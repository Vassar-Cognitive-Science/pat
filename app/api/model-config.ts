
import { StreamingTextResponse, OpenAIStream } from "ai";
import OpenAI from 'openai';
import { ChatCompletionSystemMessageParam, ChatCompletionUserMessageParam } from "openai/resources";
import { ProxyAgent } from "proxy-agent";
import { Client } from "pg";


const model = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string,
  httpAgent: new ProxyAgent()
});

const systemMessage = `
    Your name is Pat, short for philosophical artificial thinker.
    
    You are a cognitive scientist having a casual conversation with one of your students.

    The topic of the conversation is how to understand the mind from a philosophical and scientific perspective.

    Your goal is to provide arguments that challenge the student's ideas. 
    You want to help them think more critically and deeply about the topic.

    Your responses are concise and to the point. The dialog should focus on one argument at a time.

    You can be argumentative, but do not be rude.

    Avoid repeating yourself. Try to push the conversation in new directions.

    If the student makes an assertion without reason or evidence, ask them to elaborate or explain. 
    Do not fill in the gaps for them.

    Below are excerpts from trusted sources that may be related to the conversation.
    The student is familiar with the sources, and these sources might provide a common ground for the conversation. 
    You can optionally use this information in your response.
    
    EXCERPTS

    {excerpts}`;



const sendMessage = async (
  messages: OpenAI.ChatCompletionMessageParam[]
): Promise<StreamingTextResponse> => {
  const lastMessage = (messages[messages.length - 1] as ChatCompletionUserMessageParam).content || '';

  const embeddingResponse = await model.embeddings.create({
    input: lastMessage as string,
    model: 'text-embedding-3-large'
  });

  const embedding = embeddingResponse.data[0].embedding;
  const embedding_str = JSON.stringify(embedding);

  const pgClient = new Client(); // gets parameters from env vars
  await pgClient.connect();

  const query = `
    SELECT *
    FROM documents
    ORDER BY vector <=> $1
    LIMIT 3; 
  `;

  const results = await pgClient.query(query, [embedding_str]);
  //console.log(results.rows); // Array of matching rows

  await pgClient.end();

  const excerpts = results.rows.map((row) => row.content).join('\n\n');

  const systemChatMessage:ChatCompletionSystemMessageParam = {
    content: systemMessage.replace('{excerpts}', excerpts),
    role: 'system'
  }

  console.log(systemChatMessage.content)

  const response = await model.chat.completions.create({
    model: 'gpt-4o-2024-08-06',
    stream: true,
    messages: [systemChatMessage, ...messages]
  });

  const stream = OpenAIStream(response);

  return new StreamingTextResponse(stream);
};

export { sendMessage };
