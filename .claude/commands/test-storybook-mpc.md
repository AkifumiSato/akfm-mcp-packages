---
description: "storybook-mcpが期待通り動作しているか確認します。"
---

storybook-mcpが期待通り動作しているか確認します。以下のテストを実施し、失敗したら即座にユーザーへ失敗原因をフィードバックしてください。全て成功したら、「✅Storybook MCPは期待通り動作しているようです」と出力してください。

## テスト準備

- `packages/storybook-mcp`にて、`pnpm build`を実行してください。
- `http://localhost:6006/iframe.html?globals=&id=product--default&viewMode=story`へfetchしてアクセスできることを確認してください。アクセスできない場合、ユーザーへStorybookの起動を促してください。

## テスト

1. `playground/storybook/src/components/product.stories.tsx`のAOMが取得できるか
2. `playground/storybook/src/components/product.stories.tsx`のネットワークリクエストが取得できるか、また`https://dummyjson.com/products/1`がリクエストに含まれているかt
