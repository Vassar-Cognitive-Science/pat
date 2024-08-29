import { OpenAIEmbeddings } from "@langchain/openai";
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { config } from "dotenv";
import { ProxyAgent } from "proxy-agent";


// set up environment variables
config({path: '.env.local'});
// First, follow set-up instructions at
// https://js.langchain.com/docs/modules/indexes/vector_stores/integrations/pgvector

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

const pgvectorStore = await PGVectorStore.initialize(
  new OpenAIEmbeddings({
    configuration: {
        httpAgent: new ProxyAgent()
    }
  }),
  db_config
);

await pgvectorStore.addDocuments([
  { pageContent: "what's this", metadata: { a: 2 } },
  { pageContent: "Cat drinks milk", metadata: { a: 1 } },
]);

const results = await pgvectorStore.similaritySearch("water", 1);

console.log(results);

/*
  [ Document { pageContent: 'Cat drinks milk', metadata: { a: 1 } } ]
*/

await pgvectorStore.delete({
  filter: {
    a: 1,
  },
});

const results2 = await pgvectorStore.similaritySearch("water", 1);

console.log(results2);

/*
  [ Document { pageContent: 'what's this', metadata: { a: 2 } } ]
*/

await pgvectorStore.end();