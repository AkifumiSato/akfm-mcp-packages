import { chromium } from "playwright";
import type { ConsoleLog, StorybookParams } from "../types.js";
import { StorybookPageContext } from "./page-context.js";
import { generateStorybookUrl } from "./url-generator.js";

export async function createStorybookPageWithConsoleTracking({
  host,
  title,
  storyName,
  timeout = 30000,
}: StorybookParams): Promise<{
  context: StorybookPageContext;
  logs: ConsoleLog[];
}> {
  const url = generateStorybookUrl(host, title, storyName);
  const browser = await chromium.launch({ headless: true });
  const browserContext = await browser.newContext();
  const page = await browserContext.newPage();
  const logs: ConsoleLog[] = [];

  // Set up console tracking BEFORE navigation
  page.on("console", (msg) => {
    const consoleLog: ConsoleLog = {
      location: msg.location()
        ? {
            columnNumber: msg.location().columnNumber,
            lineNumber: msg.location().lineNumber,
            url: msg.location().url,
          }
        : undefined,
      text: msg.text(),
      timestamp: Date.now(),
      type: msg.type(),
    };
    logs.push(consoleLog);
  });

  try {
    // Navigate to the Storybook iframe
    await page.goto(url, { timeout, waitUntil: "networkidle" });

    // Wait for the story to load
    await page.waitForSelector("body", { timeout });

    return {
      context: new StorybookPageContext(page, browser),
      logs,
    };
  } catch (error) {
    await browser.close();
    throw error;
  }
}
