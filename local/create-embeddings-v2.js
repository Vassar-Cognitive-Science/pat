const fs = require('fs').promises;
const path = require('path');
const { OpenAI } = require('openai');
const { Pool } = require('pg');
const { config } = require('dotenv');


// set up environment variables
config({path: '.env.local'});

// Configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const CHUNK_SIZE = 1000; // Adjust as needed
const OVERLAP = 200; // Adjust as needed
const INPUT_FOLDER = '/home/jdeleeuw/pat-data-main';
const DB_CONFIG = {
  host: "127.0.0.1",
  port: 5432,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE
};

// Initialize OpenAI
const configuration = { apiKey: OPENAI_API_KEY };
const openai = new OpenAI(configuration);

// Initialize Postgres connection pool
const pool = new Pool(DB_CONFIG);

async function createPGVectorTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS vector;
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        content TEXT,
        embedding vector(3072)
      );
    `);
    console.log('Table created successfully');
  } catch (err) {
    console.error('Error creating table:', err);
  } finally {
    client.release();
  }
}

async function getFiles(folderPath) {
  const files = await fs.readdir(folderPath);
  return files.filter(file => path.extname(file).toLowerCase() === '.txt');
}

async function readFile(filePath) {
  return fs.readFile(filePath, 'utf8');
}

function splitTextIntoChunks(text, chunkSize, overlap) {
  const paragraphs = text.split('\n\n');
  const chunks = [];
  let currentChunk = '';

  paragraphs.forEach(paragraph => {
    const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
    
    sentences.forEach(sentence => {
      if (currentChunk.length + sentence.length > chunkSize) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += sentence;
      }
    });

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = '';
    }
  });

  // Handle overlap
  if (overlap > 0) {
    const overlappedChunks = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      if (i > 0) {
        const previousChunk = overlappedChunks[overlappedChunks.length - 1];
        const overlapText = previousChunk.slice(-overlap);
        overlappedChunks.push(overlapText + chunk);
      } else {
        overlappedChunks.push(chunk);
      }
    }
    return overlappedChunks;
  }

  return chunks;
}

async function getEmbedding(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-large',
    input: text,
  });
  return response.data[0].embedding;
}

async function insertEmbedding(client, content, embedding) {
  const query = `
    INSERT INTO documents (content, embedding)
    VALUES ($1, $2)
  `;
  await client.query(query, [content, '['+embedding+']']);
}

async function processFile(filePath) {
  const content = await readFile(filePath);
  const chunks = splitTextIntoChunks(content, CHUNK_SIZE, OVERLAP);
  
  const client = await pool.connect();
  try {
    for (const chunk of chunks) {
      const embedding = await getEmbedding(chunk);
      //console.log(`Embedding for chunk: ${embedding}`);
      await insertEmbedding(client, chunk, embedding);
    }
    console.log(`Processed file: ${filePath}`);
  } catch (err) {
    console.error(`Error processing file ${filePath}:`, err);
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await createPGVectorTable();
    const files = await getFiles(INPUT_FOLDER);
    
    for (const file of files) {
      await processFile(path.join(INPUT_FOLDER, file));
    }
    
    console.log('All files processed successfully');
  } catch (err) {
    console.error('Error in main process:', err);
  } finally {
    await pool.end();
  }
}

main();