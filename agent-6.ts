import {
  createAgent,
  llmToolSelectorMiddleware,
  modelFallbackMiddleware,
  summarizationMiddleware,
  tool,
} from "langchain";
import z from "zod";

const searchTool = tool(
  ({ query }) => {
    return `Search results for "${query}": Found 5 articles are returned`;
  },
  {
    name: "search",
    description: "Search the web for information",
    schema: z.object({
      query: z.string(),
    }),
  },
);

const emailTool = tool(
  ({ receipient, subject }) => {
    return `Email sent to ${receipient} with subject "${subject}"`;
  },
  {
    name: "send_email",
    description: "Send an email to someone",
    schema: z.object({
      receipient: z.string(),
      subject: z.string(),
    }),
  },
);

const getWeather = tool(
  ({ city }) => {
    return `The weather in ${city} is sunny`;
  },
  {
    name: "get_weather",
    description: "Get the weather for a given city",
    schema: z.object({
      city: z.string(),
    }),
  },
);

const agent = createAgent({
  model: "claude-sonnet-4-6",
  tools: [searchTool, emailTool, getWeather],
  middleware: [
    modelFallbackMiddleware("gpt-4o", "gpt-4o-mini"),
    summarizationMiddleware({
      model: "claude-sonnet-4-6",
      maxTokensBeforeSummary: 8000,
      messagesToKeep: 20,
    }),
    llmToolSelectorMiddleware({
      model: "gpt-4o-mini",
      maxTools: 2,
    }),
  ],
});

const response = await agent.invoke({
  messages: [
    {
      role: "user",
      content:
        "what is the weather in tokyo and email to colakkemre@gmail.com with subject 'Weather in Tokyo'",
    },
  ],
});

console.log(response);
