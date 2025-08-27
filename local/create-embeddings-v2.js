const fs = require('fs').promises;
const path = require('path');
const { OpenAI } = require('openai');
const { Pool } = require('pg');
const { config } = require('dotenv');


// set up environment variables
config({path: '.env.local'});

// Configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const CHUNK_SIZE = 2500; // Larger chunks for better context
const OVERLAP_SENTENCES = 2; // Number of sentences to overlap
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
        embedding vector(3072),
        source_file TEXT,
        chunk_index INTEGER,
        section_title TEXT,
        token_count INTEGER
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

function preprocessText(text) {
  // Clean up formatting artifacts
  text = text.replace(/\r\n/g, '\n'); // Normalize line endings
  text = text.replace(/\n{3,}/g, '\n\n'); // Remove excessive newlines
  text = text.replace(/[ \t]+/g, ' '); // Normalize whitespace
  text = text.replace(/\n\s*\n/g, '\n\n'); // Clean paragraph breaks
  return text.trim();
}

function extractSectionTitle(text) {
  // Look for section headers at the beginning of text
  const lines = text.split('\n');
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    const line = lines[i].trim();
    // Check for common header patterns
    if (line.length < 100 && (
      line.match(/^[A-Z][^.!?]*$/) || // All caps or title case without punctuation
      line.match(/^\d+\.?\s+[A-Z]/) || // Numbered sections
      line.match(/^Chapter|Section|Part/i) || // Common section words
      line.match(/^[A-Z][a-z]+:/)  // Title: format
    )) {
      return line;
    }
  }
  return null;
}

function estimateTokenCount(text) {
  // Rough estimate: ~4 characters per token
  return Math.ceil(text.length / 4);
}

function splitTextIntoChunks(text, chunkSize, overlapSentences) {
  text = preprocessText(text);
  
  // Split by paragraphs first to preserve document structure
  const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
  const chunks = [];
  let currentChunk = '';
  let currentSentences = [];
  
  paragraphs.forEach(paragraph => {
    const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
    
    sentences.forEach(sentence => {
      sentence = sentence.trim();
      if (!sentence) return;
      
      // Check if adding this sentence would exceed chunk size
      if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
        // Create chunk with current content
        const chunkInfo = {
          content: currentChunk.trim(),
          sentences: [...currentSentences],
          sectionTitle: extractSectionTitle(currentChunk)
        };
        chunks.push(chunkInfo);
        
        // Start new chunk with overlap sentences
        const overlapStart = Math.max(0, currentSentences.length - overlapSentences);
        currentSentences = currentSentences.slice(overlapStart);
        currentChunk = currentSentences.join(' ') + (currentSentences.length > 0 ? ' ' : '');
      }
      
      currentChunk += sentence + ' ';
      currentSentences.push(sentence);
    });
    
    // Add paragraph break if not at end
    if (currentChunk.length > 0) {
      currentChunk += '\n\n';
    }
  });
  
  // Add final chunk if it has content
  if (currentChunk.trim().length > 0) {
    const chunkInfo = {
      content: currentChunk.trim(),
      sentences: currentSentences,
      sectionTitle: extractSectionTitle(currentChunk)
    };
    chunks.push(chunkInfo);
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

async function insertEmbedding(client, content, embedding, metadata) {
  const query = `
    INSERT INTO documents (content, embedding, source_file, chunk_index, section_title, token_count)
    VALUES ($1, $2, $3, $4, $5, $6)
  `;
  await client.query(query, [
    content, 
    '['+embedding+']', 
    metadata.sourceFile,
    metadata.chunkIndex,
    metadata.sectionTitle,
    metadata.tokenCount
  ]);
}

async function processFile(filePath) {
  const content = await readFile(filePath);
  const chunks = splitTextIntoChunks(content, CHUNK_SIZE, OVERLAP_SENTENCES);
  const fileName = path.basename(filePath);
  
  const client = await pool.connect();
  try {
    for (let i = 0; i < chunks.length; i++) {
      const chunkInfo = chunks[i];
      const embedding = await getEmbedding(chunkInfo.content);
      
      const metadata = {
        sourceFile: fileName,
        chunkIndex: i,
        sectionTitle: chunkInfo.sectionTitle,
        tokenCount: estimateTokenCount(chunkInfo.content)
      };
      
      await insertEmbedding(client, chunkInfo.content, embedding, metadata);
      console.log(`Processed chunk ${i + 1}/${chunks.length} from ${fileName} (${metadata.tokenCount} tokens)`);
    }
    console.log(`Completed file: ${filePath} (${chunks.length} chunks)`);
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