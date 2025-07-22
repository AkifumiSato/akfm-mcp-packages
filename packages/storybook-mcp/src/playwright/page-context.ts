import type { Browser, Page } from "playwright";
import { chromium } from "playwright";
import type { StorybookParams } from "../types.js";
import { generateStorybookUrl } from "../url-generator.js";

export class StorybookPageContext {
  constructor(
    public readonly page: Page,
    private readonly browser: Browser,
  ) {}

  async [Symbol.asyncDispose]() {
    await this.browser.close();
  }
}

export async function createStorybookPage(
  params: StorybookParams,
): Promise<StorybookPageContext> {
  const { host, title, storyName, timeout = 30000 } = params;
  const url = generateStorybookUrl(host, title, storyName);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the Storybook iframe
    await page.goto(url, { timeout, waitUntil: "networkidle" });

    // Wait for the story to load
    await page.waitForSelector("body", { timeout });

    return new StorybookPageContext(page, browser);
  } catch (error) {
    await browser.close();
    throw error;
  }
}
