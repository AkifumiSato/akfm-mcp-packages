#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { formatA11yResults } from "./formatter.js";
import {
  getStorybookA11yTree,
  getStorybookNetworkRequests,
  getStorybookScreenshot,
} from "./storybook/index.js";

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
      const a11yResults = await getStorybookA11yTree({
        host,
        storyName,
        timeout,
        title,
      });
      const formattedResults = formatA11yResults(a11yResults);

      return {
        content: [
          {
            text: `Accessibility analysis for ${title}/${storyName}:\n\n${formattedResults}`,
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
      const screenshot = await getStorybookScreenshot({
        host,
        storyName,
        timeout,
        title,
      });
      const base64Screenshot = screenshot.toString("base64");

      return {
        content: [
          {
            text: `Screenshot captured for ${title}/${storyName}`,
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

server.registerTool(
  "get_storybook_network_requests",
  {
    description: "Track network requests during Storybook story loading",
    inputSchema: StorybookArgsSchema,
  },
  async ({
    host = "http://localhost:6006",
    timeout = 30000,
    title,
    storyName,
  }) => {
    try {
      const networkResult = await getStorybookNetworkRequests({
        host,
        storyName,
        timeout,
        title,
      });

      const requestsText = networkResult.requests
        .map((req) => {
          const duration = req.responseTime
            ? `${Math.round(req.responseTime - req.requestTime)}ms`
            : "N/A";
          const statusInfo =
            req.status === "finished"
              ? `${req.statusCode}`
              : req.status === "failed"
                ? `Failed: ${req.errorText}`
                : "Loading";
          return `${req.method} ${req.url} - ${statusInfo} (${duration}) [${req.resourceType || "unknown"}]`;
        })
        .join("\n");

      const summaryText = `Summary: ${networkResult.summary.total} total requests
- Finished: ${networkResult.summary.finished}
- Failed: ${networkResult.summary.failed}
- Loading: ${networkResult.summary.loading}`;

      return {
        content: [
          {
            text: `Network requests for ${title}/${storyName}:\n\n${summaryText}\n\nRequests:\n${requestsText}`,
            type: "text" as const,
          },
          {
            text: `Raw network data:\n\n${JSON.stringify(networkResult, null, 2)}`,
            type: "text" as const,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            text: `Error tracking network requests: ${error}`,
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
