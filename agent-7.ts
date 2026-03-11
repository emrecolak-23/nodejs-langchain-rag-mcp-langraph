import { createAgent, piiRedactionMiddleware, tool } from "langchain";
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
  // tools: [searchTool, emailTool, getWeather],
  middleware: [
    piiRedactionMiddleware({
      rules: {
        credit_card: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
        ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
        phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
      },
    }),
  ],
});

const response = await agent.invoke({
  messages: [
    {
      role: "user",
      content: "my credit card is 1234-5678-9012-3456, is this master or visa?",
    },
  ],
});

const response2 = await agent.invoke({
  messages: [
    {
      role: "user",
      content: "my ssn is 123-45-6789, is this valid?",
    },
  ],
});

console.log(response);
