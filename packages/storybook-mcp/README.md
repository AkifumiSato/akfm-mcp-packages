# `@akfm/storybook-mcp`

An MCP server that retrieves accessibility trees and takes screenshots from Storybook Stories.

## Quick Start (Users)

1. If you haven't installed Playwright browsers yet:

```bash
npx playwright install
```

2. Add the MCP server to your Cursor _mcp.json_ or similar configuration:

```json
{
  "mcpServers": {
    "storybook-mcp": {
      "command": "npx",
      "args": ["@akfm/storybook-mcp"]
    }
  }
}
```

## Development Quick Start

1. Install dependencies and build the MCP server:

```bash
npx playwright install
pnpm i
pnpm build
```

2. Add the MCP server to your Cursor _mcp.json_ with local path:

```json
{
  "mcpServers": {
    "storybook-mcp": {
      "command": "node",
      "args": ["/{your-path}/akfm-storybook-mcp/dist/index.js"]
    }
  }
}
```

## MCP Specs

### `get_storybook_a11y_tree`

Retrieves the accessibility tree from a Storybook Story.

**Parameters:**
- `title` (string, required): Story title
  - Example: `MyTest/SomeText`, `Button`
- `storyName` (string, required): Story name
  - Example: `Default`, `Primary`
- `host` (string, optional): Storybook host URL (default: `http://localhost:6006`)
- `timeout` (number, optional): Timeout in milliseconds (default: 30000)

**Example:**
```json
{
  "name": "get_storybook_a11y_tree",
  "arguments": {
    "title": "Button",
    "storyName": "Default",
    "host": "http://localhost:6006",
    "timeout": 30000
  }
}
```

**Output example:**
```
button "Submit"
  text "Submit"
```

### `get_storybook_screenshot`

Takes a screenshot of a Storybook Story.

**Parameters:**
- `title` (string, required): Story title
  - Example: `MyTest/SomeText`, `Button`
- `storyName` (string, required): Story name
  - Example: `Default`, `Primary`
- `host` (string, optional): Storybook host URL (default: `http://localhost:6006`)
- `timeout` (number, optional): Timeout in milliseconds (default: 30000)

**Example:**
```json
{
  "name": "get_storybook_screenshot",
  "arguments": {
    "title": "Button",
    "storyName": "Default",
    "host": "http://localhost:6006",
    "timeout": 30000
  }
}
```

**Output:**
- Text message indicating screenshot completion
- Base64-encoded PNG image data (full page screenshot)