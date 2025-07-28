#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { componentHandlers } from './handlers/components.js';
import { ComponentRegistry } from './registry/loader.js';
import { iconHandlers } from './handlers/icons.js';
import { IconRegistry } from './icons/registry.js';

const server = new Server(
  {
    name: 'wireui-mcp-server',
    version: '1.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Initialize registries
const componentRegistry = new ComponentRegistry();
const iconRegistry = new IconRegistry();

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'tallui_list_components',
        description: 'List all available WireUI components',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'Filter by category (optional)',
            },
          },
        },
      },
      {
        name: 'tallui_get_component',
        description: 'Get detailed information about a specific component',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Component name (e.g., "button", "modal")',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'tallui_search_components',
        description: 'Search components by keyword',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'tallui_get_component_example',
        description: 'Get usage examples for a component',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Component name',
            },
            exampleIndex: {
              type: 'number',
              description: 'Example index (optional)',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'wireui_list_icons',
        description: 'List all available icons from Heroicons and Phosphor',
        inputSchema: {
          type: 'object',
          properties: {
            library: {
              type: 'string',
              enum: ['heroicons', 'phosphor', 'all'],
              description: 'Filter by icon library',
            },
            search: {
              type: 'string',
              description: 'Search icons by name or tags',
            },
          },
        },
      },
      {
        name: 'wireui_check_icon',
        description: 'Check if an icon exists and get its variants',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Icon name to check',
            },
            library: {
              type: 'string',
              enum: ['heroicons', 'phosphor'],
              description: 'Specific library to check',
            },
            variant: {
              type: 'string',
              description: 'Specific variant to check',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'wireui_find_similar_icons',
        description: 'Find icons similar to a given name (fuzzy search)',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Icon name to search for',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of suggestions (default: 5)',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'wireui_get_icon_example',
        description: 'Get usage examples for an icon',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Icon name',
            },
            library: {
              type: 'string',
              enum: ['heroicons', 'phosphor'],
              description: 'Icon library',
            },
            variant: {
              type: 'string',
              description: 'Specific variant',
            },
          },
          required: ['name', 'library'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'tallui_list_components':
        return await componentHandlers.listComponents(componentRegistry, args as any || {});
      
      case 'tallui_get_component':
        return await componentHandlers.getComponent(componentRegistry, args as any || {});
      
      case 'tallui_search_components':
        return await componentHandlers.searchComponents(componentRegistry, args as any || {});
      
      case 'tallui_get_component_example':
        return await componentHandlers.getComponentExample(componentRegistry, args as any || {});
      
      case 'wireui_list_icons':
        return await iconHandlers.listIcons(iconRegistry, args as any || {});
      
      case 'wireui_check_icon':
        return await iconHandlers.checkIcon(iconRegistry, args as any || {});
      
      case 'wireui_find_similar_icons':
        return await iconHandlers.findSimilarIcons(iconRegistry, args as any || {});
      
      case 'wireui_get_icon_example':
        return await iconHandlers.getIconExample(iconRegistry, args as any || {});
      
      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    throw new McpError(
      ErrorCode.InternalError,
      `Error executing tool ${name}: ${error}`
    );
  }
});

// Initialize registries and start server
async function main() {
  await componentRegistry.loadComponents();
  await iconRegistry.loadIcons();
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('WireUI MCP Server started');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});