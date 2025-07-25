# TALL UI MCP Server

An MCP (Model Context Protocol) server that provides AI tools with deep understanding of TALL stack UI components, focusing on WireUI v2.x components.

## Overview

This MCP server enables AI assistants like Claude to:
- Query WireUI component metadata (props, slots, events)
- Get usage examples with Blade syntax
- Understand Livewire and Alpine.js integrations
- Generate properly structured TALL stack UI code

## Requirements

- Node.js 18+
- Compatible with WireUI v2.4+
- Supports Laravel 10-12, Livewire 3, Tailwind CSS 3-4

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/tall-ui-mcp-server.git
cd tall-ui-mcp-server

# Install dependencies
npm install

# Build the server
npm run build
```

## Usage

### With Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "tall-ui": {
      "command": "node",
      "args": ["/path/to/tall-ui-mcp-server/dist/index.js"]
    }
  }
}
```

### Available Tools

- `tallui_list_components` - List all available components
- `tallui_get_component` - Get detailed component information
- `tallui_search_components` - Search components by keyword
- `tallui_get_component_example` - Get component usage examples

## Development

```bash
# Run in development mode
npm run dev

# Run tests
npm test

# Type check
npm run typecheck

# Test with MCP inspector
npm run inspect
```

## Component Structure

Components are defined as JSON files in `src/components/wireui/`:

```json
{
  "name": "button",
  "category": "actions",
  "wireui_version": "^2.4",
  "props": [...],
  "slots": [...],
  "examples": [...]
}
```

## Adding New Components

1. Create a JSON file in `src/components/wireui/`
2. Follow the schema defined in `src/registry/schema.ts`
3. Include version compatibility, props, examples, and best practices
4. Restart the server to load new components

## Roadmap

- [ ] More WireUI components coverage
- [ ] Component validation tools
- [ ] Form generation helpers
- [ ] Filament components support
- [ ] CLI for metadata generation

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT