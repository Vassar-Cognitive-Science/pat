-- Create the documents table for vector embeddings
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  content TEXT,
  embedding vector(3072),
  source_file TEXT,
  chunk_index INTEGER,
  section_title TEXT,
  token_count INTEGER
);

-- Create an index on the embedding column for faster similarity searches
CREATE INDEX IF NOT EXISTS documents_embedding_idx ON documents 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);