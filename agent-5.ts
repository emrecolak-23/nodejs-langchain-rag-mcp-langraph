import {
  context,
  createAgent,
  createMiddleware,
  initChatModel,
  tool,
} from "langchain";
import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();
import { MemorySaver } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";

const systemPrompt = `You are an expert weather forecaster who also speaks in humour way.

You have access to two tools:

- get_weather_for_location: use this to get the weather for a specific location
- get_user_location: use this to get the user's location

If a user asks you for the weather, make sure you know the location first. If you can tell from the question that they mean wherever they are, use the get_user_location tool to find their location.`;

const getUserLocation = tool(
  (_, config) => {
    const userId = config.context.user_id;
    // fire database query to get location based on userId
    return userId === "1" ? "Istanbul" : "San Francisco";
  },
  {
    name: "get_user_location",
    description: "Retrieve user information based on User ID",
    schema: z.object({}),
  },
);

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

// if message count is less than 3 --> CheaperModel, but more than 3 --> Advanced Model
const model = await initChatModel("claude-sonnet-4-6", {
  temperature: 0.7,
  timeout: 30,
  max_tokens: 1000,
});

const basicModel = new ChatOpenAI({
  model: "gpt-4o-mini",
});

const dynamicModelSelection = createMiddleware({
  name: "DynamicModelSelection",
  wrapModelCall: (request, handler) => {
    const messageCount = request.messages.length;
    return handler({
      ...request,
      model: messageCount < 3 ? basicModel : model,
    });
  },
});

const config = {
  configurable: {
    thread_id: "1",
  },
  context: {
    user_id: "1",
    db: {},
  },
};

const qaConfig = {
  configurable: {
    thread_id: "2",
  },
  context: {
    user_id: "3",
    db: {},
  },
};

const responseFormat = z.object({
  humour_response: z.string(),
  weather_conditions: z.string(),
});

const checkpointer = new MemorySaver();

const agent = createAgent({
  model: model,
  tools: [getUserLocation, getWeather],
  systemPrompt,
  responseFormat,
  checkpointer,
  middleware: [dynamicModelSelection],
});

const response = await agent.invoke(
  {
    messages: [
      {
        role: "user",
        content: "What is weather outside?",
      },
    ],
  },
  config,
);

const longMessage = response.messages[response.messages.length - 1].content;
console.log(longMessage);

const response2 = await agent.invoke(
  {
    messages: [
      {
        role: "user",
        content: "What location did you tell me about?",
      },
    ],
  },
  config,
);

const longMessage2 = response2.messages[response.messages.length - 1].content;
console.log(longMessage2);

const response3 = await agent.invoke(
  {
    messages: [
      {
        role: "user",
        content: "Suggest me good places visit that location?",
      },
    ],
  },
  config,
);

const longMessage3 = response3.messages[response.messages.length - 1].content;
console.log(longMessage3);

const response4 = await agent.invoke(
  {
    messages: [
      {
        role: "user",
        content: "Suggest me good places visit that location?",
      },
    ],
  },
  qaConfig,
);

const longMessage4 = response4.messages[response.messages.length - 1].content;
console.log(longMessage4);

console.log(response.structuredResponse);
