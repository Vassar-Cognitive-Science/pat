
import { StreamingTextResponse, OpenAIStream } from "ai";
import OpenAI from 'openai';
import { ChatCompletionSystemMessageParam, ChatCompletionUserMessageParam } from "openai/resources";
import { ProxyAgent } from "proxy-agent";
import { Client } from "pg";
import { pat_prompt, monitor_agent_prompt } from "./model-prompts";

const MODEL_ID = 'gpt-5-mini';

const model = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string,
  httpAgent: new ProxyAgent()
});

const sendMessage = async (
  messages: OpenAI.ChatCompletionMessageParam[]
): Promise<StreamingTextResponse> => {
  const lastMessage = (messages[messages.length - 1] as ChatCompletionUserMessageParam).content || '';

  // Step 1: Get monitor agent recommendation
  const monitorSystemMessage: ChatCompletionSystemMessageParam = {
    content: monitor_agent_prompt,
    role: 'system'
  };

  const monitorResponse = await model.chat.completions.create({
    model: MODEL_ID,
    messages: [monitorSystemMessage, ...messages]
  });

  const topicsRecommendation = monitorResponse.choices[0].message.content || '';
  console.log('Monitor recommendation:', topicsRecommendation);

  // Step 2: Get relevant excerpts using embeddings with conversation context
  // Build context-aware query from recent conversation
  const recentMessages = messages.slice(-3).map(m => {
    if (m.role === 'user') {
      return (m as ChatCompletionUserMessageParam).content || '';
    } else {
      return (m as any).content || '';
    }
  }).filter(content => content.length > 0);
  
  const conversationContext = recentMessages.join(' ');
  const queryText = `${conversationContext} ${lastMessage}`;

  const embeddingResponse = await model.embeddings.create({
    input: queryText,
    model: 'text-embedding-3-large'
  });

  const embedding = embeddingResponse.data[0].embedding;
  const embedding_str = JSON.stringify(embedding);

  const pgClient = new Client(); // gets parameters from env vars
  await pgClient.connect();

  const query = `
    SELECT content, source_file, section_title, chunk_index, token_count,
           (1 - (embedding <=> $1)) as similarity_score
    FROM documents
    WHERE (1 - (embedding <=> $1)) > 0.7
    ORDER BY embedding <=> $1
    LIMIT 3; 
  `;

  const results = await pgClient.query(query, [embedding_str]);
  await pgClient.end();

  const excerpts = results.rows.map((row, index) => {
    const sourceInfo = row.source_file ? `[Source: ${row.source_file}]` : '';
    const sectionInfo = row.section_title ? `[Section: ${row.section_title}]` : '';
    const similarityInfo = `[Relevance: ${(row.similarity_score * 100).toFixed(1)}%]`;
    
    return `--- Excerpt ${index + 1} ${sourceInfo} ${sectionInfo} ${similarityInfo} ---\n${row.content}`;
  }).join('\n\n');

  // Step 3: Create Pat's system message with monitor recommendation and excerpts
  const systemChatMessage: ChatCompletionSystemMessageParam = {
    content: pat_prompt
      .replace('{topics}', topicsRecommendation)
      .replace('{excerpts}', excerpts),
    role: 'system'
  };

  console.log('Pat system message:', systemChatMessage.content);

  const response = await model.chat.completions.create({
    model: MODEL_ID,
    stream: true,
    messages: [systemChatMessage, ...messages]
  });

  const stream = OpenAIStream(response);

  return new StreamingTextResponse(stream);
};

export { sendMessage };
