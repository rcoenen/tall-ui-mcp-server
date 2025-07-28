# WireUI MCP Server

An MCP (Model Context Protocol) server that provides AI tools with deep understanding of WireUI v2.x components and comprehensive icon support for Heroicons and Phosphor Icons.

## What is the TALL Stack?

TALL is a full-stack development solution that combines:
- **T**ailwind CSS - Utility-first CSS framework
- **A**lpine.js - Lightweight JavaScript framework
- **L**aravel - PHP web application framework
- **L**ivewire - Full-stack framework for Laravel

Learn more about TALL: https://github.com/livewire/tallstack.dev

## Overview

This MCP server enables AI assistants like Claude to:
- Query WireUI component metadata (props, slots, events)
- Get usage examples with Blade syntax
- Understand Livewire and Alpine.js integrations
- Generate properly structured TALL stack UI code
- **Check icon availability** across Heroicons and Phosphor libraries
- **Find similar icons** with fuzzy matching for typos
- **Get icon usage examples** with all variants

## Requirements

- Node.js 18+
- Compatible with WireUI v2.4+
- Supports Laravel 10-12, Livewire 3, Tailwind CSS 3 (v4 not supported by WireUI v2)

## Quick Start Guide

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/rcoenen/wireui-mcp-server.git
cd wireui-mcp-server

# Install dependencies
npm install

# Build the server
npm run build
```

### 2. Test with MCP Inspector (Recommended for First-Time Users)

The easiest way to test the server is using the MCP Inspector:

```bash
# Run this command from the project directory
npx @modelcontextprotocol/inspector node dist/index.js
```

This will:
1. Start the MCP Inspector
2. Open your browser automatically
3. Show the Inspector interface

In the browser, you'll see a form. Enter these values:
- **Command**: `node`
- **Arguments**: `/Users/YOUR_USERNAME/Dev/wireui-mcp-server/dist/index.js` (adjust path to match your setup)

Click "Connect" and you should see:
- "Connected" status
- In the console: "Loaded 26 components"
- Available tools in the Tools tab

### 3. Try the Tools

Once connected, test the tools:

1. **List all components**: 
   - Select `tallui_list_components`
   - Click "Run"
   - You should see all 26 WireUI components listed

2. **Get component details**:
   - Select `tallui_get_component`
   - Enter arguments: `{"name": "button"}`
   - Click "Run"

3. **Search components**:
   - Select `tallui_search_components`
   - Enter arguments: `{"query": "form"}`
   - Click "Run"
   - This will return all form-related components

## Using with Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "tall-ui": {
      "command": "node",
      "args": ["/path/to/wireui-mcp-server/dist/index.js"]
    }
  }
}
```

Restart Claude Desktop and the TALL UI tools will be available.

## Available Tools

### Component Tools
- `tallui_list_components` - List all available components
- `tallui_get_component` - Get detailed component information
- `tallui_search_components` - Search components by keyword
- `tallui_get_component_example` - Get component usage examples

### Icon Tools (NEW! v1.1.0)
- `wireui_list_icons` - List all available icons (324 Heroicons, 1000+ Phosphor icons)
- `wireui_check_icon` - Check if an icon exists and get its variants
- `wireui_find_similar_icons` - Find similar icons with fuzzy matching
- `wireui_get_icon_example` - Get usage examples for icons

## WireUI Component Coverage

### Coverage Status: 26/26 (100%) ✅

Based on the official WireUI v2.x component library: https://wireui.dev/components

| Category | Component | Status | Category | Component | Status |
|----------|-----------|--------|----------|-----------|--------|
| **UI Components** | | | **Form Components** | | |
| | Alert | ✅ | | Checkbox | ✅ |
| | Avatar | ✅ | | Color Picker | ✅ |
| | Badge | ✅ | | Currency | ✅ |
| | Button | ✅ | | Datetime Picker | ✅ |
| | Card | ✅ | | Errors | ✅ |
| | Dropdown | ✅ | | Input | ✅ |
| | Icon | ✅ | | Maskable | ✅ |
| | Link | ✅ | | Native Select | ✅ |
| | Modal | ✅ | | Number | ✅ |
| | Table | ✅ | | Password | ✅ |
| | | | | Phone | ✅ |
| | | | | Radio | ✅ |
| | | | | Select | ✅ |
| | | | | Textarea | ✅ |
| | | | | Time Picker | ✅ |
| | | | | Toggle | ✅ |

