import { convertAXNodesToA11yTree } from "./playwright/accessibility-tree.js";
import { createStorybookPageWithConsoleTracking } from "./playwright/console-logs.js";
import {
  createStorybookPageWithNetworkTracking,
  summarizeNetworkRequests,
} from "./playwright/network-tracking.js";
import { createStorybookPage } from "./playwright/page-context.js";
import type {
  A11yNode,
  AccessibilityTreeResponse,
  ConsoleLog,
  NetworkRequestsResult,
  StorybookParams,
} from "./types.js";

export async function getStorybookA11yTree(
  params: StorybookParams,
): Promise<A11yNode> {
  await using context = await createStorybookPage(params);

  // CDP セッションを取得してAccessibilityドメインのコマンドを実行
  const client = await context.page.context().newCDPSession(context.page);
  const response = (await client.send(
    "Accessibility.getFullAXTree",
  )) as AccessibilityTreeResponse;

  // AXNode配列をA11yNodeツリーに変換
  return convertAXNodesToA11yTree(response.nodes);
}

export async function getStorybookScreenshot(
  params: StorybookParams,
): Promise<Buffer> {
  await using context = await createStorybookPage(params);

  // Take screenshot
  return await context.page.screenshot({
    fullPage: true,
    type: "png",
  });
}

export async function getStorybookNetworkRequests(
  params: StorybookParams,
): Promise<NetworkRequestsResult> {
  const result = await createStorybookPageWithNetworkTracking(params);
  await using context = result.context;
  const { requests } = result;

  // Wait a bit more to capture any additional network requests
  await context.page.waitForTimeout(1000);

  // Convert Map to array and calculate summary
  const requestsList = Array.from(requests.values());
  const summary = summarizeNetworkRequests(requestsList);

  return {
    requests: requestsList,
    summary,
  };
}

export async function getStorybookConsoleLogs(
  params: StorybookParams,
): Promise<ConsoleLog[]> {
  const result = await createStorybookPageWithConsoleTracking(params);
  await using context = result.context;
  const { logs } = result;

  // Wait a bit more to capture any additional console logs
  await context.page.waitForTimeout(1000);

  return logs;
}
