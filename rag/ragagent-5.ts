import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { createAgent, tool } from "langchain";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";

import dotenv from "dotenv";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import type { Document } from "@langchain/core/documents";
import { z } from "zod";
dotenv.config();

const pdfPaths = ["./nke.pdf", "./nke2.pdf", "./nke3.pdf"];

const allDocs: Document[] = [];

for (const pdfPath of pdfPaths) {
  const loader = new PDFLoader(pdfPath);
  const docs = await loader.load();
  allDocs.push(...docs);
}

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

const allSplits = await textSplitter.splitDocuments(allDocs);
console.log(allSplits.length);

const embedding = new OpenAIEmbeddings({
  model: "text-embedding-3-large",
});

const vectorStore = new MemoryVectorStore(embedding);

await vectorStore.addDocuments(allSplits);

const retrieve = tool(
  async ({ query }) => {
    const retrievedDocs = await vectorStore.similaritySearch(query, 2);
    const docsContent = retrievedDocs
      .map((doc) => doc.pageContent)
      .join("\n\n");
    return docsContent;
  },
  {
    name: "retrieve",
    description: "Retrieve information from multiple pdf documents",
    schema: z.object({
      query: z.string().describe("The query to retrieve documents for"),
    }),
  },
);

const client = new MultiServerMCPClient({
  product: {
    transport: "stdio",
    command: "pnpm",
    args: ["run", "mcp"],
  },
});

const mcpTools = await client.getTools();

const agent = createAgent({
  model: "claude-sonnet-4-6",
  tools: [...mcpTools, retrieve] as any,
});

const response = await agent.invoke({
  messages: [
    {
      role: "user",
      content:
        "Get product with id 28 and check if that product name match with our Company offerings",
    },
  ],
});

console.log(response);
