-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table with vector embeddings
CREATE TABLE IF NOT EXISTS documents (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    metadata JSONB,
    embedding vector(768),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS documents_embedding_idx 
ON documents USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index for metadata queries
CREATE INDEX IF NOT EXISTS documents_metadata_idx 
ON documents USING gin (metadata);

-- Function to search similar documents
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(768),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id BIGINT,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
$$;
