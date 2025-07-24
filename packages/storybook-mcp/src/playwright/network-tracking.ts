import { chromium } from "playwright";
import type {
  NetworkRequest,
  NetworkRequestsResult,
  StorybookParams,
} from "../types.js";
import { generateStorybookUrl } from "../url-generator.js";
import { StorybookPageContext } from "./page-context.js";

export async function createStorybookPageWithNetworkTracking(
  params: StorybookParams,
): Promise<{
  context: StorybookPageContext;
  requests: Map<string, NetworkRequest>;
}> {
  const { host, title, storyName, timeout = 30000 } = params;
  const url = generateStorybookUrl(host, title, storyName);
  const browser = await chromium.launch({ headless: true });
  const browserContext = await browser.newContext();
  const page = await browserContext.newPage();
  const requests = new Map<string, NetworkRequest>();

  // Set up network request tracking BEFORE navigation
  page.on("request", (request) => {
    const networkRequest: NetworkRequest = {
      method: request.method(),
      requestId: request.url(),
      requestTime: Date.now(),
      resourceType: request.resourceType(),
      status: "loading",
      url: request.url(),
    };
    requests.set(request.url(), networkRequest);
  });

  page.on("response", (response) => {
    const existingRequest = requests.get(response.url());
    if (existingRequest) {
      const updatedRequest: NetworkRequest = {
        ...existingRequest,
        mimeType: response.headers()["content-type"],
        responseTime: Date.now(),
        status: response.ok() ? "finished" : "failed",
        statusCode: response.status(),
      };
      requests.set(response.url(), updatedRequest);
    }
  });

  page.on("requestfailed", (request) => {
    const existingRequest = requests.get(request.url());
    if (existingRequest) {
      const updatedRequest: NetworkRequest = {
        ...existingRequest,
        errorText: request.failure()?.errorText,
        responseTime: Date.now(),
        status: "failed",
      };
      requests.set(request.url(), updatedRequest);
    }
  });

  try {
    // Navigate to the Storybook iframe
    await page.goto(url, { timeout, waitUntil: "load" });

    // Wait for the story to load
    await page.waitForSelector("body", { timeout });

    return {
      context: new StorybookPageContext(page, browser),
      requests,
    };
  } catch (error) {
    await browser.close();
    throw error;
  }
}

export function summarizeNetworkRequests(
  requests: NetworkRequest[],
): NetworkRequestsResult["summary"] {
  return {
    failed: requests.filter((req) => req.status === "failed").length,
    finished: requests.filter((req) => req.status === "finished").length,
    loading: requests.filter((req) => req.status === "loading").length,
    total: requests.length,
  };
}
