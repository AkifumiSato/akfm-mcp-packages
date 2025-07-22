import type {
  A11yNode,
  AccessibilityTreeResponse,
  ConsoleLog,
  NetworkRequestsResult,
  StorybookParams,
} from "../types.js";
import { convertAXNodesToA11yTree } from "./accessibility-tree.js";
import { createStorybookPageWithConsoleTracking } from "./console-logs.js";
import {
  createStorybookPageWithNetworkTracking,
  summarizeNetworkRequests,
} from "./network-tracking.js";
import { createStorybookPage } from "./page-context.js";

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
  const { context, requests } =
    await createStorybookPageWithNetworkTracking(params);

  await using _ = context;

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
  const { context, logs } =
    await createStorybookPageWithConsoleTracking(params);

  await using _ = context;

  // Wait a bit more to capture any additional console logs
  await context.page.waitForTimeout(1000);

  return logs;
}
