# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` - starts Next.js development server
- **Build**: `npm run build` - creates production build
- **Production server**: `npm start` - runs production server  
- **Linting**: `npm run lint` - runs ESLint with Next.js configuration

## Development Setup

### Quick Start (Recommended)

For the best development experience with hot reload:

1. **Setup**: 
   ```bash
   npm run setup
   # Edit .env.local file with your OpenAI API key
   ```

2. **Start Development**: 
   ```bash
   npm run dev:local
   ```
   This starts PostgreSQL in Docker + Next.js locally with hot reload.

3. **Your app**: Open http://localhost:3000 ✨

### Available Scripts

**Local Development (Hot Reload):**
- `npm run setup` - Creates local environment file
- `npm run dev:local` - Starts database + app with hot reload
- `npm run db:start` - Start only the database
- `npm run db:stop` - Stop the database
- `npm run db:seed` - Seed database with embeddings

**Full Docker (Production-like):**
- `npm run docker:full` - Full Docker setup + seeding
- `npm run docker:prod` - Production deployment

### Development Notes

- **Hot Reload**: ✅ Works perfectly with local development
- **Database**: Runs in Docker on port 5433
- **Environment**: Uses `.env.local` for local development
- **Changes**: Automatically reflected in browser

### Database Management

- **Database initialization**: Automatic setup of pgvector extension and documents table
- **Data persistence**: PostgreSQL data stored in Docker volume `postgres_data`
- **Connection**: Application connects to database via Docker internal network

### Data Seeding

The application requires vector embeddings for RAG functionality. You can seed the database with documents:

1. **Automatic seeding with data download**: 
   ```bash
   docker-compose --profile seeding up seeder
   ```
   This will download data from the pat-data repository and create embeddings

2. **Manual data seeding**: 
   - Place `.txt` files in a `./data` directory
   - Set `DOWNLOAD_DATA=false` in your environment
   - Run: `docker-compose --profile seeding up seeder`

3. **Seeding configuration**:
   - `DOWNLOAD_DATA=true` - Downloads data from GitHub repository
   - `PAT_DATA_REPO` - Repository URL for source documents
   - `CHUNK_SIZE=2500` - Text chunk size for embeddings  
   - `OVERLAP_SENTENCES=2` - Sentence overlap between chunks

4. **Resetting data**: 
   ```bash
   docker-compose down -v && docker-compose up -d
   docker-compose --profile seeding up seeder
   ```

## Architecture Overview

Pat is a Next.js-based chatbot focused on philosophical discussions about cognitive science. The application uses a Retrieval Augmented Generation (RAG) architecture with PostgreSQL vector storage.

### Core Components

**Frontend (app/)**
- `page.tsx` - Main chat interface using Vercel AI SDK's `useChat` hook
- `components/` - Modular UI components (chatmessage, clearbutton, printbutton, sendbutton)
- Uses Tailwind CSS for styling with custom color scheme and typography

**Backend API (app/api/)**
- `message/route.ts` - Main chat endpoint that processes user messages
- `model-config.ts` - OpenAI integration with RAG functionality
- `model-prompts.ts` - System prompts and message processing

### RAG Implementation

The system performs semantic search on each user message:
1. Creates embeddings using OpenAI's `text-embedding-3-large`
2. Queries PostgreSQL with pgvector for similar content using cosine distance (`<=>`)
3. Injects top 3 matching excerpts into system prompt
4. Streams responses using GPT-4o model

### Data Flow

1. User input → embedding generation → vector similarity search → context retrieval
2. System prompt + retrieved context + conversation history → OpenAI API
3. Streaming response back to frontend via Vercel AI SDK

### Key Dependencies

- **Vercel AI SDK** (`ai`) - streaming chat interface and OpenAI integration
- **OpenAI** - embeddings and chat completions
- **PostgreSQL + pgvector** - vector similarity search
- **LangChain** - additional AI tooling (community package)
- **Supabase** - likely used for database hosting

### Local Scripts

The `local/` directory contains scripts for:
- `create-embeddings-v2.js` / `create-embeddings.mjs` - document embedding creation
- `test-pg-vectorstore.mjs` - vector store testing

### Configuration

- Uses proxy agent for OpenAI requests
- Environment variables expected: `OPENAI_API_KEY`, PostgreSQL connection params
- Local storage for chat persistence