**Legend:**
- ✅ Implemented
- ❌ Not yet implemented

## Icon Support (NEW! v1.1.0)

### ⚠️ Installation Requirements

The MCP server provides metadata about icons, but **the actual icon packages must be installed separately** in your Laravel project:

```bash
# For Heroicons support
composer require wireui/heroicons

# For Phosphor Icons support
composer require wireui/phosphoricons
```

**Note:** The MCP server tools will remind you about these installation requirements when you use them. Each tool response includes the necessary installation commands.

### Icon Libraries Coverage

| Library | Icons | Variants | Total Combinations |
|---------|-------|----------|-------------------|
| **Heroicons** | 324 | outline, solid, mini.solid | 972 |
| **Phosphor** | 1,000+ | thin, light, regular, bold, fill, duotone | 6,000+ |

### Icon Features

1. **Smart Icon Validation**
   - Checks if icons exist before use
   - Validates variant availability
   - Prevents runtime errors from missing icons

2. **Fuzzy Matching**
   - Finds similar icons when typos occur
   - Suggests alternatives for non-existent icons
   - Example: "usr" → suggests "user", "users"

3. **Usage Examples**
   - Shows correct syntax for each icon library
   - Provides examples for all variants
   - Includes component syntax alternatives

### Example Icon Tool Usage

```typescript
// Check if an icon exists
wireui_check_icon({ name: "user", library: "heroicons" })
// Returns: { exists: true, variants: ["outline", "solid", "mini.solid"] }

// Find similar icons (typo handling)
wireui_find_similar_icons({ name: "usr" })
// Returns suggestions: "user", "users", etc.

// Get usage examples
wireui_get_icon_example({ name: "user", library: "heroicons" })
// Returns Blade syntax examples for all variants
```

## Development

```bash
# Run in development mode
npm run dev

# Run tests
npm test

# Type check
npm run typecheck

# Update icon data
npm run update-icons
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
4. Rebuild with `npm run build`
5. Restart the server to load new components

## Troubleshooting

### "ENOENT: no such file or directory" error
Make sure you're running commands from the project root directory, not from a subdirectory.

### Inspector won't connect
1. Ensure the server is built: `npm run build`
2. Check the path in Arguments matches your actual file location
3. Try using the full absolute path

### Components not loading
Check that JSON files in `src/components/wireui/` are valid JSON format.

## Recent Updates

### July 26, 2025
- 📚 **New Best Practices Guide**: Added comprehensive BEST_PRACTICES_WIREUI.md based on production experience
- ⚠️ **Critical Warnings Added**: Updated component definitions with known issues and workarounds
- 🐛 **Accessibility Fix**: Submitted PR #1087 to WireUI for invalid HTML generation

### July 25, 2025
- ✅ **Complete WireUI v2 Coverage**: All 26 components now implemented!
- 🔧 **Major Fixes**: Updated component specs based on real-world testing
  - Components now use boolean props for colors (e.g., `<x-alert info />` instead of `variant="info"`)
  - Updated all icon names to Heroicons v2 convention
  - Added Tailwind CSS v3 requirement (v4 not supported)
- 📝 **Documentation**: Added CHANGELOG.md and CHANGELOG_FIXES.md for tracking changes

## Important Notes

### 🚨 Critical Production Issues & Solutions
See **[BEST_PRACTICES_WIREUI.md](./BEST_PRACTICES_WIREUI.md)** for detailed solutions to common WireUI issues including:
- Tailwind CSS dynamic class purging in production
- Background colors creating unwanted boxes
- Text alignment and color issues
- Accessibility errors
- Proper configuration techniques

### WireUI v2 Compatibility
This server is specifically designed for WireUI v2.x which requires:
- Tailwind CSS v3 (v4 is NOT compatible)
- Heroicons v2
- Alpine.js v3
- Livewire v3

### Breaking Changes from Previous Versions
If you used earlier versions of this MCP server, note that many components now use boolean props instead of variant strings. See CHANGELOG.md for migration guide.

## Roadmap

- [x] Complete WireUI v2 components coverage ✅
- [ ] Component validation tools
- [ ] Form generation helpers
- [ ] Filament components support
- [ ] CLI for metadata generation
- [ ] Support for WireUI v3 (when released)

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT