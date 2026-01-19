
import { StreamingTextResponse } from "ai";
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

type MessageParam = Anthropic.MessageParam;
import { ProxyAgent } from "proxy-agent";
import { Client } from "pg";
import { pat_prompt } from "./model-prompts";

const MODEL_ID = 'claude-sonnet-4-5';

// Anthropic client for chat completions
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY as string
});

// OpenAI client for embeddings only
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string,
  httpAgent: new ProxyAgent()
});

const sendMessage = async (
  messages: MessageParam[]
): Promise<StreamingTextResponse> => {
  const lastMessage = messages[messages.length - 1];
  const lastMessageContent = typeof lastMessage.content === 'string'
    ? lastMessage.content
    : '';


  // Step 2: Get relevant excerpts using embeddings with conversation context
  // Build context-aware query from recent conversation
  const recentMessages = messages.slice(-3).map(m => {
    if (typeof m.content === 'string') {
      return m.content;
    }
    return '';
  }).filter(content => content.length > 0);

  const conversationContext = recentMessages.join(' ');
  const queryText = `${conversationContext} ${lastMessageContent}`;

  const embeddingResponse = await openai.embeddings.create({
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

  // Step 3: Create Pat's system message with excerpts
  const systemPrompt = pat_prompt.replace('{excerpts}', excerpts);

  console.log('Pat system message:', systemPrompt);

  const response = await anthropic.messages.create({
    model: MODEL_ID,
    max_tokens: 4096,
    system: systemPrompt,
    stream: true,
    messages: messages
  });

  // Create a ReadableStream from the Anthropic stream
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      for await (const event of response) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          controller.enqueue(encoder.encode(event.delta.text));
        }
      }
      controller.close();
    }
  });

  return new StreamingTextResponse(stream);
};

export { sendMessage };
