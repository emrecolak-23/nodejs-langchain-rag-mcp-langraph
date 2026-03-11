import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { createAgent } from "langchain";

import dotenv from "dotenv";
dotenv.config();

const client = new MultiServerMCPClient({
  math: {
    transport: "stdio",
    command: "pnpm",
    args: ["run", "mcp"],
  },
});

const mcpTools = await client.getTools();

const agent = createAgent({
  model: "claude-sonnet-4-6",
  tools: [...mcpTools],
});

const response = await agent.invoke({
  messages: [
    {
      role: "user",
      content: "What is 10 + 10?",
    },
  ],
});

console.log(response);
