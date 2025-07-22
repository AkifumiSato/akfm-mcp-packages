# akfm-mcp-packages(`@akfm/${name}-mcp`'s)

A monorepo for MCP (Model Context Protocol) servers developed and maintained by `akfm`.

## Overview

This repository contains a collection of MCP servers that provide various functionalities for AI assistants and development tools. Each package is designed to be modular and can be used independently.

## Packages

- **[@akfm/storybook-mcp](./packages/storybook-mcp)** - Comprehensive MCP server for Storybook Story analysis including accessibility trees, screenshots, network tracking, and console logs

## Development

This project uses:
- **pnpm** for package management
- **Turbo** for monorepo build orchestration  
- **Biome** for linting and formatting
- **TypeScript** for type safety

### Getting Started

```bash
# Install dependencies
pnpm i

# Build all packages
pnpm build:packages

# Run type checking
pnpm typecheck

# Lint and format
pnpm check
pnpm check:fix
```

### Project Structure

```
packages/          # MCP server packages
playgrounds/       # Development and testing environments
```

## Requirements

- Node.js >= 22
- pnpm >= 10.8.1

## License

MIT
