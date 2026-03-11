import { createAgent, tool } from "langchain";
import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();

const getWeather = tool(
  (input) => {
    // by getting weather
    return `Its always sunny in ${input.city}`;
  },
  {
    name: "get_weather",
    description: "Get the weather for a given city",
    schema: z.object({
      city: z.string().describe("The city to get the weather for"),
    }),
  },
);

const getTime = tool(
  (input) => {
    return `The current time in ${input.country} is ${new Date().toLocaleTimeString()}`;
  },
  {
    name: "get_time",
    description: "Get current time for a given city",
    schema: z.object({
      country: z.string().describe("The country to get the time for"),
    }),
  },
);

const agent = createAgent({
  model: "claude-sonnet-4-6",
  tools: [getWeather, getTime],
});

const response = await agent.invoke({
  messages: [
    {
      role: "user",
      //   content: "what is weather in istanbul?",
      //   content: "what is time in Istanbul?",
      content: "What is weather and time in Istanbul?",
    },
  ],
});

console.log(response);
// const lastMessageContent =
//   response.messages[response.messages.length - 1].content;

// console.log(lastMessageContent);
