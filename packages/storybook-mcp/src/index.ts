import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { formatA11yResults } from "./formatter.js";
import {
  generateStorybookUrl,
  getStorybookA11yTree,
  getStorybookScreenshot,
} from "./storybook.js";

const server = new McpServer(
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

const StorybookArgsSchema = {
  host: z.string().optional(),
  storyName: z.string(),
  timeout: z.number().optional(),
  title: z.string(),
};

server.registerTool(
  "get_storybook_a11y_tree",
  {
    description: "Get accessibility tree from Storybook URL",
    inputSchema: StorybookArgsSchema,
  },
  async ({
    host = "http://localhost:6006",
    timeout = 30000,
    title,
    storyName,
  }) => {
    try {
      const url = generateStorybookUrl(host, title, storyName);
      const a11yResults = await getStorybookA11yTree(url, timeout);
      const formattedResults = formatA11yResults(a11yResults);

      return {
        content: [
          {
            text: `Accessibility analysis for ${title}/${storyName} (${url}):\n\n${formattedResults}`,
            type: "text" as const,
          },
          {
            text: `Raw accessibility tree data:\n\n${JSON.stringify(a11yResults, null, 2)}`,
            type: "text" as const,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            text: `Error getting accessibility analysis: ${error}`,
            type: "text" as const,
          },
        ],
        isError: true,
      };
    }
  },
);

server.registerTool(
  "get_storybook_screenshot",
  {
    description: "Take a screenshot of a Storybook story",
    inputSchema: StorybookArgsSchema,
  },
  async ({
    host = "http://localhost:6006",
    timeout = 30000,
    title,
    storyName,
  }) => {
    try {
      const url = generateStorybookUrl(host, title, storyName);
      const screenshot = await getStorybookScreenshot(url, timeout);

      const base64Screenshot = screenshot.toString("base64");

      return {
        content: [
          {
            text: `Screenshot captured for ${title}/${storyName} (${url})`,
            type: "text" as const,
          },
          {
            data: base64Screenshot,
            mimeType: "image/png",
            type: "image" as const,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            text: `Error taking screenshot: ${error}`,
            type: "text" as const,
          },
        ],
        isError: true,
      };
    }
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
