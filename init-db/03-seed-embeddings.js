const fs = require('fs').promises;
const path = require('path');
const { OpenAI } = require('openai');
const { Pool } = require('pg');
const { spawn } = require('child_process');

// Configuration from environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const CHUNK_SIZE = parseInt(process.env.CHUNK_SIZE || '2500');
const OVERLAP_SENTENCES = parseInt(process.env.OVERLAP_SENTENCES || '2');
const DATA_PATH = process.env.DATA_PATH || '/app/data';
const DOWNLOAD_DATA = process.env.DOWNLOAD_DATA === 'true';
const PAT_DATA_REPO = process.env.PAT_DATA_REPO || 'https://github.com/Vassar-Cognitive-Science/pat-data.git';

const DB_CONFIG = {
  host: process.env.PGHOST || 'postgres',
  port: parseInt(process.env.PGPORT || '5432'),
  user: process.env.PGUSER || 'pat_user',
  password: process.env.PGPASSWORD || 'pat_password',
  database: process.env.PGDATABASE || 'pat_db'
};

// Initialize OpenAI
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Initialize Postgres connection pool
const pool = new Pool(DB_CONFIG);

async function downloadData() {
  console.log(`Downloading data from ${PAT_DATA_REPO}...`);
  
  return new Promise((resolve, reject) => {
    const gitClone = spawn('git', ['clone', PAT_DATA_REPO, DATA_PATH], {
      stdio: 'inherit'
    });
    
    gitClone.on('close', (code) => {
      if (code === 0) {
        console.log('Data downloaded successfully');
        resolve();
      } else {
        reject(new Error(`Git clone failed with code ${code}`));
      }
    });
    
    gitClone.on('error', (err) => {
      reject(new Error(`Failed to start git clone: ${err.message}`));
    });
  });
}

async function ensureDataExists() {
  try {
    const stats = await fs.stat(DATA_PATH);
    if (stats.isDirectory()) {
      const files = await fs.readdir(DATA_PATH);
      const txtFiles = files.filter(file => path.extname(file).toLowerCase() === '.txt');
      if (txtFiles.length > 0) {
        console.log(`Found existing data directory with ${txtFiles.length} .txt files`);
        return true;
      }
    }
  } catch (err) {
    // Directory doesn't exist
  }
  
  if (DOWNLOAD_DATA) {
    try {
      // Remove existing directory if it exists but is empty
      try {
        await fs.rmdir(DATA_PATH, { recursive: true });
      } catch (err) {
        // Ignore if directory doesn't exist
      }
      
      await downloadData();
      return true;
    } catch (err) {
      console.error('Failed to download data:', err.message);
      return false;
    }
  }
  
  console.log('No data directory found and DOWNLOAD_DATA is not enabled');
  return false;
}

async function getFiles(folderPath) {
  try {
    const files = await fs.readdir(folderPath);
    return files.filter(file => path.extname(file).toLowerCase() === '.txt');
  } catch (err) {
    console.log(`Data directory ${folderPath} not found or empty. Skipping seeding.`);
    return [];
  }
}

async function readFile(filePath) {
  return fs.readFile(filePath, 'utf8');
}

function preprocessText(text) {
  text = text.replace(/\r\n/g, '\n');
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.replace(/[ \t]+/g, ' ');
  text = text.replace(/\n\s*\n/g, '\n\n');
  return text.trim();
}

function extractSectionTitle(text) {
  const lines = text.split('\n');
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    const line = lines[i].trim();
    if (line.length < 100 && (
      line.match(/^[A-Z][^.!?]*$/) ||
      line.match(/^\d+\.?\s+[A-Z]/) ||
      line.match(/^Chapter|Section|Part/i) ||
      line.match(/^[A-Z][a-z]+:/)
    )) {
      return line;
    }
  }
  return null;
}

function estimateTokenCount(text) {
  return Math.ceil(text.length / 4);
}

function splitTextIntoChunks(text, chunkSize, overlapSentences) {
  text = preprocessText(text);
  const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
  const chunks = [];
  let currentChunk = '';
  let currentSentences = [];
  
  paragraphs.forEach(paragraph => {
    const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
    
    sentences.forEach(sentence => {
      sentence = sentence.trim();
      if (!sentence) return;
      
      if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
        const chunkInfo = {
          content: currentChunk.trim(),
          sentences: [...currentSentences],
          sectionTitle: extractSectionTitle(currentChunk)
        };
        chunks.push(chunkInfo);
        
        const overlapStart = Math.max(0, currentSentences.length - overlapSentences);
        currentSentences = currentSentences.slice(overlapStart);
        currentChunk = currentSentences.join(' ') + (currentSentences.length > 0 ? ' ' : '');
      }
      
      currentChunk += sentence + ' ';
      currentSentences.push(sentence);
    });
    
    if (currentChunk.length > 0) {
      currentChunk += '\n\n';
    }
  });
  
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
    input: text,
    model: 'text-embedding-3-large'
  });
  return response.data[0].embedding;
}

async function storeEmbedding(content, embedding, metadata) {
  const client = await pool.connect();
  try {
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
  } finally {
    client.release();
  }
}

async function processFile(filePath) {
  console.log(`Processing file: ${filePath}`);
  const content = await readFile(filePath);
  const chunks = splitTextIntoChunks(content, CHUNK_SIZE, OVERLAP_SENTENCES);
  const fileName = path.basename(filePath);
  
  for (let i = 0; i < chunks.length; i++) {
    const chunkInfo = chunks[i];
    console.log(`  Processing chunk ${i + 1}/${chunks.length} (${chunkInfo.content.length} chars)`);
    
    const embedding = await getEmbedding(chunkInfo.content);
    
    await storeEmbedding(chunkInfo.content, embedding, {
      sourceFile: fileName,
      chunkIndex: i,
      sectionTitle: chunkInfo.sectionTitle,
      tokenCount: estimateTokenCount(chunkInfo.content)
    });
  }
  
  console.log(`Completed processing ${fileName}: ${chunks.length} chunks`);
}

async function checkExistingData() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT COUNT(*) FROM documents');
    const count = parseInt(result.rows[0].count);
    console.log(`Found ${count} existing documents in database`);
    return count;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    console.log('Starting database seeding process...');
    
    // Check if we have OpenAI API key
    if (!OPENAI_API_KEY) {
      console.log('No OPENAI_API_KEY found. Skipping embedding creation.');
      return;
    }
    
    // Check if data already exists in database
    const existingCount = await checkExistingData();
    if (existingCount > 0) {
      console.log('Database already contains data. Skipping seeding to avoid duplicates.');
      console.log('To reseed, drop the documents table and restart the container.');
      return;
    }
    
    // Ensure data exists (download if needed)
    const dataReady = await ensureDataExists();
    if (!dataReady) {
      console.log('No data available for seeding. Database initialized but empty.');
      return;
    }
    
    // Get files to process
    const files = await getFiles(DATA_PATH);
    if (files.length === 0) {
      console.log('No .txt files found for seeding. Database initialized but empty.');
      return;
    }
    
    console.log(`Found ${files.length} files to process`);
    
    // Process each file
    for (const file of files) {
      await processFile(path.join(DATA_PATH, file));
    }
    
    console.log('All files processed successfully!');
    
  } catch (err) {
    console.error('Error in seeding process:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Only run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };