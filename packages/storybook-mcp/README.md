# `@akfm/storybook-mcp`

[![npm version](https://badge.fury.io/js/@akfm%2Fstorybook-mcp.svg)](https://badge.fury.io/js/@akfm%2Fstorybook-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)


An MCP server that provides comprehensive Storybook Story analysis including accessibility trees, screenshots, network request tracking, and console log capture.

## Quick Start (Users)

1. If you haven't installed Playwright browsers yet:

```bash
npx playwright install
```

2. Add the MCP server to your `.cursor/mcp.json`, `.mcp.json`, or similar configuration:

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

> [!NOTE]
> **storyName Parameter**: The `storyName` parameter should be the export constant name from your story file, not the story object's `name` property. 
> 
> For example, if your story file has:
> ```typescript
> export const Default = { ... }
> export const Primary = { ... }
> ```
> 
> Use `"Default"` or `"Primary"` as the `storyName`, not the value of the story's `name` property.

## MCP Specs

### `get_storybook_a11y_tree`

Retrieves the accessibility tree from a Storybook Story.

**Parameters:**
- `title` (string, required): Story title
  - Example: `MyTest/SomeText`, `Button`
- `storyName` (string, required): Story export constant name (NOT the story object's name property)
  - Example: `Default`, `Primary` (these are the names after `export const`)
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
- `storyName` (string, required): Story export constant name (NOT the story object's name property)
  - Example: `Default`, `Primary` (these are the names after `export const`)
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

### `get_storybook_network_requests`

Tracks and captures all network requests made during Storybook Story loading.

**Parameters:**
- `title` (string, required): Story title
  - Example: `MyTest/SomeText`, `Button`
- `storyName` (string, required): Story export constant name (NOT the story object's name property)
  - Example: `Default`, `Primary` (these are the names after `export const`)
- `host` (string, optional): Storybook host URL (default: `http://localhost:6006`)
- `timeout` (number, optional): Timeout in milliseconds (default: 30000)

**Example:**
```json
{
  "name": "get_storybook_network_requests",
  "arguments": {
    "title": "Product",
    "storyName": "Default",
    "host": "http://localhost:6006",
    "timeout": 30000
  }
}
```

**Output:**
- Summary of network activity (total, finished, failed, loading requests)
- Detailed list of all network requests with URLs, HTTP methods, status codes, response times, and resource types
- Raw network data in JSON format

### `get_storybook_console_logs`

Captures all console messages (log, info, warn, error, debug) during Storybook Story loading.

**Parameters:**
- `title` (string, required): Story title
  - Example: `MyTest/SomeText`, `Button`
- `storyName` (string, required): Story export constant name (NOT the story object's name property)
  - Example: `Default`, `Primary` (these are the names after `export const`)
- `host` (string, optional): Storybook host URL (default: `http://localhost:6006`)
- `timeout` (number, optional): Timeout in milliseconds (default: 30000)

**Example:**
```json
{
  "name": "get_storybook_console_logs",
  "arguments": {
    "title": "Product",
    "storyName": "Default",
    "host": "http://localhost:6006",
    "timeout": 30000
  }
}
```

**Output:**
- Summary of console activity by log level (error, warning, info, log, debug)
- Chronological list of all console messages with timestamps and source locations
- Raw console data in JSON format