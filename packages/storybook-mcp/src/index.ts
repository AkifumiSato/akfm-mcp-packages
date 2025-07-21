import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  type CallToolRequest,
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { formatA11yResults } from "./formatter.js";
import {
  generateStorybookUrl,
  getStorybookA11yTree,
  getStorybookScreenshot,
} from "./storybook.js";

const server = new Server(
  {
    name: "storybook-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

const tools: Tool[] = [
  {
    description: "Get accessibility tree from Storybook URL",
    inputSchema: {
      properties: {
        host: {
          default: "http://localhost:6006",
          description: "Storybook host URL (e.g., http://localhost:6006)",
          type: "string",
        },
        storyName: {
          description:
            "Story export constant name (e.g., Default, Primary) - NOT the story object's name property",
          type: "string",
        },
        timeout: {
          default: 30000,
          description: "Timeout in milliseconds (default: 30000)",
          type: "number",
        },
        title: {
          description: "Story title (e.g., MyTest/SomeText)",
          type: "string",
        },
      },
      required: ["title", "storyName"],
      type: "object",
    },
    name: "get_storybook_a11y_tree",
  },
  {
    description: "Take a screenshot of a Storybook story",
    inputSchema: {
      properties: {
        host: {
          default: "http://localhost:6006",
          description: "Storybook host URL (e.g., http://localhost:6006)",
          type: "string",
        },
        storyName: {
          description:
            "Story export constant name (e.g., Default, Primary) - NOT the story object's name property",
          type: "string",
        },
        timeout: {
          default: 30000,
          description: "Timeout in milliseconds (default: 30000)",
          type: "number",
        },
        title: {
          description: "Story title (e.g., MyTest/SomeText)",
          type: "string",
        },
      },
      required: ["title", "storyName"],
      type: "object",
    },
    name: "get_storybook_screenshot",
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(
  CallToolRequestSchema,
  async (request: CallToolRequest) => {
    const { name, arguments: args } = request.params;

    if (name === "get_storybook_a11y_tree") {
      const {
        host,
        title,
        storyName,
        timeout = 30000,
      } = args as {
        host: string;
        title: string;
        storyName: string;
        timeout?: number;
      };

      try {
        const url = generateStorybookUrl(
          host || "http://localhost:6006",
          title,
          storyName,
        );
        const a11yResults = await getStorybookA11yTree(url, timeout);
        const formattedResults = formatA11yResults(a11yResults);

        return {
          content: [
            {
              text: `Accessibility analysis for ${title}/${storyName} (${url}):\n\n${formattedResults}`,
              type: "text",
            },
            {
              text: `Raw accessibility tree data:\n\n${JSON.stringify(a11yResults, null, 2)}`,
              type: "text",
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              text: `Error getting accessibility analysis: ${error}`,
              type: "text",
            },
          ],
          isError: true,
        };
      }
    }

    if (name === "get_storybook_screenshot") {
      const {
        host,
        title,
        storyName,
        timeout = 30000,
      } = args as {
        host: string;
        title: string;
        storyName: string;
        timeout?: number;
      };

      try {
        const url = generateStorybookUrl(
          host || "http://localhost:6006",
          title,
          storyName,
        );
        const screenshot = await getStorybookScreenshot(url, timeout);

        // Convert Buffer to base64 string
        const base64Screenshot = screenshot.toString("base64");

        return {
          content: [
            {
              text: `Screenshot captured for ${title}/${storyName} (${url})`,
              type: "text",
            },
            {
              data: base64Screenshot,
              mimeType: "image/png",
              type: "image",
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              text: `Error taking screenshot: ${error}`,
              type: "text",
            },
          ],
          isError: true,
        };
      }
    }

    throw new Error(`Unknown tool: ${name}`);
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("Storybook MCP Server is running");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
