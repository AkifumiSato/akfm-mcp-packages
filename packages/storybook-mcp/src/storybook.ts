import kebabCase from "just-kebab-case";
import type { Browser, Page } from "playwright";
import { chromium } from "playwright";
import type {
  A11yNode,
  AccessibilityTreeResponse,
  AXNode,
  NetworkRequest,
  NetworkRequestsResult,
  StorybookParams,
} from "./types.js";

class StorybookPageContext {
  constructor(
    public readonly page: Page,
    private readonly browser: Browser,
  ) {}

  async [Symbol.asyncDispose]() {
    await this.browser.close();
  }
}

async function createStorybookPage({
  host,
  title,
  storyName,
  timeout = 30000,
}: StorybookParams): Promise<StorybookPageContext> {
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

function convertAXNodesToA11yTree(nodes: AXNode[]): A11yNode {
  if (nodes.length === 0) {
    return { children: [], name: "", role: "unknown" };
  }

  const nodeMap = new Map<string, AXNode>();
  for (const node of nodes) {
    nodeMap.set(node.nodeId, node);
  }

  // AXNodeをA11yNodeに変換
  function convertNode(axNode: AXNode): A11yNode {
    const a11yNode: A11yNode = {
      children: [],
      description: axNode.description?.value || undefined,
      name: axNode.name?.value || "",
      role: axNode.role?.value || "unknown",
      value: axNode.value?.value || undefined,
    };

    // 子ノードを再帰的に変換
    if (axNode.childIds && axNode.childIds.length > 0) {
      a11yNode.children = axNode.childIds
        .map((childId: string) => nodeMap.get(childId))
        .filter((child): child is AXNode => child !== undefined)
        .map((child: AXNode) => convertNode(child));
    }

    return a11yNode;
  }

  // ルートノードを見つける（parentIdがないノード）
  const rootNodes = nodes.filter((node) => !node.parentId);

  if (rootNodes.length === 0) {
    // ルートノードが見つからない場合は最初のノードを使用
    const firstNode = nodes[0];
    if (!firstNode) {
      return { children: [], name: "Empty tree", role: "unknown" };
    }
    return convertNode(firstNode);
  }

  const firstRootNode = rootNodes[0];
  if (rootNodes.length === 1 && firstRootNode) {
    return convertNode(firstRootNode);
  }

  // 複数のルートノードがある場合は、仮想ルートを作成
  return {
    children: rootNodes.map((node) => convertNode(node)),
    name: "Document",
    role: "WebArea",
  };
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

async function createStorybookPageWithNetworkTracking({
  host,
  title,
  storyName,
  timeout = 30000,
}: StorybookParams): Promise<{
  context: StorybookPageContext;
  requests: Map<string, NetworkRequest>;
}> {
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
    await page.goto(url, { timeout, waitUntil: "networkidle" });

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
  const summary = {
    failed: requestsList.filter((req) => req.status === "failed").length,
    finished: requestsList.filter((req) => req.status === "finished").length,
    loading: requestsList.filter((req) => req.status === "loading").length,
    total: requestsList.length,
  };

  return {
    requests: requestsList,
    summary,
  };
}

function generateStorybookUrl(
  host: string,
  title: string,
  storyName: string,
): string {
  // Convert title: MyTest/SomeText -> mytest-sometext
  const convertedTitle = title
    .toLowerCase()
    .replace(/\//g, "-")
    .replace(/\s+/g, "");

  // Convert story name from camelCase to kebab-case: MyStoryName -> my-story-name
  const convertedStoryName = kebabCase(storyName);

  // Generate the id: mytest-sometext--my-story-name
  const id = `${convertedTitle}--${convertedStoryName}`;

  return `${host}/iframe.html?globals=&args=&id=${id}&viewMode=story`;
}
