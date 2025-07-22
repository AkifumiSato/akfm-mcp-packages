import type { A11yNode, AXNode } from "../types.js";

export function convertAXNodesToA11yTree(nodes: AXNode[]): A11yNode {
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
