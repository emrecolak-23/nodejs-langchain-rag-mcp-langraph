import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const products = [
  { id: 1, name: "Nike Air Max 90", category: "Footwear", brand: "Nike" },
  { id: 2, name: "Nike Pegasus 41", category: "Running", brand: "Nike" },
  { id: 3, name: "Nike Dri-FIT Academy", category: "Apparel", brand: "Nike" },
  { id: 4, name: "Adidas Ultraboost", category: "Running", brand: "Adidas" },
  { id: 5, name: "Nike React Infinity", category: "Running", brand: "Nike" },
  { id: 6, name: "Puma RS-X", category: "Lifestyle", brand: "Puma" },
  { id: 7, name: "Nike Jordan 1", category: "Basketball", brand: "Nike" },
  { id: 8, name: "Nike Mercurial", category: "Football", brand: "Nike" },
  { id: 9, name: "New Balance 574", category: "Lifestyle", brand: "New Balance" },
  { id: 10, name: "Nike Blazer", category: "Lifestyle", brand: "Nike" },
  { id: 11, name: "Nike Air Force 1", category: "Lifestyle", brand: "Nike" },
  { id: 12, name: "Converse Chuck Taylor", category: "Lifestyle", brand: "Converse" },
  { id: 13, name: "Nike Dunk Low", category: "Skateboarding", brand: "Nike" },
  { id: 14, name: "Nike ZoomX Vaporfly", category: "Running", brand: "Nike" },
  { id: 15, name: "Asics Gel-Kayano", category: "Running", brand: "Asics" },
  { id: 16, name: "Nike Tech Fleece", category: "Apparel", brand: "Nike" },
  { id: 17, name: "Nike Alphafly", category: "Running", brand: "Nike" },
  { id: 18, name: "Reebok Classic", category: "Lifestyle", brand: "Reebok" },
  { id: 19, name: "Nike Cortez", category: "Lifestyle", brand: "Nike" },
  { id: 20, name: "Nike Metcon", category: "Training", brand: "Nike" },
  { id: 21, name: "Nike Invincible", category: "Running", brand: "Nike" },
  { id: 22, name: "Nike VaporMax", category: "Lifestyle", brand: "Nike" },
  { id: 23, name: "Nike Air Zoom Tempo", category: "Running", brand: "Nike" },
  { id: 24, name: "Nike SB Dunk", category: "Skateboarding", brand: "Nike" },
  { id: 25, name: "Nike Phantom GT", category: "Football", brand: "Nike" },
  { id: 26, name: "Nike LeBron 21", category: "Basketball", brand: "Nike" },
  { id: 27, name: "Nike Kobe 6", category: "Basketball", brand: "Nike" },
  { id: 28, name: "Nike Air Zoom Pegasus 41", category: "Running", brand: "Nike" },
  { id: 29, name: "Nike Winflo 10", category: "Running", brand: "Nike" },
  { id: 30, name: "Nike Revolution 7", category: "Running", brand: "Nike" },
];

const server = new Server(
  {
    name: "product-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_product",
        description:
          "Get product details by ID. Returns product name, category, and brand. Use this to fetch a product and verify if it matches company offerings.",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "number",
              description: "The product ID to retrieve (e.g., 28)",
            },
          },
          required: ["id"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "get_product": {
      const { id } = request.params.arguments as { id: number };
      const product = products.find((p) => p.id === id);
      if (!product) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                found: false,
                message: `Product with id ${id} not found.`,
              }),
            },
          ],
        };
      }
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              found: true,
              product: {
                id: product.id,
                name: product.name,
                category: product.category,
                brand: product.brand,
              },
            }),
          },
        ],
      };
    }
    default:
      throw new Error(`Unknown tool: ${request.params.name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Product MCP server running on stdio");
}

main();
