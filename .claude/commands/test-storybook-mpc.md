---
description: "storybook-mcpが期待通り動作しているか確認します。"
---

storybook-mcpが期待通り動作しているか確認します。以下のテストを実施し、失敗したら即座にユーザーへ失敗原因をフィードバックしてください。全て成功したら、「✅Storybook MCPは期待通り動作しているようです」と出力してください。

## テスト準備

- `storybook-mcp`が呼び出し可能か確認してください。
- 以下の`curl`コマンドでStorybookの起動状態を確認してください。アクセスできない場合、ユーザーへStorybookの起動を促してください。

```sh
curl -s -o /dev/null -w "%{http_code}" "http://localhost:6006/iframe.html?globals=&id=product--default&viewMode=story"
```

## テスト

`playground/storybook/src/components/product.stories.tsx`について、以下を確認してください。

1. AOMが取得できるか
2. ネットワークリクエストが取得できるか、また`https://dummyjson.com/products/1`がリクエストに含まれているか
3. consoleの出力内容を取得できるか、またそれぞれに「Custom Message.」という出力が含まれているか
