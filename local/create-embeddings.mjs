import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { ProxyAgent } from "proxy-agent";
import { config } from "dotenv";

import simpleGit from 'simple-git';

import fs from 'fs';

// set up environment variables
config({path: '.env.local'});

const db_config = {
  postgresConnectionOptions: {
    type: "postgres",
    host: "127.0.0.1",
    port: 5432,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DB
  },
  tableName: "documents",
  columns: {
    idColumnName: "id",
    vectorColumnName: "vector",
    contentColumnName: "content",
    metadataColumnName: "metadata",
  },
};

// Clone the pat-data repo into the local folder
// This should prompt for authentication if needed
const url = `https://github.com/Vassar-Cognitive-Science/pat-data.git`;
const folder = 'pat-data-main';
const download_from_github = false;

if(download_from_github){
  if(fs.existsSync(folder)){
    fs.rmSync(folder, { recursive: true });
  }

  const git = await simpleGit();

  await git.clone(url, folder, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Clone complete');
    }
  });
}

// Create a new directory loader for the pat-data repo
const loader = new DirectoryLoader(folder, {
  ".txt": (path) => new TextLoader(path),
});

// load all the documents in the directory
const docs = await loader.load();

// Create token splits for each document
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 2048,
  chunkOverlap: 512,
});

const docOutput = await splitter.splitDocuments(docs);

// filter out very short documents
const filteredDocs = docOutput.filter((doc) => doc.pageContent.split(" ").length > 50);

//const docOutput_test = docOutput.slice(0, 10);

const pgvectorStore = await PGVectorStore.initialize(
  new OpenAIEmbeddings({
    configuration: {
        httpAgent: new ProxyAgent(),
        model: 'text-embedding-3-large'
    }
  }),
  db_config
);

await pgvectorStore.addDocuments(filteredDocs);

await pgvectorStore.end();



  