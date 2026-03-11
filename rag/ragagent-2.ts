import "dotenv/config";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createAgent, dynamicSystemPromptMiddleware } from "langchain";

const loader = new PDFLoader("./nke.pdf");
const docs = await loader.load();

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

const allSplits = await textSplitter.splitDocuments(docs);
console.log(allSplits.length);

const embedding = new OpenAIEmbeddings({
  model: "text-embedding-3-large",
});

const vectorStore = new MemoryVectorStore(embedding);

await vectorStore.addDocuments(allSplits);

const ragMiddleware = dynamicSystemPromptMiddleware(async (state) => {
  const userMessage = state.messages[0].content;
  const query = typeof userMessage === "string" ? userMessage : "";
  const retrievedDocs = await vectorStore.similaritySearch(query, 2);
  const docsContent = retrievedDocs.map((doc) => doc.pageContent).join("\n\n");
  return `You are a helpful assistant that can answer questions about the provided documents.
  Here is the context:\n\n
  ${docsContent}
  `;
});

const agent = createAgent({
  model: "gpt-4o",
  tools: [],
  middleware: [ragMiddleware],
});

const result = await agent.invoke({
  messages: [
    {
      role: "user",
      content: "When was Nike incorporated?",
    },
  ],
});

console.log(result);
