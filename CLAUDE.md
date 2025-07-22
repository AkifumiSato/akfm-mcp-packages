# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development Commands
- **Install dependencies**: `pnpm i`
- **Build all packages**: `pnpm build` or `pnpm build:packages`
- **Run development (watch mode)**: `pnpm dev`
- **Type checking**: `pnpm typecheck`
- **Linting and formatting**: `pnpm check` (check), `pnpm check:fix` (fix)

### Package-specific Commands
- **Build storybook-mcp**: `cd packages/storybook-mcp && pnpm build`
- **Start storybook-mcp**: `cd packages/storybook-mcp && pnpm start`
- **Run playground Storybook**: `cd playgrounds/storybook && pnpm storybook`

### Testing Commands
The playground has Vitest configured for testing. Tests can be run from the playground directory.

### Prerequisites
- Node.js >= 22
- pnpm >= 10.8.1
- For storybook-mcp development: Playwright browsers (`npx playwright install`)

## Architecture

This is a TypeScript monorepo for MCP (Model Context Protocol) servers using:
- **pnpm workspaces** with Turbo for build orchestration
- **Biome** for linting/formatting (not Prettier/ESLint)
- **TypeScript** throughout the codebase

### Repository Structure
```
packages/          # MCP server packages (publishable)
  storybook-mcp/   # Main MCP server for Storybook interaction
playgrounds/       # Development and testing environments
  storybook/       # Example Storybook setup for testing
```

### Key Package: @akfm/storybook-mcp
The primary MCP server that provides tools to:
- `get_storybook_a11y_tree`: Extract accessibility trees from Storybook stories
- `get_storybook_screenshot`: Capture screenshots of Storybook stories

**Important Implementation Details:**
- Uses Playwright for browser automation
- Requires running Storybook instance (default: http://localhost:6006)
- `storyName` parameter must match export constant names, not story object names
- Built as an executable MCP server with shebang (`#!/usr/bin/env node`)

### Dependencies and Tools
- **MCP SDK**: `@modelcontextprotocol/sdk` for server implementation
- **Playwright**: For browser automation and accessibility testing
- **Zod**: For runtime schema validation
- **Axe-core**: For accessibility tree analysis

### Development Workflow
1. Make changes to source files
2. Run `pnpm typecheck` to verify types
3. Run `pnpm check` for linting
4. Run `pnpm build` to compile TypeScript
5. Test MCP server by running it locally or through playground

The playground Storybook serves as a test environment for the MCP server functionality.